import React from "react";
import { FaExchangeAlt, FaMoneyBillAlt } from "react-icons/fa";

interface SwapInfoProps {
  swap: {
    id: string;
    swapId: string;
    fromAccount: { account: string };
    toAccount: { account: string };
    fromAmount: number;
    fromCashAmount?: number | null;
    fromDigitalAmount?: number | null;
    toAmount: number;
    toCashAmount?: number | null;
    toDigitalAmount?: number | null;
    exchangeRate?: number | null;
    details: string;
    createdAt: Date;
    user: { name?: string | "unknown"; email?: string | "unknown" };
  };
}

const SwapInfo = ({ swap }: SwapInfoProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-indigo-300 rounded-xl shadow-xl p-8 max-w-3xl mx-auto mt-12 transition duration-300 ease-out transform hover:scale-105">
      {/* Header Badge */}
      <div className="flex items-center justify-center mb-8">
        <span className="bg-indigo-200 text-indigo-600 text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center shadow-lg">
          <FaExchangeAlt className="mr-2 text-lg animate-spin-slow" /> Swap
        </span>
      </div>

      {/* Transaction Details */}
      <div className="space-y-6 text-gray-800 text-base leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Swap ID</p>
            <p className="font-semibold text-gray-900">{swap.swapId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">User</p>
            <p className="font-semibold text-gray-900">
              {swap.user.name || swap.user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">From Account</p>
            <p className="font-semibold text-gray-900">
              {swap.fromAccount.account}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">To Account</p>
            <p className="font-semibold text-gray-900">
              {swap.toAccount.account}
            </p>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="font-semibold text-indigo-700">From Amounts</p>
            <div className="mt-2 space-y-1">
              <p className="flex justify-between">
                <span>Cash:</span>
                <span className="font-semibold text-gray-900">
                  {swap.fromCashAmount != null
                    ? swap.fromCashAmount.toFixed(2)
                    : "-"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Digital:</span>
                <span className="font-semibold text-gray-900">
                  {swap.fromDigitalAmount != null
                    ? swap.fromDigitalAmount.toFixed(2)
                    : "0"}
                </span>
              </p>
              <p className="flex justify-between border-t pt-1 font-semibold text-indigo-700">
                <span>Total:</span>
                <span>{swap.fromAmount.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="font-semibold text-indigo-700">To Amounts</p>
            <div className="mt-2 space-y-1">
              <p className="flex justify-between">
                <span>Cash:</span>
                <span className="font-semibold text-gray-900">
                  {swap.toCashAmount != null
                    ? swap.toCashAmount.toFixed(2)
                    : "-"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Digital:</span>
                <span className="font-semibold text-gray-900">
                  {swap.toDigitalAmount != null
                    ? swap.toDigitalAmount.toFixed(2)
                    : "0"}
                </span>
              </p>
              <p className="flex justify-between border-t pt-1 font-semibold text-indigo-700">
                <span>Total:</span>
                <span>{swap.toAmount.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>

        {swap.exchangeRate != null && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Exchange Rate</p>
            <p className="font-semibold text-gray-900">
              {swap.exchangeRate.toFixed(2)}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-500">Details</p>
          <p className="font-semibold text-gray-900">
            {swap.details || "-"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Swap Date</p>
          <p className="font-semibold text-gray-900">
            {swap.createdAt.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwapInfo;
