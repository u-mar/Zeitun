import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "../../../validationSchema/userSchema"; // Adjust the import path as needed
import bcrypt from "bcrypt";
import prisma from "@/prisma/client";

const getTenantPrefix = (req: NextRequest): string => {
  return req.headers.get("host")!.split(".")[0];
};

export async function POST(request: NextRequest) {
  // Register new user
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

  let password = body.password || body.phoneNumber;

  if (!password) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }

  // Check if the email already exists
  const existingAdminByEmail = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingAdminByEmail) {
    return NextResponse.json(
      { error: "Email is already registered" },
      { status: 400 }
    );
  }
  // Check if the phone already exists
  const existingAdminByPhoneNumber = await prisma.user.findFirst({
    where: {
      AND: [{ phoneNumber: body.phoneNumber }],
    },
  });

  if (existingAdminByPhoneNumber) {
    return NextResponse.json(
      { error: "phone number is already registered" },
      { status: 400 }
    );
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new admin and corresponding user
  const newAdmin = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      phoneNumber: body.phoneNumber,
      role: body.role,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ newAdmin }, { status: 201 });
}

export async function GET(request: NextRequest) {
  // get all users with student role and approved
  const Admins = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(Admins, { status: 200 });
}
