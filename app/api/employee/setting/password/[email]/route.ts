
import { passwordChangeSchema } from "@/app/validationSchema/passwordChangeSchema";
import prisma from "../../../../../../prisma/client";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const parsedBody = await request.json();
    const validatedBody = passwordChangeSchema.parse(parsedBody);

    const emailId = params.email;
    const user = await prisma.user.findUnique({ where: { email: emailId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(validatedBody.currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validatedBody.newPassword, 10);
    await prisma.user.update({
      where: { email: emailId },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation errors:", error.errors);
      const detailedErrorMessage = error.errors
        .map((e) => `${e.path.join(".")} - ${e.message}`)
        .join("; ");
      return NextResponse.json(
        { message: detailedErrorMessage },
        { status: 400 }
      );
    }
    console.error("Error updating password", error);
    return NextResponse.json({ message: "Internal server error" });
  }
}
