import React from "react";
import prisma from "@/prisma/client";
import AddDebtPaymentForm from "../../_components/AddPaymentForm";

const EditPaymentPage = async ({ params }: { params: { id: string } }) => {
  let payment;

  try {
     payment = await prisma.debtPayment.findUnique({
        where: { id: params.id },
      });
      
  } catch (err) {
    console.error("error", err);
    payment = null;
  }
  // Convert null to undefined if necessary
  if (payment == undefined) {
    return <div>not found payment</div>;
  }

  return <AddDebtPaymentForm debtPayment={payment} />;
};

export default EditPaymentPage;