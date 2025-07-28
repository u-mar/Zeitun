import { accountSchema } from "@/app/validationSchema/account";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

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

  const validation = accountSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const account = await prisma.accounts.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!account) {
    return NextResponse.json("Unknown account, please check out", {
      status: 404,
    });
  }

  const updatedAccount = await prisma.accounts.update({
    where: {
      id: params.id,
    },
    data: {
      account: body.account.toUpperCase(),
      default: body.default || false,
      balance: body.balance,
      cashBalance: body.cashBalance,
    },
  });

  return NextResponse.json(updatedAccount, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if the account exists
  const account = await prisma?.accounts.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!account) {
    return NextResponse.json(
      { error: "Unknown account, please check the ID." },
      { status: 404 }
    );
  }

  try {
    // Check if the account is associated with any transactions
    const associatedTransactions = await prisma.transaction.findMany({
      where: {
        accountId: params.id,
      },
    });

    // Check if the account is associated with any sells
    const associatedSells = await prisma.sell.findMany({
      where: {
        accountId: params.id,
      },
    });

    // If the account is associated with any transactions or sells, prevent deletion
    if (associatedTransactions.length > 0 || associatedSells.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete account as it is associated with transactions or sells." },
        { status: 400 }
      );
    }

    // Delete the account if no associated transactions or sells are found
    const deletedAccount = await prisma?.accounts.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(deletedAccount, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Error deleting account." },
      { status: 500 }
    );
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get The account

  const account = await prisma?.accounts.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!account)
    return NextResponse.json("unknown account please check out", {
      status: 404,
    });

  const GetAccount = await prisma?.accounts.findUnique({
    where: {
      id: params.id,
    },
  });
  return NextResponse.json(GetAccount, { status: 200 });
}
