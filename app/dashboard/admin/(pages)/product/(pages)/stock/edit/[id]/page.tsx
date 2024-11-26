import React from "react";
import prisma from "@/prisma/client";
import StockQuantityForm from "../../add/_components/AddStockProductForm";

const EditStockProductPage = async ({ params }: { params: { id: string } }) => {
  let product;

  try {
     product = await prisma.stockQuantity.findUnique({
        where: { id: params.id },
        include: {
          variant: {
            include: {
              skus: true, // Include SKUs within each variant
            },
          },
        },
      });
      
  } catch (err) {
    console.error("error", err);
    product = null;
  }
  // Convert null to undefined if necessary
  if (product == undefined) {
    return <div>not found product</div>;
  }

  return <StockQuantityForm stockQuantity={product} />;
};

export default EditStockProductPage;