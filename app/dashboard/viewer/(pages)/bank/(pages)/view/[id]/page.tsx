import React from "react";
import BankInfo from "./_components/BankInfo";


const ViewBankPage = async ({ params }: { params: { id: string } }) => {
  

  return <BankInfo bankId={params.id} />;
};

export default ViewBankPage;
