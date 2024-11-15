import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// POST route to record a payment against a debt
export async function POST(request: NextRequest) {
    if (request.headers.get("content-length") === "0") {
        return NextResponse.json(
            { error: "You have to provide body information" },
            { status: 400 }
        );
    }

    const body = await request.json();

    try {
        // Fetch the debt to ensure it exists and get the current remaining amount
        const debt = await prisma.debt.findUnique({
            where: { id: body.debtId },
        });

        if (!debt) {
            return NextResponse.json({ error: "Debt not found" }, { status: 404 });
        }

        const amountPaid = body.cashAmount + body.digitalAmount;

        // Check if the amount paid is less than or equal to the remaining amount
        if (amountPaid > (debt.remainingAmount || 0)) {
            return NextResponse.json(
                { error: "Amount paid must be less than or equal to the remaining amount" },
                { status: 400 }
            );
        }

        // Calculate the new remaining amount after payment
        const newRemainingAmount = (debt.remainingAmount || 0) - amountPaid;

        // Update debt status based on the remaining amount
        const newStatus =
            newRemainingAmount <= 0 ? "returned" : "partially_returned";
            
        // Start the transaction
        const debtPayment = await prisma.$transaction(async (transactionPrisma) => {
            // Create the debt payment record
            const debtPayment = await transactionPrisma.debtPayment.create({
                data: {
                    debtId: body.debtId,
                    amountPaid,
                    cashAmount: body.cashAmount,
                    digitalAmount: body.digitalAmount,
                },
            });

            // Update the debt with the new remaining amount and status
            await transactionPrisma.debt.update({
                where: { id: body.debtId },
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
            const newBalance = account.balance + (body.digitalAmount || 0);
            const newCashBalance = account.cashBalance + (body.cashAmount || 0);

            await transactionPrisma.accounts.update({
                where: { id: debt.accountId },
                data: {
                    balance: newBalance,
                    cashBalance: newCashBalance,
                },
            });

            return debtPayment;
        });

        return NextResponse.json(debtPayment, { status: 201 });
    } catch (error: any) {
        console.error("Error recording debt payment:", error);
        return NextResponse.json(
            { message: "Error recording payment", error: error.message },
            { status: 500 }
        );
    }
}
