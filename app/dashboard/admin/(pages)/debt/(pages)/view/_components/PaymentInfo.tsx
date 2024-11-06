'use client'
import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API } from '@/lib/config';
import Link from 'next/link';

const PaymentInfo = ({ debt }: { debt: any }) => {
    const { data: payments, isError, isLoading } = useQuery({
        queryKey: ['payments', debt.id],
        queryFn: () => axios.get(`${API}/admin/debt/paid/${debt.id}`).then((res) => res.data),
        staleTime: 0,
        retry: 3,
    });

    const handleAddPayment = async () => {
        // Logic to add a new payment
    };

    if (isLoading) {
        return <PaymentInfoSkeleton />;
    }

    if (isError || !payments) {
        return <p className="text-red-500">Error fetching payments.</p>;
    }

    return (
        <div>
            <div className='flex justify-between'>
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Payments</h2>
                <Link href={`/dashboard/admin/debt/payment?debtId=${debt.id}`}
                    className="mb-4 px-4 py-2 bg-indigo-600 flex items-end justify-end text-white rounded-lg"
                >
                    Add Payment
                </Link></div>
            {payments.length > 0 ? (
                <table className="w-full text-left table-auto border-collapse shadow-lg rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 border font-bold">N/O</th>
                            <th className="px-4 py-2 border font-bold">Amount Paid</th>
                            <th className="px-4 py-2 border font-bold">Cash Amount</th>
                            <th className="px-4 py-2 border font-bold">Digital Amount</th>
                            <th className="px-4 py-2 border font-bold">Payment Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment: any, index: any) => (
                            <tr key={payment.id} className="hover:bg-gray-100 transition-colors">
                                <td className="px-4 py-2 border">{index + 1}</td>
                                <td className="px-4 py-2 border">{payment.amountPaid}</td>
                                <td className="px-4 py-2 border">{payment.cashAmount}</td>
                                <td className="px-4 py-2 border">{payment.digitalAmount}</td>
                                <td className="px-4 py-2 border">{new Date(payment.paymentDate).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-red-500">No payment history for this debt.</p>
            )}
        </div>
    );
};

export default PaymentInfo;

const PaymentInfoSkeleton = () => {
    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8"></div>
            <h2 className="text-xl font-bold mb-4 text-indigo-600">Payments</h2>
            <div className="mb-4 px-4 py-2 bg-gray-300 text-white rounded-lg animate-pulse"></div>
            <table className="w-full text-left table-auto border-collapse shadow-lg rounded-lg">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border font-bold">N/O</th>
                        <th className="px-4 py-2 border font-bold">Amount Paid</th>
                        <th className="px-4 py-2 border font-bold">Cash Amount</th>
                        <th className="px-4 py-2 border font-bold">Digital Amount</th>
                        <th className="px-4 py-2 border font-bold">Payment Date</th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(5)].map((_, index) => (
                        <tr key={index} className="hover:bg-gray-100 transition-colors">
                            <td className="px-4 py-2 border">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-2 border">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-2 border">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-2 border">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </td>
                            <td className="px-4 py-2 border">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};