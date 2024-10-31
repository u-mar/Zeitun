import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client"; // Adjust the path to your prisma file
import { productSchema } from "@/app/validationSchema/productSchema";

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
    return NextResponse.json("you cannot update anything", { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Error registering product", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const product = searchParams.get("product");
  const user = searchParams.get("user");
  const dateRange = searchParams.get("dateRange");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  let sellWhere: any = {}; // Filters for Sell model
  let sellItemWhere: any = {}; // Filters for SellItem model

  // Apply category filter
  if (category !== "all") {
    sellItemWhere.product = {
      categoryId: category,
    };
  }

  // Apply product filter
  if (product !== "all") {
    sellItemWhere.productId = product;
  }

  // Apply user filter
  if (user !== "all") {
    sellWhere.userId = user;
  }

  const currentDate = new Date();

  // Handle 'today' filter
  if (dateRange === "today") {
    sellWhere.createdAt = {
      gte: new Date(currentDate.setHours(0, 0, 0, 0)),
      lt: new Date(currentDate.setHours(24, 0, 0, 0)), // End of the current day
    };
  }

  // Handle 'yesterday' filter
  if (dateRange === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(currentDate.getDate() - 1);
    sellWhere.createdAt = {
      gte: new Date(yesterday.setHours(0, 0, 0, 0)), // Start of yesterday
      lt: new Date(currentDate.setHours(0, 0, 0, 0)), // Start of today
    };
  }

  // Handle specific date range
  if (dateRange === "specific-date" && fromDate && toDate) {
    sellWhere.createdAt = {
      gte: new Date(fromDate), // From the start of the selected fromDate
      lt: new Date(new Date(toDate).setHours(23, 59, 59, 999)), // End of the selected toDate
    };
  }

  // Handle specific year
  if (dateRange === "specific-year" && year) {
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${parseInt(year) + 1}-01-01`);
    sellWhere.createdAt = {
      gte: startOfYear,
      lt: endOfYear,
    };
  }

  // Handle specific month
  if (dateRange === "specific-month" && month && year) {
    const startOfMonth = new Date(`${year}-${month}-01`);
    const endOfMonth = new Date(`${year}-${parseInt(month) + 1}-01`);
    sellWhere.createdAt = {
      gte: startOfMonth,
      lt: endOfMonth,
    };
  }

  // Handle the case of 'this-week'
  if (dateRange === "this-week") {
    const weekStart = new Date();
    weekStart.setDate(currentDate.getDate() - currentDate.getDay()); // Get the start of the week (Sunday)
    sellWhere.createdAt = {
      gte: new Date(weekStart.setHours(0, 0, 0, 0)), // Start of the week
      lt: new Date(currentDate.setHours(24, 0, 0, 0)), // End of today
    };
  }

  // Handle 'this-month' filter
  if (dateRange === "this-month") {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    sellWhere.createdAt = {
      gte: new Date(monthStart), // Start of the month
      lt: new Date(new Date().setHours(24, 0, 0, 0)), // End of today
    };
  }

  // Handle 'this-year' filter
  if (dateRange === "this-year") {
    const yearStart = new Date(currentDate.getFullYear(), 0, 1);
    sellWhere.createdAt = {
      gte: new Date(yearStart), // Start of the year
      lt: new Date(new Date().setHours(24, 0, 0, 0)), // End of today
    };
  }

  try {
    // Fetch sales with the filters applied
    const sells = await prisma.sell.findMany({
      where: {
        ...sellWhere,
        items: {
          some: {
            ...sellItemWhere,
          },
        },
      },
      include: {
        items: true,
      },
    });

    // Calculate totals
    const cashAmount = sells.reduce(
      (sum, sell) => sum + (sell.cashAmount || 0),
      0
    );
    const digitalAmount = sells.reduce(
      (sum, sell) => sum + (sell.digitalAmount || 0),
      0
    );
    const totalAmount = cashAmount + digitalAmount;

    // Count orders and items
    const orderCount = sells.length;
    const quantityCount = sells.reduce((totalItems, sell) => {
        return totalItems + sell.items.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);
      

    return NextResponse.json({
      cashAmount,
      digitalAmount,
      totalAmount,
      orderCount,
      quantityCount,
      selectedCategory: category === "all" ? "All Categories" : category,
      selectedProduct: product === "all" ? "All Products" : product,
      selectedUser: user === "all" ? "All Users" : user,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error fetching report data." },
      { status: 500 }
    );
  }
}

