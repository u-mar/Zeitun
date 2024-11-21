import React from "react";
import prisma from "@/prisma/client";
import BankInfo, { BankAccount, BankTransaction } from "./_components/BankInfo";


const ViewBankPage = async ({ params }: { params: { id: string } }) => {
  

  return <BankInfo bankId={params.id} />;
};

export default ViewBankPage;
