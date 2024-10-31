// app/api/transactions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';
  const transactionType = searchParams.get('transactionType') || 'all';
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';
  const dateRange = searchParams.get('dateRange') || '';

  let where: any = {};

  // Adjust category filtering
  if (category !== 'all') {
    if (category === 'exchange') {
      where.category = {
        name: 'exchange',
      };
    } else {
      where.categoryId = category;
    }
  } else {
    // Exclude exchange category when 'all' is selected
    where.category = {
      name: {
        not: 'exchange',
      },
    };
  }

  // Adjust date range filtering
  if (fromDate && toDate) {
    where.tranDate = {
      gte: new Date(fromDate),
      lte: new Date(toDate),
    };
  } else if (dateRange) {
    // Handle predefined date ranges like 'today', 'this-week', etc.
    const now = new Date();
    switch (dateRange) {
      case 'today':
        where.tranDate = {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(now.setHours(23, 59, 59, 999)),
        };
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        where.tranDate = {
          gte: new Date(yesterday.setHours(0, 0, 0, 0)),
          lte: new Date(yesterday.setHours(23, 59, 59, 999)),
        };
        break;
      case 'this-week':
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const lastDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        where.tranDate = {
          gte: new Date(firstDayOfWeek.setHours(0, 0, 0, 0)),
          lte: new Date(lastDayOfWeek.setHours(23, 59, 59, 999)),
        };
        break;
      case 'this-month':
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        where.tranDate = {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        };
        break;
      case 'this-year':
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
        where.tranDate = {
          gte: firstDayOfYear,
          lte: lastDayOfYear,
        };
        break;
      default:
        // 'all-time' or any other unhandled cases
        break;
    }
  }

  // Adjust transaction type filtering
  if (category === 'exchange') {
    // For exchange transactions
    if (transactionType !== 'both') {
      where.exchangeType = transactionType;
    }
  } else {
    // For regular transactions
    if (transactionType === 'in' || transactionType === 'out') {
      where.amountType = transactionType;
    }
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: true,
        category: true,
      },
    });

    if (category === 'exchange') {
      // Aggregate data for exchange transactions
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const transactionCount = transactions.length;

      const report = {
        totalAmount,
        transactionCount,
        transactions,
      };

      return NextResponse.json(report);
    } else {
      // Aggregate data for regular transactions
      let report = {
        cashIn: 0,
        cashOut: 0,
        digitalIn: 0,
        digitalOut: 0,
        totalIn: 0,
        totalOut: 0,
      };

      transactions.forEach((t) => {
        if (t.type === 'cash') {
          if (t.amountType === 'in') report.cashIn += t.amount;
          else if (t.amountType === 'out') report.cashOut += t.amount;
        } else if (t.type === 'digital') {
          if (t.amountType === 'in') report.digitalIn += t.amount;
          else if (t.amountType === 'out') report.digitalOut += t.amount;
        }
        if (t.amountType === 'in') report.totalIn += t.amount;
        else if (t.amountType === 'out') report.totalOut += t.amount;
      });

      return NextResponse.json(report);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching transactions' }, { status: 500 });
  }
}
