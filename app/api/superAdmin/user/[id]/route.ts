import { userSchema } from "@/app/validationSchema/userSchema";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (request.headers.get("content-length") === "0") {
    return NextResponse.json(
      { error: "You have to provide body information" },
      { status: 400 }
    );
  }

  const body = await request.json();

  const validation = userSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const adminInfo = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!adminInfo) {
    return NextResponse.json("Unknown admin, please check the ID", {
      status: 404,
    });
  }

  // Check if the email already exists in the user table
  const existingUser = await prisma.user.findFirst({
    where: {
      AND: [{ email: body.email }, { id: { not: params.id } }],
    },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 400 }
    );
  }

  // Check if the phone number already exists in the admin table
  const existingAdminByPhoneNumber = await prisma.user.findFirst({
    where: {
      AND: [{ phoneNumber: body.phoneNumber }, { id: { not: params.id } }],
    },
  });

  if (existingAdminByPhoneNumber) {
    return NextResponse.json(
      { error: "Phone number is already registered" },
      { status: 400 }
    );
  }

  let password = body.password;

  if (password) {
    password = await bcrypt.hash(password, 10);
  }

  try {
    const updatedAdmin = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: body.name || adminInfo.name,
        email: body.email || adminInfo.email,
        phoneNumber: body.phoneNumber || adminInfo.phoneNumber,
        role: body.role,
        password:  adminInfo.password,
      },
    });

    return NextResponse.json({ updatedAdmin }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "User not found or unable to update" },
      { status: 404 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminInfo = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!adminInfo) {
    return NextResponse.json("Unknown user, please check the ID", {
      status: 404,
    });
  }

  try {
    // Check if the user is associated with any transactions
    const associatedTransactions = await prisma.transaction.findMany({
      where: {
        userId: params.id,
      },
    });

    // Check if the user is associated with any sells
    const associatedSells = await prisma.sell.findMany({
      where: {
        userId: params.id,
      },
    });

    // If the user is associated with any transactions or sells, prevent deletion
    if (associatedTransactions.length > 0 || associatedSells.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete user as they are associated with transactions or sells." },
        { status: 400 }
      );
    }

    // Delete the user if no associations are found
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "User not found or unable to delete" },
      { status: 404 }
    );
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminInfo = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
    }
  });

  if (!adminInfo) {
    return NextResponse.json("Unknown admin, please check the ID", {
      status: 404,
    });
  }

  return NextResponse.json(adminInfo, { status: 200 });
}