'use client'
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API } from '@/lib/config';
import Loading from '@/app/loading';

// Interfaces for Sale and Item types
interface Item {
    id: string;
    productId: string;
    quantity: number;
    price: number;
}

interface Sale {
    id: string;
    total: number;
    type: string; // cash or digital
    status: string;
    items: Item[];
    createdAt: string;
    account: {
        account: string; // Account like "KES", "USD"
    };
}

interface AccountRevenue {
    total: number;
    cash: number;
    digital: number;
}

const GenerateReportPage: React.FC = () => {
    const searchParams = useSearchParams();
    const report = searchParams.get('report'); // Get the "report" query param from the URL
    const from = searchParams.get('from'); // Get the "from" query param from the URL (for custom report)
    const to = searchParams.get('to'); // Get the "to" query param from the URL (for custom report)

    const [reportData, setReportData] = useState<Sale[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [revenueByAccount, setRevenueByAccount] = useState<{ [account: string]: AccountRevenue }>({});

    useEffect(() => {
        if (report) {
            fetchReportData(report as string); // Fetch report data when the "report" query param changes
        }
    }, [report, from, to]);

    // Function to fetch report data from the API
    const fetchReportData = async (reportType: string) => {
        setLoading(true);
        setError(null);

        try {
            // Build URL for fetching the report data, including "from" and "to" if the reportType is "custom"
            let url = `${API}/admin/report/${reportType}`;
            if (reportType === 'custom' && from && to) {
                url += `?from=${from}&to=${to}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch report data');
            }

            const data: Sale[] = await response.json();
            setReportData(data); // Set the fetched data to state
            calculateTotals(data); // Calculate totals for items and revenue
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Function to calculate total items sold and revenue by account type
    const calculateTotals = (sales: Sale[]) => {
        let totalItemsCount = 0;
        let accountRevenue: { [account: string]: AccountRevenue } = {};

        sales.forEach((sale) => {
            // Total items count
            totalItemsCount += sale.items.reduce((total, item) => total + item.quantity, 0);

            const accountType = sale.account.account;
            const isCash = sale.type === 'cash';
            const isDigital = sale.type === 'digital';

            if (!accountRevenue[accountType]) {
                accountRevenue[accountType] = {
                    total: 0,
                    cash: 0,
                    digital: 0,
                };
            }

            // Add to total revenue for the account
            accountRevenue[accountType].total += sale.total;
            if (isCash) {
                accountRevenue[accountType].cash += sale.total;
            } else if (isDigital) {
                accountRevenue[accountType].digital += sale.total;
            }
        });

        setTotalItems(totalItemsCount);
        setRevenueByAccount(accountRevenue);
    };

    // Render loading state
    if (loading) {
        return <Loading />;
    }

    // Render error state
    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="max-w-7xl mx-auto mt-10 p-6 bg-gray-50">
            <h2 className="text-3xl font-bold mb-6">Sales Report - {typeof report === 'string' ? report.toUpperCase() : ''}</h2>

            {/* Render cards to show total items sold */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Items Sold */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Total Items Sold</h3>
                    <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                </div>

                {/* Render revenue by existing account types */}
                {Object.entries(revenueByAccount).map(([account, revenue]) => (
                    <div key={account} className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-700">Account {account}</h3>
                        <p className="text-xl text-gray-900">
                            <strong>Total Revenue:</strong> ${revenue.total.toFixed(2)}
                        </p>
                        <p className="text-xl text-green-500">
                            <strong>Cash Revenue:</strong> ${revenue.cash.toFixed(2)}
                        </p>
                        <p className="text-xl text-blue-500">
                            <strong>{account === 'KES' ? 'mPesa' : account === 'USD' ? 'EVC' : 'Digital'} Revenue:</strong> ${revenue.digital.toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GenerateReportPage;
