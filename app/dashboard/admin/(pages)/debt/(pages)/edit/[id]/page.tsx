import React from "react";
import prisma from "@/prisma/client";
import AddDebtForm from "../../add/_components/AddDebtForm";

const EditDebtPage = async ({ params }: { params: { id: string } }) => {
  let debt;

  try {
     debt = await prisma.debt.findUnique({
        where: { id: params.id },
        include: {
          payments: {
            select: {
              id: true,
              amountPaid: true,
              paymentDate: true,
            },
          },
          account: {
            select: {
              id: true,
              account: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      });
      
  } catch (err) {
    console.error("error", err);
    debt = null;
  }
  // Convert null to undefined if necessary
  if (debt == undefined) {
    return <div>not found debt</div>;
  }

  return <AddDebtForm debt={debt} />;
};

export default EditDebtPage;