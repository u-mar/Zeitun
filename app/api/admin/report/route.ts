// app/api/report/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/prisma/client';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  subDays,
  subWeeks,
  subMonths,
  parseISO,
} from 'date-fns';

interface ProductSale {
  productName: string;
  quantitySold: number;
  totalAmount: number;
}

interface CategorySale {
  categoryName: string;
  quantitySold: number;
  totalAmount: number;
}

function getDateRange(type: string, searchParams: URLSearchParams) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (type) {
    case 'today':
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
    case 'yesterday':
      const yesterday = subDays(now, 1);
      startDate = startOfDay(yesterday);
      endDate = endOfDay(yesterday);
      break;
    case 'day':
      const dateStr = searchParams.get('date');
      if (!dateStr) {
        throw new Error('Date parameter is required for day report');
      }
      const date = parseISO(dateStr);
      startDate = startOfDay(date);
      endDate = endOfDay(date);
      break;
    case 'week':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      break;
    case 'year':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    case 'yearX':
      const yearStr = searchParams.get('year');
      if (!yearStr) {
        throw new Error('Year parameter is required for yearX report');
      }
      const year = parseInt(yearStr);
      if (isNaN(year)) {
        throw new Error('Invalid year parameter');
      }
      startDate = startOfYear(new Date(year, 0, 1));
      endDate = endOfYear(new Date(year, 0, 1));
      break;
    case 'range':
      const fromStr = searchParams.get('from');
      const toStr = searchParams.get('to');
      if (!fromStr || !toStr) {
        throw new Error('From and To parameters are required for range report');
      }
      startDate = startOfDay(parseISO(fromStr));
      endDate = endOfDay(parseISO(toStr));
      break;
    default:
      throw new Error('Invalid report type');
  }
  return { startDate, endDate };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'today';
    const reportBy = searchParams.get('reportBy') || 'all'; // 'all', 'product', 'category'
    const productName = searchParams.get('productName') || '';
    const categoryName = searchParams.get('categoryName') || '';

    const { startDate, endDate } = getDateRange(type, searchParams);

    // Build where clause
    let baseWhereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (reportBy === 'product' && productName) {
      const productFilter = {
        items: {
          some: {
            sku: {
              variant: {
                product: {
                  name: {
                    equals: productName,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        },
      };

      baseWhereClause = { ...baseWhereClause, ...productFilter };
    }

    if (reportBy === 'category' && categoryName) {
      const categoryFilter = {
        items: {
          some: {
            sku: {
              variant: {
                product: {
                  category: {
                    name: {
                      equals: categoryName,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          },
        },
      };

      baseWhereClause = { ...baseWhereClause, ...categoryFilter };
    }

    // Include relations
    const includeRelations = {
      items: {
        include: {
          sku: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      customer: true,
    };

    // Query the database for current sales
    const sales = await prisma.sell.findMany({
      where: baseWhereClause,
      include: includeRelations,
    });

    // Process sales data
    let totalSalesAmount = 0;
    let totalItemsSold = 0;
    let productSales: { [key: string]: ProductSale } = {};
    let categorySales: { [key: string]: CategorySale } = {};

    for (const sale of sales) {
      totalSalesAmount += sale.total;
      for (const item of sale.items) {
        totalItemsSold += item.quantity;
        const productId = item.sku.variant.product.id;
        const productName = item.sku.variant.product.name;
        const categoryId = item.sku.variant.product.category.id;
        const categoryName = item.sku.variant.product.category.name;

        // Product Sales
        if (!productSales[productId]) {
          productSales[productId] = {
            productName,
            quantitySold: 0,
            totalAmount: 0,
          };
        }
        productSales[productId].quantitySold += item.quantity;
        productSales[productId].totalAmount += item.price * item.quantity;

        // Category Sales
        if (!categorySales[categoryId]) {
          categorySales[categoryId] = {
            categoryName,
            quantitySold: 0,
            totalAmount: 0,
          };
        }
        categorySales[categoryId].quantitySold += item.quantity;
        categorySales[categoryId].totalAmount += item.price * item.quantity;
      }
    }

    const report = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalSalesAmount,
      totalItemsSold,
      productSales: Object.values(productSales),
      categorySales: Object.values(categorySales),
      reportBy, // Include reportBy in the report data
    };

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
