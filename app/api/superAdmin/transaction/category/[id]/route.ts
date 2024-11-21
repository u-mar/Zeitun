import { transactionCategorySchema } from "@/app/validationSchema/transactionCategorySchema";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// PATCH handler for updating a transaction category
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

  // Validate request body using schema
  const validation = transactionCategorySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  // Check if the category exists
  const transactionCategory = await prisma.transactionCategory.findUnique({
    where: { id: params.id },
  });

  if (!transactionCategory) {
    return NextResponse.json(
      { error: "Transaction category not found, please check the ID." },
      { status: 404 }
    );
  }

  try {
    // Update transaction category including updating allowedRoles relations
    const updatedTransactionCategory = await prisma.transactionCategory.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        isAdmin: body.isAdmin
    }});

    return NextResponse.json(updatedTransactionCategory, { status: 200 });
  } catch (error: any) {
    console.error("Error updating transaction category", error);
    return NextResponse.json(
      { error: "Error updating transaction category." },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a transaction category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if the category exists
  const transactionCategory = await prisma.transactionCategory.findUnique({
    where: { id: params.id },
  });

  if (!transactionCategory) {
    return NextResponse.json(
      { error: "Transaction category not found, please check the ID." },
      { status: 404 }
    );
  }

  try {
    // Check if there are any transactions associated with this category
    const associatedTransactions = await prisma.transaction.findMany({
      where: { categoryId: params.id },  // Assuming categoryId links transaction to the category
    });

    if (associatedTransactions.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category while it is associated with transactions." },
        { status: 400 }
      );
    }

    // Delete the transaction category if no associated transactions are found
    const deletedTransactionCategory = await prisma.transactionCategory.delete({
      where: { id: params.id },
    });

    return NextResponse.json(deletedTransactionCategory, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting transaction category", error);
    return NextResponse.json(
      { error: "Error deleting transaction category." },
      { status: 500 }
    );
  }
}


// GET handler for fetching a single transaction category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Fetch the transaction category by ID
  const transactionCategory = await prisma?.transactionCategory.findUnique({
    where: { id: params.id },
  });

  if (!transactionCategory) {
    return NextResponse.json(
      { error: "Transaction category not found, please check the ID." },
      { status: 404 }
    );
  }

  return NextResponse.json(transactionCategory, { status: 200 });
}
