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

    // Calculate the difference in quantity
    const quantityDifference = body.quantity - existingStock.quantity;

    // Update the stock entry
    const updatedStock = await prisma.stockQuantity.update({
      where: { id: params.id },
      data: {
        quantity: body.quantity,
      },
    });

    // Update the SKU stock quantity
    await prisma.sKU.update({
      where: { id: updatedStock.skuId },
      data: {
        stockQuantity: {
          increment: quantityDifference, // Adjust SKU stock based on the difference
        },
      },
    });

    // Update the product's stockQuantity directly using the quantity difference
    const updatedProduct = await prisma.product.update({
      where: { id: updatedStock.productId },
      data: {
        stockQuantity: {
          increment: quantityDifference,
        },
      },
    });

    return NextResponse.json(
      {
        message: "Stock entry updated successfully",
        updatedStock,
        updatedSKUStock: updatedStock.quantity,
        updatedTotalProductStock: updatedProduct.stockQuantity,
      },
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

    // Update the SKU stock quantity
    await prisma.sKU.update({
      where: { id: existingStock.skuId },
      data: {
        stockQuantity: {
          decrement: existingStock.quantity,
        },
      },
    });

    // Update the product's total stock quantity by decrementing the deleted quantity
    await prisma.product.update({
      where: { id: existingStock.productId },
      data: {
        stockQuantity: {
          decrement: existingStock.quantity,
        },
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
