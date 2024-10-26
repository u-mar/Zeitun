import prisma from "@/prisma/client"; // Assuming you have a Prisma client setup
import OrderView from "../_components/OrderDetail";

const OrderViewPage = async ({ params }: { params: { id: string } }) => {
  let order;

  try {
    order = await prisma.sell.findUnique({
      where: { id: params.id },
      include: {
        items: {
            select: {
              quantity: true, // Include the quantity field
              price: true,    // Include the price if needed
            product: {
              select: {
                name: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            sku: {
              select: {
                size: true,
                sku: true,
                variant: {
                  select: {
                    color: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("error", err);
    order = null;
  }
  if (order == undefined) {
    return <div>not found event</div>;
  }
  return (
    <div>
      <OrderView order={order} />
    </div>
  );
};

export default OrderViewPage;
