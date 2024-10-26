import React from "react";
import prisma from "@/prisma/client";
import AddAccountForm from "../../add/_components/AddAccountForm"; // Import Account type
import { Accounts } from "@prisma/client";

const EditAccountPage = async ({ params }: { params: { id: string } }) => {
  let account;

  try {
    account = await prisma.accounts.findUnique({
      where: { id: params.id },
    });
       
  } catch (err) {
    console.error("Error fetching account:", err);
    account = null;
  }

  if (!account) {
    return <div>Account not found</div>;
  }


  return <AddAccountForm account={account as unknown as Accounts} />;
};

export default EditAccountPage;
