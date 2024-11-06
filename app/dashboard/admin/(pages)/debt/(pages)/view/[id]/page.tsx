import { GetServerSideProps } from "next";
import prisma from "@/prisma/client"; // Assuming you have a Prisma client setup
import DebtDetail from "../_components/DebtDetail";

const DebtViewPage = async ({ params }: { params: { id: string } }) => {
  let debt;

  try {
    debt = await prisma.debt.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
        account: true,
      },
    });
  } catch (err) {
    console.error("error", err);
    debt = null;
  }
  if (debt == undefined) {
    return <div>not found debt</div>;
  }
  return (
    <div>
      <DebtDetail debt={debt} />
    </div>
  );
};

export default DebtViewPage;
