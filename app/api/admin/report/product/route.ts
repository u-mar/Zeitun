import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client"; // Adjust the path to your Prisma client file

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productIds = searchParams.get("productIds"); // Comma-separated product IDs, or "all" for all products

  try {
    // Fetch all products or selected products
    const products = await prisma.product.findMany({
      where: {
        ...(productIds && productIds !== "all" && { id: { in: productIds.split(",") } }),
      },
      include: {
        orderItem: true, // Includes SellItems associated with each product
      },
    });

    // Process each product to generate the report
    const reportData = products.map((product) => {
      const productPrice = product.price;
      
      // Total quantity in stock
      const totalQuantity = product.stockQuantity;
      
      // Calculate quantity sold and total sales
      const quantitySold = product.orderItem.reduce((sum, item) => sum + item.quantity, 0);
      const totalSales = product.orderItem.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Remaining quantity
      const remainingQuantity = totalQuantity - quantitySold;

      // Total value for all quantities (stock + sold)
      const totalProductValue = totalQuantity * productPrice;

      // Total value of unsold quantities
      const unsoldValue = remainingQuantity * productPrice;

      return {
        productName: product.name,
        productPrice,
        totalQuantity,
        quantitySold,
        remainingQuantity,
        totalProductValue,
        totalSales,
        unsoldValue,
        profit: totalSales - (quantitySold * productPrice),
      };
    });

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Error generating product report:", error);
    return NextResponse.json(
      { error: "Failed to generate product report" },
      { status: 500 }
    );
  }
}
