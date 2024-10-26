import React from "react";
import prisma from "@/prisma/client";
import AddTransactionForm from "../../add/_components/AddTransactionForm";

const EditTransactionPage = async ({ params }: { params: { id: string } }) => {
  let transaction;

  try {
     transaction = await prisma.transaction.findUnique({
        where: { id: params.id },
      });
      
  } catch (err) {
    console.error("error", err);
    transaction = null;
  }
  // Convert null to undefined if necessary
  if (transaction == undefined) {
    return <div>not found transaction</div>;
  }

  return <AddTransactionForm transaction={transaction} />;
};

export default EditTransactionPage;