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


export async function GET(request: NextRequest) {


  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: {
          include: {
            skus: true,
          },
        },
        orderItem: {
          select: {
            quantity: true
          }
        }
      },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Error fetching product files" },
      { status: 500 }
    );
  }
}
