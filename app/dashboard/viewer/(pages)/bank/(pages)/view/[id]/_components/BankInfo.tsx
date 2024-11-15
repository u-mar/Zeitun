'use client';
import DeleteAlertDialog from "@/app/dashboard/_components/DeleteAlertDialog";
import Link from "next/link";
import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/config";
import Loading from "@/app/loading"; // Assuming you have a Loading component

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  cashBalance: number;
  digitalBalance: number;
  totalBalance: number;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  accountId: string;
  account: {
    id: string;
    account: string; // Account name (e.g., USD, KES)
  };
  details?: string | null;
  amount: number;
  acc: "cr" | "dr";
  cashBalance: number;
  digitalBalance: number;
  createdAt: Date;
}

interface BankInfoProps {
  bankId: string; // Only pass the bank ID now
}

const BankInfo: React.FC<BankInfoProps> = ({ bankId }) => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["bankPayment", bankId],
    queryFn: () => axios.get(`${API}/viewer/bank/${bankId}`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <div>Error loading bank information.</div>;
  }

  const bank = data.bank as BankAccount;
  const transactions = data.transactions as BankTransaction[];

  // Group transactions by account type
  const accountBalances = transactions.reduce((acc, tx) => {
    const accountType = tx.account.account;
    if (!acc[accountType]) {
      acc[accountType] = { credit: 0, debit: 0 };
    }
    if (tx.acc === "cr") {
      acc[accountType].credit += tx.amount;
    } else {
      acc[accountType].debit += tx.amount;
    }
    return acc;
  }, {} as Record<string, { credit: number; debit: number }>);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{bank.name}</h1>
        <p className="text-gray-500">Account Number: {bank.accountNumber}</p>
      </div>

      {/* Display each account balance */}
      {Object.entries(accountBalances).map(([accountType, balance]) => {
        const totalBalance = balance.credit - balance.debit;
        return (
          <div key={accountType} className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {accountType} Account Balance:
              <span className={`ml-2 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance.toFixed(2)}
              </span>
            </h2>
          </div>
        );
      })}

     

      {/* Transactions Table */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">All Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center">No transactions available</p>
        ) : (
          <div className="overflow-x-auto md:overflow-x-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Digital Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.acc === 'cr' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tx.acc === "cr" ? "Credit" : "Debit"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tx.account.account}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tx.cashBalance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tx.digitalBalance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.details || "-"}
                  </td>
                 
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankInfo;
