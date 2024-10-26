import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import AuthOptions from "../../../auth/[...nextauth]/AuthOptions";
import prisma from "@/prisma/client";
import { User } from "@prisma/client";

const MAX_RETRIES = 3; // Retry up to 3 times in case of transient errors

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }

  const session = await getServerSession(AuthOptions);

  if (!session) {
    return NextResponse.json(
      { error: "You must be logged in to perform this action" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const userId = (session.user as User).id;

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { items, accountId, type } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Items are required" }, { status: 400 });
  }

  if (!accountId) {
    return NextResponse.json(
      { error: "Account ID is required" },
      { status: 400 }
    );
  }

  if (!type) {
    return NextResponse.json({ error: "Type is required" }, { status: 400 });
  }

  let attempt = 0;
  let success = false;
  let updatedSell;

  while (attempt < MAX_RETRIES && !success) {
    try {
      // Start the transaction and configure timeout
      updatedSell = await prisma.$transaction(
        async (transactionPrisma) => {
          // Fetch the existing sale with account and type
          const existingSell = await transactionPrisma.sell.findUnique({
            where: { id: params.id },
            include: { items: true },
          });

          if (!existingSell) {
            throw new Error(`Sale with ID ${params.id} not found`);
          }

          const oldAccountId = existingSell.accountId;
          const oldTotal = existingSell.total;
          const oldType = existingSell.type;

          // Reverse stock quantities for existing items
          for (const existingItem of existingSell.items) {
            await transactionPrisma.sKU.update({
              where: { id: existingItem.skuId },
              data: {
                stockQuantity: {
                  increment: existingItem.quantity, // Restock old items
                },
              },
            });
          }

          // Delete the old sell items
          await transactionPrisma.sellItem.deleteMany({
            where: { sellId: params.id },
          });

          // Process each new item in the updated sale
          for (const item of items) {
            // Ensure the quantity is greater than zero
            if (item.quantity === 0) {
              throw new Error(`Quantity must be greater than 0.`);
            }

            // Check SKU stock availability
            const sku = await transactionPrisma.sKU.findUnique({
              where: { id: item.skuId },
            });

            if (!sku) {
              throw new Error(`SKU with ID ${item.skuId} not found`);
            }

            if (sku.stockQuantity < item.quantity) {
              throw new Error(
                `Not enough stock for SKU ${sku.sku}. Available: ${sku.stockQuantity}, Requested: ${item.quantity}.`
              );
            }

            // Decrease the SKU stock quantity
            await transactionPrisma.sKU.update({
              where: { id: item.skuId },
              data: {
                stockQuantity: {
                  decrement: item.quantity,
                },
              },
            });

            // Recalculate the total stock quantity for the product
            const updatedSkus = await transactionPrisma.sKU.findMany({
              where: { variant: { productId: item.productId } },
              select: { stockQuantity: true },
            });

            const totalStockQuantity = updatedSkus.reduce(
              (total, sku) => total + sku.stockQuantity,
              0
            );

            // Update the product's stock quantity
            await transactionPrisma.product.update({
              where: { id: item.productId },
              data: { stockQuantity: totalStockQuantity },
            });
          }

          // Calculate new total amount
          const newTotal = items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          );

          // Update the sale with new items and recalculate the total
          const updatedSell = await transactionPrisma.sell.update({
            where: { id: params.id },
            data: {
              accountId: accountId, // Update the accountId
              total: newTotal,
              discount: 0,
              type: type,
              status: body.status,
              items: {
                create: items.map((item) => ({
                  productId: item.productId,
                  price: item.price,
                  quantity: item.quantity,
                  skuId: item.skuId,
                })),
              },
            },
            include: { items: true }, // Include associated items in the response
          });

          // Adjust the account balances
          // Fetch old account
          const oldAccount = await transactionPrisma.accounts.findUnique({
            where: { id: oldAccountId },
          });

          if (!oldAccount) {
            throw new Error(`Old account with ID ${oldAccountId} not found`);
          }

          // Fetch new account if accountId has changed
          let newAccount = oldAccount;
          if (accountId !== oldAccountId) {
            const fetchedAccount = await transactionPrisma.accounts.findUnique({
              where: { id: accountId },
            });
            if (!fetchedAccount) {
              throw new Error(`New account with ID ${accountId} not found`);
            }
            newAccount = fetchedAccount;
          }

          let oldAccountBalance = oldAccount.balance;
          let oldAccountCashBalance = oldAccount.cashBalance;

          let newAccountBalance = newAccount.balance;
          let newAccountCashBalance = newAccount.cashBalance;

          if (accountId === oldAccountId) {
            // Same account
            if (type === oldType) {
              // Same type
              const amountDifference = newTotal - oldTotal;

              if (type === "cash") {
                // Adjust cash balance
                oldAccountCashBalance += amountDifference;
              } else {
                // Adjust digital balance
                oldAccountBalance += amountDifference;
              }
            } else {
              // Different types
              // Subtract oldTotal from oldType balance
              if (oldType === "cash") {
                oldAccountCashBalance -= oldTotal;
              } else {
                oldAccountBalance -= oldTotal;
              }

              // Add newTotal to newType balance
              if (type === "cash") {
                oldAccountCashBalance += newTotal;
              } else {
                oldAccountBalance += newTotal;
              }
            }

            // Update the account balances
            await transactionPrisma.accounts.update({
              where: { id: oldAccountId },
              data: {
                balance: oldAccountBalance,
                cashBalance: oldAccountCashBalance,
              },
            });
          } else {
            // Account has changed
            // Subtract oldTotal from old account's oldType balance
            if (oldType === "cash") {
              oldAccountCashBalance -= oldTotal;
            } else {
              oldAccountBalance -= oldTotal;
            }

            // Update old account
            await transactionPrisma.accounts.update({
              where: { id: oldAccountId },
              data: {
                balance: oldAccountBalance,
                cashBalance: oldAccountCashBalance,
              },
            });

            // Add newTotal to new account's newType balance
            if (type === "cash") {
              newAccountCashBalance += newTotal;
            } else {
              newAccountBalance += newTotal;
            }

            // Update new account
            await transactionPrisma.accounts.update({
              where: { id: accountId },
              data: {
                balance: newAccountBalance,
                cashBalance: newAccountCashBalance,
              },
            });
          }

          return updatedSell;
        },
        {
          maxWait: 15000, // Increase wait time to 15 seconds (default is 2000 ms)
          timeout: 30000, // Increase transaction timeout to 30 seconds (default is 5000 ms)
        }
      );

      success = true; // Transaction was successful
    } catch (error: any) {
      attempt++;
      console.error("Transaction failed, retrying...", error);
      if (attempt >= MAX_RETRIES) {
        return NextResponse.json(
          {
            message: "Transaction failed after multiple retries",
            error: error.message,
          },
          { status: 400 }
        );
      }
    }
  }

  return NextResponse.json(updatedSell, { status: 200 });
}

// DELETE Handler - Delete a sale
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sellId = params.id;
  if (!sellId) {
    return NextResponse.json({ error: "Sell ID is required" }, { status: 400 });
  }

  let attempt = 0;
  let success = false;

  while (attempt < MAX_RETRIES && !success) {
    try {
      // Start transaction with options
      await prisma.$transaction(
        async (transactionPrisma) => {
          // Fetch existing sell items inside the transaction
          const existingSell = await transactionPrisma.sell.findUnique({
            where: { id: sellId },
            include: { items: true },
          });

          if (!existingSell) {
            throw new Error("Sell not found");
          }

          // Adjust account balances
          const accountId = existingSell.accountId;
          const type = existingSell.type;
          const totalAmount = existingSell.total;

          const account = await transactionPrisma.accounts.findUnique({
            where: { id: accountId },
          });

          if (!account) {
            throw new Error(`Account with ID ${accountId} not found`);
          }

          let newBalance = account.balance;
          let newCashBalance = account.cashBalance;

          if (type === "cash") {
            newCashBalance -= totalAmount;
          } else {
            newBalance -= totalAmount;
          }

          // Update the account
          await transactionPrisma.accounts.update({
            where: { id: accountId },
            data: {
              balance: newBalance,
              cashBalance: newCashBalance,
            },
          });

          // Update the stock quantity for each item
          for (const item of existingSell.items) {
            const sku = await transactionPrisma.sKU.findUnique({
              where: { id: item.skuId },
              include: {
                variant: {
                  select: {
                    productId: true,
                  },
                },
              },
            });

            if (!sku) {
              throw new Error(`SKU with ID ${item.skuId} not found`);
            }

            // Increment the SKU stock quantity
            if (item.quantity === 0) {
              throw new Error(
                `Quantity for SKU ${sku.sku} must be greater than 0.`
              );
            }

            await transactionPrisma.sKU.update({
              where: { id: sku.id },
              data: {
                stockQuantity: {
                  increment: item.quantity,
                },
              },
            });

            const productId = sku.variant.productId;

            // Recalculate the total stock quantity for the product
            const updatedSkus = await transactionPrisma.sKU.findMany({
              where: {
                variant: { productId: productId },
              },
              select: { stockQuantity: true },
            });

            const totalStockQuantity = updatedSkus.reduce(
              (total, sku) => total + sku.stockQuantity,
              0
            );

            // Update the product's stock quantity
            await transactionPrisma.product.update({
              where: { id: productId },
              data: { stockQuantity: totalStockQuantity },
            });
          }

          // Delete the sell and its associated items
          await transactionPrisma.sell.delete({
            where: { id: sellId },
          });
        },
        {
          maxWait: 15000, // Increase wait time to 15 seconds (default is 2000 ms)
          timeout: 30000, // Increase transaction timeout to 30 seconds (default is 5000 ms)
        }
      );

      success = true; // Transaction was successful
    } catch (error: any) {
      attempt++;
      console.error("Transaction failed, retrying...", error);
      if (attempt >= MAX_RETRIES) {
        return NextResponse.json(
          {
            message: "Transaction failed after multiple retries",
            error: error.message,
          },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json(
    { message: "Sell deleted successfully" },
    { status: 200 }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sellId = params.id;
  if (!sellId) {
    return NextResponse.json({ error: "Sell ID is required" }, { status: 400 });
  }

  try {
    const sell = await prisma.sell.findUnique({
      where: { id: sellId },
      include: {
        items: {
          select: {
            sku: {
              select: {
                size: true,
                variant: {
                  select: {
                    color: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!sell) {
      return NextResponse.json({ error: "Sell not found" }, { status: 404 });
    }

    return NextResponse.json(sell, { status: 200 });
  } catch (error) {
    console.error("Error retrieving sell:", error);
    return NextResponse.json(
      { message: "Error retrieving sell" },
      { status: 500 }
    );
  }
}
