import { NextRequest, NextResponse } from "next/server";
import { productSchema } from "@/app/validationSchema/productSchema";
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

  try {
    // Fetch the existing stock entry
    const existingStock = await prisma.stockQuantity.findUnique({
      where: { id: params.id },
    });

    if (!existingStock) {
      return NextResponse.json(
        { error: "Stock entry not found" },
        { status: 404 }
      );
    }

    // Calculate the quantity difference
    const quantityDifference = body.quantity - existingStock.quantity;

    // Update the stock entry
    const updatedStock = await prisma.stockQuantity.update({
      where: { id: params.id },
      data: {
        quantity: body.quantity,
      },
    });

    // Update SKU stock quantity
    await prisma.sKU.update({
      where: { id: updatedStock.skuId },
      data: {
        stockQuantity: {
          increment: quantityDifference,
        },
      },
    });

    // Update Product stock quantity
    const totalStockQuantity = await prisma.stockQuantity.aggregate({
      where: { productId: updatedStock.productId },
      _sum: {
        quantity: true,
      },
    });

    await prisma.product.update({
      where: { id: updatedStock.productId },
      data: {
        stockQuantity: totalStockQuantity._sum.quantity || 0,
      },
    });

    return NextResponse.json(
      { message: "Stock entry updated successfully", updatedStock },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Error updating product", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the existing stock entry
    const existingStock = await prisma.stockQuantity.findUnique({
      where: { id: params.id },
    });

    if (!existingStock) {
      return NextResponse.json(
        { error: "Stock entry not found" },
        { status: 404 }
      );
    }

    // Delete the stock entry
    await prisma.stockQuantity.delete({
      where: { id: params.id },
    });

    // Update SKU stock quantity
    await prisma.sKU.update({
      where: { id: existingStock.skuId },
      data: {
        stockQuantity: {
          decrement: existingStock.quantity,
        },
      },
    });

    // Update Product stock quantity
    const totalStockQuantity = await prisma.stockQuantity.aggregate({
      where: { productId: existingStock.productId },
      _sum: {
        quantity: true,
      },
    });

    await prisma.product.update({
      where: { id: existingStock.productId },
      data: {
        stockQuantity: totalStockQuantity._sum.quantity || 0,
      },
    });

    return NextResponse.json(
      { message: "Stock entry deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Error deleting product", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stockProduct = await prisma.stockQuantity.findUnique({
      where: { id: params.id },
      include: {
        variant: {
          include: {
            skus: true,
          },
        },
      },
    });

    if (!stockProduct) {
      return NextResponse.json(
        { error: "StockProduct not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(stockProduct, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Error fetching product", error: error.message },
      { status: 500 }
    );
  }
}
