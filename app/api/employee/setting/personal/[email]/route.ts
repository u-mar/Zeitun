import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../../prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: params.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error getting user and user details", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const body = await request.json();

    if (!body.name && !body.email && !body.phoneNumber && !body.signatureUrl) {
      return NextResponse.json(
        { error: "No data provided for update" },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (body.email) {
      const existingUserWithEmail = await prisma.user.findFirst({
        where: { email: body.email,  NOT: { email: params.email } },
      });
      if (existingUserWithEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }
    // Check if phoneNumber already exists
    if (body.phoneNumber) {
      const existingUserWithPhoneNumber = await prisma.user.findFirst({
        where: { phoneNumber: body.phoneNumber,  NOT: { email: params.email } },
      });
      if (existingUserWithPhoneNumber) {
        return NextResponse.json(
          { error: "Phone Number already exists" },
          { status: 400 }
        );
      }
    }

    const updateUserData: any = {};
    if (body.name) updateUserData.name = body.name;
    if (body.email) updateUserData.email = body.email;
    if (body.phoneNumber) updateUserData.phoneNumber = body.phoneNumber;

    const updatedUser = await prisma.user.update({
      where: { email: params.email },
      data: updateUserData,
    });

    return NextResponse.json(
      { message: "Info updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user and user details", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}