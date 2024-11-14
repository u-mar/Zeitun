import { NextRequest, NextResponse } from "next/server";
import { accountSwapSchema } from "@/app/validationSchema/accountSwapSchema";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import AuthOptions from "@/app/api/auth/[...nextauth]/AuthOptions";
import { User } from "@prisma/client";

// POST: Create a new AccountSwap

async function generateSwapId() {
  const lastSwap = await prisma.accountSwap.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { swapId: true },
  });

  const lastSwapNumber = lastSwap?.swapId ? parseInt(lastSwap.swapId.split('-')[1]) : 0;
  return `SWP-${String(lastSwapNumber + 1).padStart(4, '0')}`;
}
export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }

  const session = await getServerSession(AuthOptions);
  const userId = (session?.user as User)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      { error: "fromAmount must equal sum of fromCashAmount and fromDigitalAmount" },
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
    // Fetch accounts
    const fromAccount = await prisma.accounts.findUnique({
      where: { id: fromAccountId },
    });
    const toAccount = await prisma.accounts.findUnique({
      where: { id: toAccountId },
    });

    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: "One or both accounts not found" },
        { status: 404 }
      );
    }

    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // Create AccountSwap record
      await prisma.accountSwap.create({
        data: {
          swapId: await generateSwapId(), // Auto-generate orderId here
          fromAccountId,
          toAccountId,
          userId,
          fromAmount,
          fromCashAmount: fromCashAmount || null,
          fromDigitalAmount: fromDigitalAmount || null,
          toAmount,
          toCashAmount: toCashAmount || null,
          toDigitalAmount: toDigitalAmount || null,
          exchangeRate: exchangeRate || null,
          details: details || "",
        },
      });

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
      { message: "Account swap created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating account swap:", error);
    return NextResponse.json(
      { message: "Error creating account swap", error: error.message },
      { status: 500 }
    );
  }
}



// GET: Retrieve all AccountSwaps
export async function GET(request: NextRequest) {
  try {
    const accountSwaps = await prisma.accountSwap.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(accountSwaps, { status: 200 });
  } catch (error) {
    console.error("Error fetching account swaps:", error);
    return NextResponse.json(
      { message: "Error fetching account swaps" },
      { status: 500 }
    );
  }
}

// GET by ID: Retrieve a specific AccountSwap

