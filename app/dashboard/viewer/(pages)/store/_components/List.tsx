'use client';
import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/config";
import { BsCurrencyDollar, BsCash, BsPencilSquare, BsTrash, BsPlusCircle } from "react-icons/bs";
import Link from "next/link";

export default function Accounts() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => axios.get(`${API}/viewer/account`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isError || !data) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error loading accounts.</div>;
  }


  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Accounts</h1>
        </div>

        {/* Account Cards */}
        <div className="grid m-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {data.map((account: any, index: number) => (
            <div
              key={index}
              className="relative bg-white bg-opacity-60 backdrop-blur-md rounded-xl shadow-lg p-4 hover:shadow-xl transition-all transform hover:scale-105"
            >
              {/* Date */}
              <div className="absolute top-3 right-3 text-gray-600 text-xs">
                {new Date(account.createdAt).toLocaleDateString()}
              </div>

              {/* Account Type */}
              <h2 className="text-xl font-bold text-gray-800 mb-3">{account.accountType}</h2>

              {/* Account Details */}
              <div className="mb-3">
                <div className="flex items-center">
                  <BsCurrencyDollar className="text-blue-500 text-2xl mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Digital Balance</p>
                    <p className="text-base font-semibold text-blue-800">
                      {account.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(account.balance / (account.balance + account.cashBalance)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center">
                  <BsCash className="text-green-500 text-2xl mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Cash Balance</p>
                    <p className="text-base font-semibold text-green-800">
                      {account.cashBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(account.cashBalance / (account.balance + account.cashBalance)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <div className="text-gray-700 text-xl font-bold mr-2">Σ</div>
                  <div>
                    <p className="text-xs text-gray-500">Total Balance</p>
                    <p className="text-base font-semibold text-gray-900">
                      {(account.balance + account.cashBalance).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
