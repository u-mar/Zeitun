import React from "react";
import { notFound } from "next/navigation";
import TransactionCategoryForm from "../../_components/CategoryForm";

const TransactionCategoryUpdatePage = async ({ params }: { params: { id: string } }) => {
  let transactionCategory;

  try {
    transactionCategory = await prisma?.transactionCategory.findUnique({ where: { id: params.id } });

  } catch (err) {
    transactionCategory = null;
    notFound();
  }

  // Convert null to undefined if necessary
  if (transactionCategory == undefined) {
    return (
      <div>
       NotFound
      </div>
    );
  }

  return (
    <div>
      <TransactionCategoryForm transactionCategory={transactionCategory} />
    </div>
  );
};

export default TransactionCategoryUpdatePage;
