import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// PATCH route to update a payment against a debt
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

  try {
    // Fetch the existing debt payment
    const existingDebtPayment = await prisma.debtPayment.findUnique({
      where: { id: params.id },
    });

    if (!existingDebtPayment) {
      return NextResponse.json(
        { error: "Debt payment not found" },
        { status: 404 }
      );
    }

    // Fetch the debt to ensure it exists and get the current remaining amount
    const debt = await prisma.debt.findUnique({
      where: { id: existingDebtPayment.debtId },
    });

    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }
    const amountPaid = body.cashAmount + body.digitalAmount;
    
    // Check if the amount paid is less than or equal to the remaining amount
    if (amountPaid > (debt.remainingAmount || 0)) {
      return NextResponse.json(
        {
          error:
            "Amount paid must be less than or equal to the remaining amount",
        },
        { status: 400 }
      );
    }
    // Calculate the new remaining amount after updating the payment
    const newRemainingAmount =
      (debt.remainingAmount || 0) + existingDebtPayment.amountPaid - amountPaid;

    // Update debt status based on the remaining amount
    const newStatus =
      newRemainingAmount <= 0 ? "returned" : "partially_returned";

    // Start the transaction
    const updatedDebtPayment = await prisma.$transaction(
      async (transactionPrisma) => {
        // Update the debt payment record
        const updatedDebtPayment = await transactionPrisma.debtPayment.update({
          where: { id: params.id },
          data: {
            amountPaid,
            cashAmount: body.cashAmount,
            digitalAmount: body.digitalAmount,
          },
        });

        // Update the debt with the new remaining amount and status
        await transactionPrisma.debt.update({
          where: { id: existingDebtPayment.debtId },
          data: {
            remainingAmount: newRemainingAmount,
            status: newStatus,
          },
        });

        // Fetch the account details
        const account = await transactionPrisma.accounts.findUnique({
          where: { id: debt.accountId },
        });

        if (!account) {
          throw new Error("Account not found");
        }

        // Update the account balance and cash balance based on the payment amounts
        const newBalance =
          account.balance -
          (existingDebtPayment.digitalAmount || 0) +
          (body.digitalAmount || 0);
        const newCashBalance =
          account.cashBalance -
          (existingDebtPayment.cashAmount || 0) +
          (body.cashAmount || 0);

        await transactionPrisma.accounts.update({
          where: { id: debt.accountId },
          data: {
            balance: newBalance,
            cashBalance: newCashBalance,
          },
        });

        return updatedDebtPayment;
      }
    );

    return NextResponse.json(updatedDebtPayment, { status: 200 });
  } catch (error: any) {
    console.error("Error updating debt payment:", error);
    return NextResponse.json(
      { message: "Error updating payment", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE route to delete a debt payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the debt payment to adjust the balance or cash balance
    const debtPayment = await prisma.debtPayment.findUnique({
      where: { id: params.id },
    });

    if (!debtPayment) {
      return NextResponse.json(
        { error: "Debt payment not found" },
        { status: 404 }
      );
    }

    // Fetch the debt to update the remaining amount and status
    const debt = await prisma.debt.findUnique({
      where: { id: debtPayment.debtId },
    });

    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    const newRemainingAmount =
      (debt.remainingAmount || 0) + debtPayment.amountPaid;
    const newStatus =
      newRemainingAmount > 0 ? "partially_returned" : "returned";

    // Fetch the account details
    const account = await prisma.accounts.findUnique({
      where: { id: debt.accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const newBalance = account.balance - (debtPayment.digitalAmount || 0);
    const newCashBalance = account.cashBalance - (debtPayment.cashAmount || 0);

    // Start the transaction
    await prisma.$transaction(async (transactionPrisma) => {
      // Update the debt with the new remaining amount and status
      await transactionPrisma.debt.update({
        where: { id: debtPayment.debtId },
        data: {
          remainingAmount: newRemainingAmount,
          status: newStatus,
        },
      });

      // Update the account balance and cash balance
      await transactionPrisma.accounts.update({
        where: { id: debt.accountId },
        data: {
          balance: newBalance,
          cashBalance: newCashBalance,
        },
      });

      // Delete the debt payment
      await transactionPrisma.debtPayment.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json(
      { message: "Debt payment deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting debt payment:", error);
    return NextResponse.json(
      { message: "Error deleting debt payment", error: error.message },
      { status: 500 }
    );
  }
}

// GET route to fetch a debt payment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const debt = await prisma.debtPayment.findMany({
      where: { debtId: params.id },
    });

    if (!debt) {
      return NextResponse.json({ error: "Debt  not found" }, { status: 404 });
    }
    return NextResponse.json(debt, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching debt payment:", error);
    return NextResponse.json(
      { message: "Error fetching debt payment", error: error.message },
      { status: 500 }
    );
  }
}
