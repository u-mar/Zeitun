import prisma from "@/prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { reportType: string } }) {
  const { reportType } = params;
  const { searchParams } = new URL(request.url);

  let dateRange: { start: Date; end: Date };
  const today = new Date();

  switch (reportType) {
    case "today":
      dateRange = {
        start: new Date(today.setHours(0, 0, 0, 0)),
        end: new Date(today.setHours(23, 59, 59, 999)),
      };
      break;

    case "yesterday":
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      dateRange = {
        start: new Date(yesterday.setHours(0, 0, 0, 0)),
        end: new Date(yesterday.setHours(23, 59, 59, 999)),
      };
      break;

    case "this-week":
      const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      dateRange = {
        start: new Date(firstDayOfWeek.setHours(0, 0, 0, 0)),
        end: new Date(lastDayOfWeek.setHours(23, 59, 59, 999)),
      };
      break;

    case "this-month":
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dateRange = {
        start: new Date(firstDayOfMonth.setHours(0, 0, 0, 0)),
        end: new Date(lastDayOfMonth.setHours(23, 59, 59, 999)),
      };
      break;

    case "this-year":
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
      dateRange = {
        start: new Date(firstDayOfYear.setHours(0, 0, 0, 0)),
        end: new Date(lastDayOfYear.setHours(23, 59, 59, 999)),
      };
      break;

    case "custom": {
      // Get 'from' and 'to' from query parameters
      const from = searchParams.get("from");
      const to = searchParams.get("to");

      if (!from || !to) {
        return NextResponse.json({ error: "Invalid or missing 'from' or 'to' dates." }, { status: 400 });
      }

      // Parse the date strings
      const startDate = new Date(from);
      const endDate = new Date(to);

      // Validate the dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
      }

      dateRange = {
        start: new Date(startDate.setHours(0, 0, 0, 0)),
        end: new Date(endDate.setHours(23, 59, 59, 999)),
      };
      break;
    }

    default:
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }

  try {
    // Fetch all sells in the date range
    const sells = await prisma.sell.findMany({
      where: {
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      include: {
        items: true, // Include related sell items
        account: {
          select: {
            account: true,
          },
        },
      },
    });

    return NextResponse.json(sells, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
