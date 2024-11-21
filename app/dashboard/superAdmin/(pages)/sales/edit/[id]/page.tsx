// pages/dashboard/superAdmin/sales/[id]/page.tsx

import React from "react";
import prisma from "@/prisma/client";
import AddOrderForm, { Order } from "../../add/_components/AddOrderForm"; // Import Order type

const EditOrderPage = async ({ params }: { params: { id: string } }) => {
  let order;

  try {
    order = await prisma.sell.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: {
                  include: {
                    skus: true,
                  },
                },
              },
            },
            sku: {
              include: {
                variant: {
                  include: {
                    skus: true,
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    });
       
  } catch (err) {
    console.error("Error fetching order:", err);
    order = null;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return <AddOrderForm order={order as unknown as Order} />;
};

export default EditOrderPage;
