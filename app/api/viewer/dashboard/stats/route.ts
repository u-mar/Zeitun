import { NextRequest, NextResponse } from "next/server";
import { productSchema } from "@/app/validationSchema/productSchema";
import prisma from "@/prisma/client";

export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }



  const body = await request.json();

  const validation = productSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    

    return NextResponse.json('you cannot update anything', { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Error registering product", error: error.message },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    // Total Products
    const totalProducts = await prisma.product.count();

    // Available Stock (Total stock quantity of all products where stockQuantity > 0)
    const availableStockResult = await prisma.product.aggregate({
      _sum: {
        stockQuantity: true,
      },
      where: {
        stockQuantity: {
          gt: 0,
        },
      },
    });

    const availableStock = availableStockResult._sum.stockQuantity || 0;

    // Low Stock (Products where stockQuantity > 0 and stockQuantity <= threshold)
    const LOW_STOCK_THRESHOLD = 5;

    const lowStockCount = await prisma.product.count({
      where: {
        stockQuantity: {
          gt: 0,
          lte: LOW_STOCK_THRESHOLD,
        },
      },
    });

    // Out of Stock (Products where stockQuantity == 0)
    const outOfStockCount = await prisma.product.count({
      where: {
        stockQuantity: 0,
      },
    });

    return NextResponse.json({
      totalProducts,
      availableStock,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
  }
}
