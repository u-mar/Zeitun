import { NextResponse } from 'next/server';
import prisma from '@/prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let products;

  if (category && category !== 'all') {
    products = await prisma.product.findMany({
      where: { categoryId: category }
    });
  } else {
    products = await prisma.product.findMany();
  }

  return NextResponse.json(products);
}
