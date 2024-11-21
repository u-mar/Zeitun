import React from "react";
import prisma from "@/prisma/client";
import AddBankForm from "../../add/_components/AddBankForm";

const EditBankPage = async ({ params }: { params: { id: string } }) => {
  let bank;

  try {
     bank = await prisma.bankAccount.findUnique({
        where: { id: params.id },
      });
      
  } catch (err) {
    console.error("error", err);
    bank = null;
  }
  // Convert null to undefined if necessary
  if (bank == undefined) {
    return <div>not found bank</div>;
  }

  return <AddBankForm bank={bank} />;
};

export default EditBankPage;