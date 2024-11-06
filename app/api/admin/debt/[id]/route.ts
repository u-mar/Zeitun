import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// PATCH route to update a debt
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

  const body = await request.json();
  const { cashAmount, digitalAmount, details, takerName, userId } = body;

  // Validate amounts and ensure at least one amount is provided
  const cashAmt = parseFloat(cashAmount) || 0;
  const digitalAmt = parseFloat(digitalAmount) || 0;
  const totalAmount = cashAmt + digitalAmt;

  if (totalAmount <= 0) {
    return NextResponse.json(
      { error: "Total debt amount must be greater than zero" },
      { status: 400 }
    );
  }

  try {
    // Fetch the existing debt
    const existingDebt = await prisma.debt.findUnique({
      where: { id: params.id },
    });

    if (!existingDebt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    // Start the transaction
    const updatedDebt = await prisma.$transaction(async (transactionPrisma) => {
      // Update the debt record
    const updatedDebt = await transactionPrisma.debt.update({
      where: { id: params.id },
      data: {
        details: details,
        takerName: takerName,
        userId: userId || null,
        cashAmount: cashAmt,
        digitalAmount: digitalAmt,
        // Adjust remaining amount
        status: totalAmount > 0 ? "partially_returned" : "returned",
        amountTaken: totalAmount, // Update amount taken
      },
    });

      // Update the account balance and cash balance based on the amounts taken
      const account = await transactionPrisma.accounts.findUnique({
        where: { id: existingDebt.accountId },
      });

      if (!account) {
        throw new Error("Account not found");
      }

      const newBalance =
        account.balance - (digitalAmt - (existingDebt.digitalAmount || 0));
      const newCashBalance =
        account.cashBalance - (cashAmt - (existingDebt.cashAmount || 0));

      await transactionPrisma.accounts.update({
        where: { id: existingDebt.accountId },
        data: {
          balance: newBalance,
          cashBalance: newCashBalance,
        },
      });

      return updatedDebt;
    });

    return NextResponse.json(updatedDebt, { status: 200 });
  } catch (error: any) {
    console.error("Error updating debt:", error);
    return NextResponse.json(
      { message: "Error updating debt", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE route to delete a debt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the debt to adjust the balance or cash balance
    const debt = await prisma.debt.findUnique({
      where: { id: params.id },
    });

    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    // Check if the category is associated with any products
    const associatedPayments = await prisma.debtPayment.findMany({
      where: {
        debtId: params.id,
      },
    });

    if (associatedPayments.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete debt as it is associated with payments" },
        { status: 400 }
      );
    }

    // Fetch the account details
    const account = await prisma.accounts.findUnique({
      where: { id: debt.accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const newBalance = account.balance + (debt.digitalAmount || 0);
    const newCashBalance = account.cashBalance + (debt.cashAmount ?? 0);

    // Update the account balance or cash balance
    await prisma.accounts.update({
      where: { id: debt.accountId },
      data: {
        balance: newBalance,
        cashBalance: newCashBalance,
      },
    });

    // Delete the debt
    await prisma.debt.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Debt deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting debt:", error);
    return NextResponse.json(
      { message: "Error deleting debt", error: error.message },
      { status: 500 }
    );
  }
}
