import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Both startDate and endDate are required" },
      { status: 400 }
    );
  }

  try {
    const sells = await prisma.sell.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: { items: true } // Include associated items if needed
    });

    return NextResponse.json(sells, { status: 200 });
  } catch (error) {
    console.error("Error retrieving sells:", error);
    return NextResponse.json(
      { message: "Error retrieving sells" },
      { status: 500 }
    );
  }
}