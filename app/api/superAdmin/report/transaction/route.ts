import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const user = searchParams.get("user");
  const dateRange = searchParams.get("dateRange");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const acc = searchParams.get("acc"); // Get acc type filter ('all', 'cr', or 'dr')

  let transactionWhere: any = {
    category: {
      name: { not: "exchange" }
    },
    acc: acc && acc !== "all" ? acc : undefined // Apply 'acc' filter if not 'all'
  };

  if (category && category !== 'all') {
    transactionWhere.categoryId = category;
  }

  if (user && user !== 'all') {
    transactionWhere.userId = user;
  }

  // Apply date filters
  const currentDate = new Date();
  if (dateRange === "today") {
    transactionWhere.tranDate = {
      gte: new Date(currentDate.setHours(0, 0, 0, 0)),
      lt: new Date(currentDate.setHours(24, 0, 0, 0)),
    };
  }

  if (dateRange === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(currentDate.getDate() - 1);
    transactionWhere.tranDate = {
      gte: new Date(yesterday.setHours(0, 0, 0, 0)),
      lt: new Date(currentDate.setHours(0, 0, 0, 0)),
    };
  }

  if (dateRange === "specific-date" && fromDate && toDate) {
    transactionWhere.tranDate = {
      gte: new Date(fromDate),
      lt: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
    };
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: transactionWhere,
      include: {
        category: true,
        user: true,
        account: {
          select: {
            account: true,
            id: true,
          }
        }
      },
    });

    const creditTotal = transactions
      .filter(t => t.acc === 'Cr')
      .reduce((sum, t) => sum + t.amount, 0);

    const debitTotal = transactions
      .filter(t => t.acc === 'Dr')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashTotal = transactions
      .filter(t => t.type === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);

    const digitalTotal = transactions
      .filter(t => t.type === 'digital')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAmount = cashTotal + digitalTotal;
    const transactionCount = transactions.length;

    const response = {
      creditTotal,
      debitTotal,
      cashTotal,
      digitalTotal,
      totalAmount,
      transactionCount,
      transactions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Error fetching transaction data." }, { status: 500 });
  }
}
