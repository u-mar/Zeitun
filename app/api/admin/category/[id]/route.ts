import { categorySchema } from "@/app/validationSchema/categorySchema";
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

  const validation = categorySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!category) {
    return NextResponse.json("Unknown category, please check out", {
      status: 404,
    });
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: params.id,
    },
    data: {
      name: body.name,
    },
  });

  return NextResponse.json(updatedCategory, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if the category exists
  const category = await prisma.category.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!category) {
    return NextResponse.json("Unknown category, please check out", {
      status: 404,
    });
  }

  // Check if the category is associated with any products
  const associatedProducts = await prisma.product.findMany({
    where: {
      categoryId: params.id,
    },
  });

  if (associatedProducts.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete category as it is associated with products" },
      { status: 400 }
    );
  }

  // Proceed to delete the category if no associations are found
  const deletedCategory = await prisma.category.delete({
    where: {
      id: params.id,
    },
  });

  return NextResponse.json(deletedCategory, { status: 200 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get The category

  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "you have to provide body information" },
      { status: 400 }
    );
  }

  const category = await prisma?.category.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!category)
    return NextResponse.json("unknown category please check out", {
      status: 404,
    });

  const GetCategory = await prisma?.category.findUnique({
    where: {
      id: params.id,
    },
  });
  return NextResponse.json(GetCategory, { status: 200 });
}
