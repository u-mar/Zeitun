'use client'
import { Debt, DebtPayment, Accounts } from "@prisma/client";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import PaymentInfo from "./PaymentInfo";

interface DebtDetailProps {
  debt: Debt & {
    account: Accounts;
    payments: DebtPayment[];
  };
}

export default function DebtDetail({ debt }: DebtDetailProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 bg-gray-100">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <FaArrowLeft className="h-6 w-6" />
        </button>
      </div>
      {/* Debt Information */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-6 rounded-lg shadow-lg mb-8 text-black">
        <h1 className="text-3xl font-bold mb-4">Debt Details</h1>
        <table className="w-full text-left table-auto border-collapse">
          <tbody>
            <tr>
              <th className="px-4 py-2 border font-bold">Debt Details</th>
              <td className="px-4 py-2 border">{debt.details}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Taker Name</th>
              <td className="px-4 py-2 border">{debt.takerName}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Amount Taken</th>
              <td className="px-4 py-2 border">{debt.amountTaken}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Remaining Amount</th>
              <td className="px-4 py-2 border">{debt.remainingAmount}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Cash Amount</th>
              <td className="px-4 py-2 border">{debt.cashAmount}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Digital Amount</th>
              <td className="px-4 py-2 border">{debt.digitalAmount}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Status</th>
              <td className="px-4 py-2 border">{debt.status}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Created At</th>
              <td className="px-4 py-2 border">{new Date(debt.createdAt).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Information */}
      <PaymentInfo debt={debt} />
    </div>
  );
}
