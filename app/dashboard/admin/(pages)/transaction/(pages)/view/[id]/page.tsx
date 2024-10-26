import React from "react";
import prisma from "@/prisma/client";
import TransactionInfo from "./_components/TransactionInfo";

const ViewTransactionPage = async ({ params }: { params: { id: string } }) => {
  let transaction;

  try {
     transaction = await prisma.transaction.findUnique({
        where: { id: params.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          }
        }
      });
      
  } catch (err) {
    console.error("error", err);
    transaction = null;
  }
  // Convert null to undefined if necessary
  if (transaction == undefined) {
    return <div>not found transaction</div>;
  }

  return <TransactionInfo transaction={transaction} />;
};

export default ViewTransactionPage;