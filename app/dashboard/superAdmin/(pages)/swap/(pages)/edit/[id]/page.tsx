import React from "react";
import prisma from "@/prisma/client";
import AddSwapForm from "../../add/_components/AddSwapForm";

const EditSwapPage = async ({ params }: { params: { id: string } }) => {
  let swap;

  try {
     swap = await prisma.accountSwap.findUnique({
        where: { id: params.id },
      });
      
  } catch (err) {
    console.error("error", err);
    swap = null;
  }
  // Convert null to undefined if necessary
  if (swap == undefined) {
    return <div>not found swap</div>;
  }

  return <AddSwapForm swap={swap} />;
};

export default EditSwapPage;