'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SalesReports = () => {
    const router = useRouter();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Function to handle form submission for custom report
    const handleCustomReport = () => {
        if (startDate && endDate) {
            // Redirect to the custom report page with the chosen date range as query params
            const from = startDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD
            const to = endDate.toISOString().split('T')[0];
            router.push(`/dashboard/superAdmin/report/generate?report=custom&from=${from}&to=${to}`);
        } else {
            alert('Please select both a start and end date.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
            {/* Heading */}
            <h2 className="text-2xl font-bold mb-6">Generate Sales Reports</h2>

            {/* Report Sections with Links */}
            <div className="space-y-4">
                {/* Today */}
                <Link href="/dashboard/superAdmin/report/generate?report=today"
                    className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
                    <h3 className="text-lg font-semibold">Today Sales</h3>
                    <p className="text-gray-600">View reports of sales made today.</p>
                </Link>

                {/* Yesterday */}
                <Link href="/dashboard/superAdmin/report/generate?report=yesterday"
                    className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
                    <h3 className="text-lg font-semibold">Yesterday Sales</h3>
                    <p className="text-gray-600">View reports of sales made yesterday.</p>
                </Link>

                {/* This Week */}
                <Link href="/dashboard/superAdmin/report/generate?report=this-week"
                    className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
                    <h3 className="text-lg font-semibold">This Week Sales</h3>
                    <p className="text-gray-600">View reports of sales made this week.</p>
                </Link>

                {/* This Month */}
                <Link href="/dashboard/superAdmin/report/generate?report=this-month"
                    className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
                    <h3 className="text-lg font-semibold">This Month Sales</h3>
                    <p className="text-gray-600">View reports of sales made this month.</p>
                </Link>

                {/* This Year */}
                <Link href="/dashboard/superAdmin/report/generate?report=this-year"
                    className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
                    <h3 className="text-lg font-semibold">This Year Sales</h3>
                    <p className="text-gray-600">View reports of sales made this year.</p>
                </Link>

                {/* Custom Report */}
                <div className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition">
                    <h3 className="text-lg font-semibold">Custom Report</h3>
                    <p className="text-gray-600">Select a custom date range to generate a sales report.</p>

                    {/* Date Picker for custom report */}
                    <div className="mt-4">
                        <label className="block text-gray-700 font-semibold">From:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => setStartDate(date)}
                            selectsStart
                            startDate={startDate || undefined}
                            endDate={endDate || undefined}
                            className="w-full p-2 mt-2 border rounded-lg"
                            placeholderText="Select start date"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-gray-700 font-semibold">To:</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate || undefined}
                            endDate={endDate || undefined}
                            className="w-full p-2 mt-2 border rounded-lg"
                            placeholderText="Select end date"
                        />
                    </div>

                    <button
                        className="mt-4 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                        onClick={handleCustomReport}
                    >
                        Generate Custom Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesReports;
