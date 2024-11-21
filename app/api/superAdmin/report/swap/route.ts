import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

type AccountSummary = {
    account: string;
    totalSwaps: number;
    totalFromAmount: number;
    totalToAmount: number;
  };
  
  export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get("user");
    const dateRange = searchParams.get("dateRange");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
  
    let where: any = {};

  
    if (user && user !== "all") {
      where.userId = user;
    }
  
    if (dateRange === "today") {
      const today = new Date();
      where.createdAt = {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(24, 0, 0, 0)),
      };
    } else if (dateRange === "specific-date" && fromDate && toDate) {
      where.createdAt = {
        gte: new Date(fromDate),
        lt: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
      };
    }
  
    try {
      const swaps = await prisma.accountSwap.findMany({
        where,
        include: {
          fromAccount: { select: { account: true } },
          toAccount: { select: { account: true } },
          user: true,
        },
      });
  
      if (!swaps || swaps.length === 0) {
        return NextResponse.json({ transactions: [], summary: [] });
      }
  
      const accountsSummary: Record<string, AccountSummary> = swaps.reduce(
        (acc: Record<string, AccountSummary>, swap) => {
          const fromAccount = swap.fromAccount?.account || "Unknown";
          const toAccount = swap.toAccount?.account || "Unknown";
      
          if (!acc[fromAccount]) {
            acc[fromAccount] = {
              account: fromAccount,
              totalSwaps: 0,
              totalFromAmount: 0,
              totalToAmount: 0,
            };
          }
          if (!acc[toAccount]) {
            acc[toAccount] = {
              account: toAccount,
              totalSwaps: 0,
              totalFromAmount: 0,
              totalToAmount: 0,
            };
          }
      
          acc[fromAccount].totalSwaps++;
          acc[fromAccount].totalFromAmount += swap.fromAmount;
          acc[toAccount].totalToAmount += swap.toAmount;
      
          return acc;
        },
        {}
      );
      
  
      const summary = Object.values(accountsSummary);
  
      return NextResponse.json({ transactions: swaps, summary });
    } catch (error) {
      console.error("Error fetching swap transactions:", error);
      return NextResponse.json(
        { error: "Error fetching swap transactions." },
        { status: 500 }
      );
    }
  }
  
