'use client';

import Pagination from "@/app/dashboard/_components/Pagination";
import { API } from "@/lib/config";
import { useState, useEffect } from "react";

type User = {
    id: string;
    name: string;
};

type Account = {
    id: string;
    account: string;
};

type SwapTransaction = {
    id: string;
    swapId: string;
    fromAccount: {
        id: string;
        account: string;
    };
    toAccount: {
        id: string;
        account: string;
    };
    fromAmount: number;
    toAmount: number;
    exchangeRate: number;
    user: {
        id: string;
        name: string;
    };
    createdAt: string;
};

type AccountSummary = {
    account: string;
    totalSwaps: number;
    totalFromAmount: number;
    totalToAmount: number;
};

type ReportData = {
    transactions: SwapTransaction[];
    summary: AccountSummary[];
};

export default function SwapReport() {
    const itemsPerPage = 25;
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('all-time');
    const [fromDate, setFromDate] = useState<string | null>(null);
    const [toDate, setToDate] = useState<string | null>(null);
    const [results, setResults] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = results ? results.transactions.slice(indexOfFirstItem, indexOfLastItem) : [];

    const handlePageChange = (page: number) => setCurrentPage(page);

    // Fetch accounts and users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userResponse = await fetch(`${API}/viewer/user`);
                if (!userResponse.ok) throw new Error("Failed to fetch data.");
                setUsers(await userResponse.json());
            } catch (err) {
                setError("Error fetching accounts or users.");
            }
        };
        fetchData();
    }, []);

    const handleFilter = async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams({
                user: selectedUser,
                dateRange,
                fromDate: fromDate || '',
                toDate: toDate || '',
            }).toString();

            const response = await fetch(`${API}/viewer/report/swap?${queryParams}`);
            if (!response.ok) throw new Error("Error fetching swap report data.");
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
            <h1 className="text-3xl font-bold text-gray-800">Swap Report</h1>
            <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                    {/* User Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">User</label>
                        <select
                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="all">All Users</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                        <select
                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateRange}
                            onChange={(e) => {
                                setDateRange(e.target.value);
                                setFromDate(null);
                                setToDate(null);
                            }}
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={fromDate || ''}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={toDate || ''}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleFilter}
                        className="bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-600 transform transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Apply Filters'}
                    </button>
                </div>
            </section>

            {/* Summary Section */}
            {results && results.summary.map((summary, index) => {
                const accountName = summary.account;

                return (
                    <div
                        key={index}
                        className="p-6 bg-white shadow-lg rounded-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                    >
                        <h4 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                            {accountName}
                        </h4>
                        <div className="space-y-2">
                            <p className="text-lg text-gray-600">
                                <span className="font-medium text-gray-700">Total Transactions:</span>{" "}
                                <strong className="text-gray-800">{summary.totalSwaps}</strong>
                            </p>
                            <p className="text-lg text-gray-600">
                                <span className="font-medium text-gray-700">Total Sent:</span>{" "}
                                <strong className="text-gray-800">{summary.totalFromAmount}</strong>
                            </p>
                            <p className="text-lg text-gray-600">
                                <span className="font-medium text-gray-700">Total Received:</span>{" "}
                                <strong className="text-gray-800">{summary.totalToAmount}</strong>
                            </p>
                        </div>
                    </div>
                );
            })}



            {/* Transaction Details Table */}
            {results && results.transactions.length > 0 && (
                <section className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Swap Transaction Details</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-3 px-6 border-b font-medium text-gray-700">Swap Id</th>
                                    <th className="py-3 px-6 border-b font-medium text-gray-700">From Account</th>
                                    <th className="py-3 px-6 border-b font-medium text-gray-700">To Account</th>
                                    <th className="py-3 px-6 border-b font-medium text-gray-700">From Amount</th>
                                    <th className="py-3 px-6 border-b font-medium text-gray-700">To Amount</th>
                                    <th className="py-3 px-6 border-b font-medium text-gray-700">Exchange Rate</th>
                                    <th className="py-3 px-6 border-b font-medium text-gray-700">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-6 border-b">{transaction.swapId}</td>
                                        <td className="py-3 px-6 border-b">{transaction.fromAccount.account}</td>
                                        <td className="py-3 px-6 border-b">{transaction.toAccount.account}</td>
                                        <td className="py-3 px-6 border-b">{transaction.fromAmount}</td>
                                        <td className="py-3 px-6 border-b">{transaction.toAmount}</td>
                                        <td className="py-3 px-6 border-b">{transaction.exchangeRate.toFixed(2)}</td>
                                        <td className="py-3 px-6 border-b">
                                            {new Date(transaction.createdAt).toLocaleDateString()}
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
                    </div>
                </section>
            )}
        </div>
    );
}
