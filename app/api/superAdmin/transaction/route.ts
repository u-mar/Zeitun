import { NextRequest, NextResponse } from "next/server";
import { transactionSchema } from "@/app/validationSchema/transactionSchema";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import AuthOptions from "../../auth/[...nextauth]/AuthOptions";
import { User } from "@prisma/client";


export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }

  const session = await getServerSession(AuthOptions);
  const userId = (session?.user as User).id;
  const body = await request.json();
  const validation = transactionSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    // Fetch the account details based on accountId to get the current balance and currency
    const account = await prisma.accounts.findUnique({
      where: { id: body.accountId },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Automatically set amountType based on the account's currency
    const amountType = account.account === "KES" ? "KES" : "USD";

    // Initialize balances to be updated
    let newBalance = account.balance;
    let newCashBalance = account.cashBalance;

    // If it's an exchange transaction
    if (body.isExchange) {
      if (body.exchangeType === "withdrawal") {
        // Withdrawal: Decrease cash balance and increase digital balance
        newCashBalance -= body.amount;
        newBalance += body.amount;
      } else if (body.exchangeType === "deposit") {
        // Deposit: Increase cash balance and decrease digital balance
        newCashBalance += body.amount;
        newBalance -= body.amount;
      } else {
        return NextResponse.json(
          { error: "Invalid exchange type. Must be 'withdrawal' or 'deposit'." },
          { status: 400 }
        );
      }
    } else {
      // Regular transaction logic
      if (body.type === "cash") {
        // Adjust cashBalance if the transaction type is cash
        if (body.acc === "Cr") {
          // Credit: Increase cash balance
          newCashBalance += body.amount;
        } else if (body.acc === "Dr") {
          // Debit: Decrease cash balance
          newCashBalance -= body.amount;
        } else {
          return NextResponse.json(
            { error: "Invalid transaction type (acc). Must be 'Cr' or 'Dr'." },
            { status: 400 }
          );
        }
      } else {
        // Adjust regular balance if the transaction type is not cash
        if (body.acc === "Cr") {
          // Credit: Increase balance
          newBalance += body.amount;
        } else if (body.acc === "Dr") {
          // Debit: Decrease balance
          newBalance -= body.amount;
        } else {
          return NextResponse.json(
            { error: "Invalid transaction type (acc). Must be 'Cr' or 'Dr'." },
            { status: 400 }
          );
        }
      }
    }

    // Create the transaction with the exchange or regular details
    const newTransaction = await prisma.transaction.create({
      data: {
        userId: userId,
        accountId: body.accountId,
        categoryId: body.categoryId,
        details: body.details,
        tranDate: body.tranDate,
        type: body.type || null,
        amount: body.amount,
        amountType,
        acc: body.acc || null,
        ref: body.ref,
        isExchange: body.isExchange || false, // Handle exchange flag
        exchangeType: body.exchangeType || null, // Exchange transaction: exChange (optional)
        senderName: body.senderName || null, // Optional sender name
        senderPhone: body.senderPhone || null, // Optional sender phone
        receiverName: body.receiverName || null, // Optional receiver name
        receiverPhone: body.receiverPhone || null, // Optional receiver phone
      },
    });

    // Update the account balance and cash balance with the new balance
    await prisma.accounts.update({
      where: { id: body.accountId },
      data: {
        balance: newBalance,
        cashBalance: newCashBalance, // Update cashBalance if applicable
      },
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { message: "Error registering transaction", error: error.message },
      { status: 500 }
    );
  }
}



export async function GET(request: NextRequest) {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        account: {
          select: {
            id: true,
            account: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { message: "Error fetching transaction files" },
      { status: 500 }
    );
  }
}
