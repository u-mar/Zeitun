'use client';

import Pagination from "@/app/dashboard/_components/Pagination";
import { API } from "@/lib/config";
import { useEffect, useState } from "react";

type TransactionCategory = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
};

type Transaction = {
  id: string;
  details: string;
  amount: number;
  tranDate: string;
  type: string;
  acc: string;
  account: {
    id: string;
    account: string;
  }
  senderName?: string;
  receiverName?: string;
};

type ReportData = {
  creditTotal: number;
  debitTotal: number;
  cashTotal: number;
  digitalTotal: number;
  totalAmount: number;
  transactionCount: number;
  transactions: Transaction[];
};

export default function TransactionReport() {
  const itemsPerPage = 25; // Define items per page for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string, name: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null);
  const [dateRange, setDateRange] = useState<string>('all-time');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [acc, setAcc] = useState<string>('all'); // Account filter: all, cr, or dr
  const [results, setResults] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination data slicing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = results ? results.transactions.slice(indexOfFirstItem, indexOfLastItem) : [];

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Fetch categories and users for dropdowns
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, usersRes] = await Promise.all([
          fetch(`${API}/viewer/transaction/category`),
          fetch(`${API}/viewer/user`),
        ]);

        if (!categoriesRes.ok || !usersRes.ok) throw new Error("Error fetching data.");

        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.filter((category: TransactionCategory) => category.name !== "exchange"));
        setUsers(await usersRes.json());
      } catch (err) {
        setError("Error fetching transaction categories or users.");
      }
    };

    fetchInitialData();
  }, []);

  const handleFilter = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        category: selectedCategory?.id || 'all',
        user: selectedUser?.id || 'all',
        dateRange: dateRange,
        fromDate: fromDate || '',
        toDate: toDate || '',
        acc: acc // Include acc filter in the query
      }).toString();

      const response = await fetch(`${API}/viewer/report/transaction?${queryParams}`);
      if (!response.ok) throw new Error("Error fetching transaction report data.");
      const data = await response.json();

      setResults(data);
    } catch (err) {
      setError("Error fetching report data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 ">Transactions Report</h1>
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Search Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">Category</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={selectedCategory?.id || 'all'}
              onChange={(e) => {
                const selected = categories.find((c) => c.id === e.target.value);
                setSelectedCategory(selected || null);
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">User</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={selectedUser?.id || 'all'}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                setSelectedUser(selected || null);
              }}
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Type Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">Account Type</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={acc}
              onChange={(e) => setAcc(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Cr">Credit(IN)</option>
              <option value="Dr">Debit(OUT)</option>
            </select>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">Date Range</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all-time">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-year">This Year</option>
              <option value="specific-date">Specific Date Range</option>
            </select>
          </div>

          {/* Specific Date Range */}
          {dateRange === 'specific-date' && (
            <>
              <div>
                <label className="block text-sm mb-2 text-gray-600">From Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={fromDate || ''}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">To Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={toDate || ''}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Filter Button */}
        <div className="mt-4">
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Filter'}
          </button>
        </div>
      </section>

      {/* Error Message */}
      {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}

      {/* Summary Section */}
      {results && (
        <section className="bg-gradient-to-r from-teal-400 to-blue-500 p-8 rounded-lg shadow-lg text-white mb-6">
          <h3 className="text-2xl font-bold mb-6 text-center">Transaction Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">

            <div className="p-4 bg-white bg-opacity-20 rounded-lg shadow-md hover:bg-opacity-30 transition duration-300">
              <h4 className="text-lg font-semibold mb-2">Total Credit</h4>
              <p className="text-3xl font-extrabold">KES {results.creditTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="p-4 bg-white bg-opacity-20 rounded-lg shadow-md hover:bg-opacity-30 transition duration-300">
              <h4 className="text-lg font-semibold mb-2">Total Debit</h4>
              <p className="text-3xl font-extrabold">KES {results.debitTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="p-4 bg-white bg-opacity-20 rounded-lg shadow-md hover:bg-opacity-30 transition duration-300">
              <h4 className="text-lg font-semibold mb-2">Total Cash</h4>
              <p className="text-3xl font-extrabold">KES {results.cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="p-4 bg-white bg-opacity-20 rounded-lg shadow-md hover:bg-opacity-30 transition duration-300">
              <h4 className="text-lg font-semibold mb-2">Total Digital</h4>
              <p className="text-3xl font-extrabold">KES {results.digitalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="p-4 bg-white bg-opacity-20 rounded-lg shadow-md hover:bg-opacity-30 transition duration-300">
              <h4 className="text-lg font-semibold mb-2">Total Amount</h4>
              <p className="text-3xl font-extrabold">KES {results.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="p-4 bg-white bg-opacity-20 rounded-lg shadow-md hover:bg-opacity-30 transition duration-300">
              <h4 className="text-lg font-semibold mb-2">Transaction Count</h4>
              <p className="text-3xl font-extrabold">{results.transactionCount}</p>
            </div>
          </div>
        </section>
      )}


      {/* Transaction Details Table */}
      {results && results.transactions.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-6 border-b font-medium text-gray-700">Details</th>
                <th className="py-3 px-6 border-b font-medium text-gray-700">Amount (KES)</th>
                <th className="py-3 px-6 border-b font-medium text-gray-700">Type</th>
                <th className="py-3 px-6 border-b font-medium text-gray-700">Account</th>
                <th className="py-3 px-6 border-b font-medium text-gray-700">Acc Type</th>
                <th className="py-3 px-6 border-b font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 text-center">
                  <td className="py-3 px-6 border-b">{transaction.details || "-"}</td>
                  <td className="py-3 px-6 border-b">{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-3 px-6 border-b">{transaction.type}</td>
                  <td className="py-3 px-6 border-b">{transaction.account.account}</td>
                  <td className="py-3 px-6 border-b">{transaction.acc}</td>
                  <td className="py-3 px-6 border-b">
                    {new Date(transaction.tranDate).toLocaleDateString("en-US")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            totalItems={results.transactions.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </section>
      )}
    </div>
  );
}
