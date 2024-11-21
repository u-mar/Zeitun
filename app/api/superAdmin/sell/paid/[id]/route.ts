import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import AuthOptions from "../../../../auth/[...nextauth]/AuthOptions";
import prisma from "@/prisma/client";
import { User } from "@prisma/client";

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

    const session = await getServerSession(AuthOptions);

    if (!session) {
        return NextResponse.json(
            { error: "You must be logged in to perform this action" },
            { status: 401 }
        );
    }

    const body = await request.json();
    const userId = (session.user as User).id;

    if (!userId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        const sellRecord = await prisma.sell.findUnique({
            where: { id: params.id },
        });

        if (!sellRecord) {
            return NextResponse.json({ error: "Sell record not found" }, { status: 404 });
        }

        if (sellRecord.userId !== userId) {
            return NextResponse.json(
                { error: "You can't edit this sell record because you are not the owner" },
                { status: 403 }
            );
        }

        const updateStatus = await prisma.sell.update({
            where: { id: params.id },
            data: { status: body.status },
        });

        return NextResponse.json(updateStatus, { status: 200 });
    } catch (error: any) {
        console.error("Error updating sell:", error);
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
