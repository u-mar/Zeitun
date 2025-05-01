'use client';
import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/config";
import { BsCurrencyDollar, BsCash, BsPencilSquare, BsTrash, BsPlusCircle, BsGraphUp } from "react-icons/bs";
import { motion } from "framer-motion";
import Link from "next/link";
import DeleteAccount from "./DeleteAccount";
import Loading from "@/app/loading";

export default function Accounts() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => axios.get(`${API}/superAdmin/account`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loading />
    </div>;
  }

  if (isError || !data) {
    return <div className="flex justify-center items-center h-screen text-red-500 font-bold text-xl">Error loading accounts.</div>;
  }

  const HOURS_48_IN_MILLISECONDS = 48 * 60 * 60 * 1000;

  function isWithin48Hours(date: Date): boolean {
    const currentTime = new Date().getTime();
    const createdTime = new Date(date).getTime();
    return currentTime - createdTime <= HOURS_48_IN_MILLISECONDS;
  }
     
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center sm:text-left">
            Accounts Dashboard
          </h1>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={"/dashboard/superAdmin/store/add"}
              className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-blue-300/50 transition-all whitespace-nowrap text-sm sm:text-base"
            >
              <BsPlusCircle className="text-lg sm:text-xl mr-1 sm:mr-2" />
              Add New Account
            </Link>
          </motion.div>
        </motion.div>

        {/* Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-6">
          {data.map((account: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-white rounded-2xl overflow-hidden shadow-xl group"
            >
              {/* Decorative header */}
              <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              
              {/* New badge */}
              {isWithin48Hours(new Date(account.createdAt)) && (
                <div className="absolute top-6 right-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">NEW</div>
              )}

              <div className="p-6">
                {/* Account Type with gradient underline */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4 inline-block">
                  {account.account}
                  <div className="h-1 w-full mt-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                </h2>

                {/* Date */}
                <div className="text-gray-600 text-sm mb-5">
                  Created: {new Date(account.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>

                {/* Cards with 3D effect */}
                <div className="space-y-5">
                  <div className="bg-blue-50 p-4 rounded-xl transform transition-transform group-hover:scale-[1.02] shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <BsCurrencyDollar className="text-blue-600 text-2xl" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xs uppercase tracking-wider text-gray-500">Digital Balance</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {account.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(account.balance / (account.balance + account.cashBalance)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                      ></motion.div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-xl transform transition-transform group-hover:scale-[1.02] shadow-md">
                    <div className="flex items-center mb-2">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <BsCash className="text-green-600 text-2xl" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xs uppercase tracking-wider text-gray-500">Cash Balance</p>
                        <p className="text-2xl font-bold text-green-700">
                          {account.cashBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(account.cashBalance / (account.balance + account.cashBalance)) * 100}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
                      ></motion.div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl transform transition-transform group-hover:scale-[1.02] shadow-md">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <BsGraphUp className="text-purple-600 text-2xl" />
                      </div>
                      <div className="ml-4">
                        <p className="text-xs uppercase tracking-wider text-gray-500">Total Balance</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {(account.balance + account.cashBalance).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      href={`/dashboard/superAdmin/store/edit/${account.id}`}
                      className="flex items-center justify-center bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-amber-200/50"
                    >
                      <BsPencilSquare className="text-lg mr-1" /> <span>Edit</span>
                    </Link>
                  </motion.div>
                  <DeleteAccount id={account.id} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
