import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client"; // Adjust to your Prisma client path

export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }

  const body = await request.json();

  try {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
      include: {
        stockQuantities: true, // Include stock quantities for the product
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if the SKU exists
    const sku = await prisma.sKU.findUnique({
      where: { id: body.skuId },
    });

    if (!sku) {
      return NextResponse.json({ error: "SKU not found" }, { status: 404 });
    }

    // Add new stock quantity for the specific SKU
    const newStockProduct = await prisma.stockQuantity.create({
      data: {
        productId: body.productId,
        variantId: body.variantId,
        skuId: body.skuId,
        quantity: body.quantity,
      },
    });

    // Update SKU stock quantity
    const updatedSKU = await prisma.sKU.update({
      where: { id: body.skuId },
      data: {
        stockQuantity: {
          increment: body.quantity,
        },
      },
    });

    // Recalculate the total stock quantity for the product
    const totalStockQuantity = product.stockQuantity + body.quantity;

    // Update the product's stockQuantity field
    const updatedProduct = await prisma.product.update({
      where: { id: body.productId },
      data: {
        stockQuantity: totalStockQuantity,
      },
    });

    return NextResponse.json(
      {
        message: "Stock quantity updated successfully",
        newStockProduct,
        updatedSKUStock: updatedSKU.stockQuantity,
        updatedTotalProductStock: updatedProduct.stockQuantity,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error Adding new stock product:", error);
    return NextResponse.json(
      { message: "Error adding new stock product", error: error.message },
      { status: 500 }
    );
  }
}



export async function GET(request: NextRequest) {
  try {
    const StockProducts = await prisma.stockQuantity.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        variant: {
          include: {
            skus: true,
          },
        },
      },
    });
    return NextResponse.json(StockProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching StockProducts:", error);
    return NextResponse.json(
      { message: "Error fetching product files" },
      { status: 500 }
    );
  }
}
