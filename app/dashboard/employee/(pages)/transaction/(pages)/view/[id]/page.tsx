import React from "react";
import prisma from "@/prisma/client";
import TransactionInfo from "./_components/TransactionInfo";
import { getServerSession } from "next-auth";
import AuthOptions from "@/app/api/auth/[...nextauth]/AuthOptions";
import { User } from "@prisma/client";

const ViewTransactionPage = async ({ params }: { params: { id: string } }) => {

  const session = await getServerSession(AuthOptions);
  const userId = (session?.user as User).id;
  let transaction;

  try {
     transaction = await prisma.transaction.findUnique({
        where: { id: params.id, userId, },
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