import { NextRequest, NextResponse } from "next/server";
import { accountSwapSchema } from "@/app/validationSchema/accountSwapSchema";
import prisma from "@/prisma/client";

// PATCH: Update an existing AccountSwap
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
  const validation = accountSwapSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const {
    fromAccountId,
    toAccountId,
    fromAmount,
    fromCashAmount = 0,
    fromDigitalAmount = 0,
    toAmount,
    toCashAmount = 0,
    toDigitalAmount = 0,
    exchangeRate,
    details,
  } = body;

  // Validate that the sum matches
  if (fromCashAmount + fromDigitalAmount !== fromAmount) {
    return NextResponse.json(
      {
        error:
          "fromAmount must equal sum of fromCashAmount and fromDigitalAmount",
      },
      { status: 400 }
    );
  }

  if (toCashAmount + toDigitalAmount !== toAmount) {
    return NextResponse.json(
      { error: "toAmount must equal sum of toCashAmount and toDigitalAmount" },
      { status: 400 }
    );
  }

  try {
    const existingSwap = await prisma.accountSwap.findUnique({
      where: { id: params.id },
    });

    if (!existingSwap) {
      return NextResponse.json(
        { error: "Account swap not found" },
        { status: 404 }
      );
    }

    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // Revert balances from the existing swap

      // Revert fromAccount balances
      let revertFromAccountData: any = {};

      if (existingSwap.fromCashAmount && existingSwap.fromCashAmount > 0) {
        revertFromAccountData.cashBalance = {
          increment: existingSwap.fromCashAmount,
        };
      }

      if (
        existingSwap.fromDigitalAmount &&
        existingSwap.fromDigitalAmount > 0
      ) {
        revertFromAccountData.balance = {
          increment: existingSwap.fromDigitalAmount,
        };
      }

      await prisma.accounts.update({
        where: { id: existingSwap.fromAccountId },
        data: revertFromAccountData,
      });

      // Revert toAccount balances
      let revertToAccountData: any = {};

      if (existingSwap.toCashAmount && existingSwap.toCashAmount > 0) {
        revertToAccountData.cashBalance = {
          decrement: existingSwap.toCashAmount,
        };
      }

      if (existingSwap.toDigitalAmount && existingSwap.toDigitalAmount > 0) {
        revertToAccountData.balance = {
          decrement: existingSwap.toDigitalAmount,
        };
      }

      await prisma.accounts.update({
        where: { id: existingSwap.toAccountId },
        data: revertToAccountData,
      });

      // Update the swap record
      await prisma.accountSwap.update({
        where: { id: params.id },
        data: {
          fromAccountId,
          toAccountId,
          fromAmount,
          fromCashAmount: fromCashAmount || null,
          fromDigitalAmount: fromDigitalAmount || null,
          toAmount,
          toCashAmount: toCashAmount || null,
          toDigitalAmount: toDigitalAmount || null,
          exchangeRate,
          details: details || "",
        },
      });

      // Apply balances from the updated swap

      // Update fromAccount balances
      let updatedFromAccountData: any = {};

      if (fromCashAmount > 0) {
        updatedFromAccountData.cashBalance = {
          decrement: fromCashAmount,
        };
      }

      if (fromDigitalAmount > 0) {
        updatedFromAccountData.balance = {
          decrement: fromDigitalAmount,
        };
      }

      await prisma.accounts.update({
        where: { id: fromAccountId },
        data: updatedFromAccountData,
      });

      // Update toAccount balances
      let updatedToAccountData: any = {};

      if (toCashAmount > 0) {
        updatedToAccountData.cashBalance = {
          increment: toCashAmount,
        };
      }

      if (toDigitalAmount > 0) {
        updatedToAccountData.balance = {
          increment: toDigitalAmount,
        };
      }

      await prisma.accounts.update({
        where: { id: toAccountId },
        data: updatedToAccountData,
      });
    });

    return NextResponse.json(
      { message: "Account swap updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating account swap:", error);
    return NextResponse.json(
      { message: "Error updating account swap", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete an AccountSwap
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingSwap = await prisma.accountSwap.findUnique({
      where: { id: params.id },
    });

    if (!existingSwap) {
      return NextResponse.json(
        { error: "Account swap not found" },
        { status: 404 }
      );
    }

    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // Revert balances from the existing swap

      // Revert fromAccount balances
      let revertFromAccountData: any = {};

      if (existingSwap.fromCashAmount && existingSwap.fromCashAmount > 0) {
        revertFromAccountData.cashBalance = {
          increment: existingSwap.fromCashAmount,
        };
      }

      if (
        existingSwap.fromDigitalAmount &&
        existingSwap.fromDigitalAmount > 0
      ) {
        revertFromAccountData.balance = {
          increment: existingSwap.fromDigitalAmount,
        };
      }

      await prisma.accounts.update({
        where: { id: existingSwap.fromAccountId },
        data: revertFromAccountData,
      });

      // Revert toAccount balances
      let revertToAccountData: any = {};

      if (existingSwap.toCashAmount && existingSwap.toCashAmount > 0) {
        revertToAccountData.cashBalance = {
          decrement: existingSwap.toCashAmount,
        };
      }

      if (existingSwap.toDigitalAmount && existingSwap.toDigitalAmount > 0) {
        revertToAccountData.balance = {
          decrement: existingSwap.toDigitalAmount,
        };
      }

      await prisma.accounts.update({
        where: { id: existingSwap.toAccountId },
        data: revertToAccountData,
      });

      // Delete the swap record
      await prisma.accountSwap.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json(
      { message: "Account swap deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting account swap:", error);
    return NextResponse.json(
      { message: "Error deleting account swap", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountSwap = await prisma.accountSwap.findUnique({
      where: { id: params.id },
      include: {
        fromAccount: {
          select: {
            id: true,
            account: true,
          },
        },
        toAccount: {
          select: {
            id: true,
            account: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!accountSwap) {
      return NextResponse.json(
        { error: "Account swap not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(accountSwap, { status: 200 });
  } catch (error) {
    console.error("Error fetching account swap:", error);
    return NextResponse.json(
      { message: "Error fetching account swap" },
      { status: 500 }
    );
  }
}
