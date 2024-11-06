import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";


// POST route to create a debtimport { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }



    const body = await request.json();

  const { accountId, cashAmount, digitalAmount, details, takerName, userId } = body;

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

  // Verify that the account exists
  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    return NextResponse.json(
      { error: "Account not found" },
      { status: 404 }
    );
  }

  try {
    // Start the transaction
    const newDebt = await prisma.$transaction(async (transactionPrisma) => {
      // Create the debt record
      const createdDebt = await transactionPrisma.debt.create({
        data: {
          details: details,
          takerName: takerName,
          userId: userId || null,
          accountId: accountId,
          amountTaken: totalAmount,
          cashAmount: cashAmt,
          digitalAmount: digitalAmt,
          remainingAmount: totalAmount, // Initial remaining amount is the total amount taken
          status: "taken",
        },
      });

      // Update the account balance and cash balance based on the amounts taken
      const newBalance = account.balance - digitalAmt;
      const newCashBalance = account.cashBalance - cashAmt;

      await transactionPrisma.accounts.update({
        where: { id: accountId },
        data: {
          balance: newBalance,
          cashBalance: newCashBalance,
        },
      });

      return createdDebt;
    });

    return NextResponse.json(newDebt, { status: 201 });
  } catch (error: any) {
    console.error("Error creating debt:", error);
    return NextResponse.json(
      { message: "Error registering debt", error: error.message },
      { status: 500 }
    );
  }
}


// GET route to fetch all dsebts with their payments
export async function GET(request: NextRequest) {
  try {
    const debts = await prisma.debt.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payments: {
          select: {
            id: true,
            amountPaid: true,
            paymentDate: true,
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
    return NextResponse.json(debts, { status: 200 });
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { message: "Error fetching debts" },
      { status: 500 }
    );
  }
}
