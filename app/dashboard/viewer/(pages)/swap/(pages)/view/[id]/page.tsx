import React from "react";
import prisma from "@/prisma/client";
import SwapInfo from "./_components/SwapInfo";

const ViewSwapPage = async ({ params }: { params: { id: string } }) => {
  let swap;

  try {
     swap = await prisma.accountSwap.findUnique({
      where: { id: params.id },
      include: {
        fromAccount: {
          select: {
            id: true,
            account: true,
          },
        },
        toAccount: {
          select: {
            id: true,
            account: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
      
  } catch (err) {
    console.error("error", err);
    swap = null;
  }
  // Convert null to undefined if necessary
  if (swap == undefined) {
    return <div>not found swap</div>;
  }

  return <SwapInfo swap={{ ...swap, user: { ...swap.user, name: swap.user.name ?? undefined } }} />;
};

export default ViewSwapPage;