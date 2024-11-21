import { Transaction } from "@prisma/client";
import React from "react";
import { FaExchangeAlt, FaCreditCard, FaMoneyBillAlt } from "react-icons/fa";

const TransactionInfo = ({ transaction }: { transaction: any }) => {
  const isExchange = transaction.isExchange;
  const isCredit = transaction.acc === "Cr"; // Credit account
  const isDebit = transaction.acc === "Dr"; // Debit account

  // Set colors based on transaction type
  const transactionColor = isCredit ? "text-green-600" : isDebit ? "text-red-600" : "text-gray-600";

  return (
    <div className="border rounded-lg shadow-lg p-8 bg-gradient-to-r from-white to-gray-50 max-w-3xl mx-auto mt-10 transform hover:scale-105 transition-transform duration-300 ease-out">
      {/* Transaction Type Badge */}
      <div className="mb-6">
        {isExchange ? (
          <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center shadow-sm">
            <FaExchangeAlt className="mr-2 animate-bounce" /> Exchange
          </span>
        ) : (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center shadow-sm ${transactionColor}`}>
            {isCredit ? <FaCreditCard className="mr-2" /> : <FaMoneyBillAlt className="mr-2" />}
            {isCredit ? "Credit" : "Debit"}
          </span>
        )}
      </div>

      {/* Transaction Details */}
      <div className="space-y-4 text-lg leading-relaxed">
        <p className="text-gray-700">
          <strong>Transaction ID:</strong> <span className="font-semibold text-gray-900">{transaction.id}</span>
        </p>
        <p className="text-gray-700">
          <strong>User:</strong> <span className="font-semibold text-gray-900">{transaction.user.name || transaction.user.email}</span>
        </p>
        <p className="text-gray-700">
          <strong>Amount:</strong> <span className={`font-bold ${transactionColor}`}>{transaction.amount} {transaction.amountType}</span>
        </p>
        <p className="text-gray-700">
          <strong>Details:</strong> <span className="font-semibold text-gray-900">{transaction.details}</span>
        </p>
        <p className="text-gray-700">
          <strong>Transaction Date:</strong> <span className="font-semibold text-gray-900">{new Date(transaction.tranDate).toLocaleString()}</span>
        </p>
        <p className=" text-gray-700">
          <strong>Reference:</strong> <span className="font-semibold text-gray-900">{transaction.ref}</span>
        </p>

        {/* Exchange-specific Info */}
        {isExchange && (
          <div className="bg-blue-50 p-5 rounded-lg mt-6 shadow-inner">
            <p className="text-md font-bold text-blue-700">Exchange Details:</p>
            <p className="text-md text-gray-700">
              <strong>Exchange Type:</strong> <span className="font-semibold text-gray-900">{transaction.exchangeType}</span>
            </p>

            {/* Conditional Receiver/Sender Information */}
            {transaction.exchangeType === "deposit" ? (
              <>
                <p className="text-md text-gray-700 mt-2">
                  <strong>Receiver Name:</strong> <span className="font-medium">{transaction.receiverName}</span>
                </p>
                <p className="text-md text-gray-700">
                  <strong>Receiver Phone:</strong> <span className="font-medium">{transaction.receiverPhone}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-md text-gray-700 mt-2">
                  <strong>Sender Name:</strong> <span className="font-medium">{transaction.senderName}</span>
                </p>
                <p className="text-md text-gray-700">
                  <strong>Sender Phone:</strong> <span className="font-medium">{transaction.senderPhone}</span>
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionInfo;
