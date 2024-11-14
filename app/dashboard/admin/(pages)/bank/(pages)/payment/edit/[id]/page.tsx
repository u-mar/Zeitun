import React from "react";
import prisma from "@/prisma/client";
import AddPaymentForm from "../../add-payment/_components/AddPaymentForm";

const EditBankTransactionPage = async ({ params }: { params: { id: string } }) => {
  let bankTransaction;

  try {
     bankTransaction = await prisma.bankTransaction.findUnique({
        where: { id: params.id },
      });
      
  } catch (err) {
    console.error("error", err);
    bankTransaction = null;
  }
  // Convert null to undefined if necessary
  if (bankTransaction == undefined) {
    return <div>not found bankTransaction</div>;
  }

  return <AddPaymentForm  bankTransaction={bankTransaction} />;
};

export default EditBankTransactionPage;