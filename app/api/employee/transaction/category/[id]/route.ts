import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// GET handler for fetching a single transaction category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Fetch the transaction category by ID
  const transactionCategory = await prisma?.transactionCategory.findUnique({
    where: { id: params.id, isAdmin: false },
  });

  if (!transactionCategory) {
    return NextResponse.json(
      { error: "Transaction category not found, please check the ID." },
      { status: 404 }
    );
  }

  return NextResponse.json(transactionCategory, { status: 200 });
}
