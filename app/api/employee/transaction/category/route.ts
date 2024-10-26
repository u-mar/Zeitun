import { NextRequest, NextResponse } from "next/server";
import { transactionCategorySchema } from "@/app/validationSchema/transactionCategorySchema";
import prisma from "@/prisma/client";

export async function POST(request: NextRequest) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }

  const body = await request.json();

  // Validate the body against the schema
  const validation = transactionCategorySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  try {
    // Create the category with its associated allowed roles
  

    return NextResponse.json('why is must to create a POST route', { status: 201 });
  } catch (error: any) {
    console.error("Error creating category", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Retrieve categories and include the allowedRoles for each category
    const categories = await prisma.transactionCategory.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching categories", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
