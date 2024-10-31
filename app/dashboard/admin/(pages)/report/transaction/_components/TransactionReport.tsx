// TransactionReport.tsx
'use client';

import { API } from '@/lib/config';
import { useEffect, useState } from 'react';

// Define types for data fetched from API
type Category = {
  id: string;
  name: string;
};

type ReportData = {
  cashIn: number;
  cashOut: number;
  digitalIn: number;
  digitalOut: number;
  totalIn: number;
  totalOut: number;
  totalAmount?: number;
  transactionCount?: number;
  transactions?: any[];
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  fromDate?: string;
  toDate?: string;
};

export default function TransactionReport() {
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString(); // January is 0, so we add 1
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [transactionType, setTransactionType] = useState<string>('all'); // in/out for normal, deposit/withdrawal for exchange
  const [dateRange, setDateRange] = useState<string>('all-time');
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [results, setResults] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories for dropdowns
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/admin/transaction/category`); // Adjust the API route accordingly
        if (!res.ok) throw new Error('Error fetching categories.');
        const fetchedCategories = await res.json();
        setCategories(fetchedCategories);
      } catch (err) {
        setError('Error fetching categories.');
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = categories.find((c) => c.id === e.target.value);
    if (selected) {
      setSelectedCategory(selected);
      if (selected.name === 'exchange') {
        setTransactionType('both'); // Default to 'both' for exchange
      } else {
        setTransactionType('all'); // Default to 'all' for other categories
      }
    } else {
      setSelectedCategory(null);
      setTransactionType('all');
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();

      // Set category parameter
      if (selectedCategory?.name === 'exchange') {
        queryParams.set('category', 'exchange');
      } else if (selectedCategory) {
        queryParams.set('category', selectedCategory.id);
      } else {
        queryParams.set('category', 'all');
      }

      // Set transactionType parameter
      queryParams.set('transactionType', transactionType);

      // Set date range parameters
      if (dateRange === 'specific-date' && fromDate && toDate) {
        queryParams.set('fromDate', fromDate);
        queryParams.set('toDate', toDate);
      } else if (dateRange === 'specific-month') {
        queryParams.set('fromDate', `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`);
        queryParams.set(
          'toDate',
          `${selectedYear}-${selectedMonth.padStart(2, '0')}-${new Date(
            parseInt(selectedYear),
            parseInt(selectedMonth),
            0
          ).getDate()}`
        );
      } else if (dateRange === 'specific-year') {
        queryParams.set('fromDate', `${selectedYear}-01-01`);
        queryParams.set('toDate', `${selectedYear}-12-31`);
      } else {
        // Handle other date ranges like 'today', 'this-week', etc.
        // For simplicity, let's assume backend can handle dateRange parameter directly
        queryParams.set('dateRange', dateRange);
      }

      const response = await fetch(`${API}/admin/report/transaction?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Error fetching report data.');
      const data = await response.json();

      setResults({
        ...data,
        selectedCategoryName: selectedCategory?.name || 'All Categories',
      });
    } catch (err) {
      setError('Error fetching report data.');
    } finally {
      setLoading(false);
    }
  };

  // Generate list of years dynamically (starting from 2023 up to the current year)
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => (2023 + i).toString());
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Search Filters Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Transaction Report</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">Category</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={selectedCategory?.id || 'all'}
              onChange={handleCategoryChange}
            >
              <option value="all">All Categories (excluding Exchange)</option>
              {categories
                .filter(
                  (category) =>
                    category.name !== 'exchange' || selectedCategory?.name === 'exchange'
                )
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">
              {selectedCategory?.name === 'exchange'
                ? 'Transaction Type (Deposit/Withdrawal)'
                : 'Transaction Type (In/Out)'}
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              {selectedCategory?.name === 'exchange' ? (
                <>
                  <option value="both">Both</option>
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                </>
              ) : (
                <>
                  <option value="all">Both In and Out</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                </>
              )}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">Date Range</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setFromDate(null);
                setToDate(null);
                if (e.target.value === 'specific-month') {
                  setSelectedYear(currentYear.toString());
                  setSelectedMonth(currentMonth);
                } else if (e.target.value === 'specific-year') {
                  setSelectedYear(currentYear.toString());
                }
              }}
            >
              <option value="all-time">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-year">This Year</option>
              <option value="specific-month">Specific Month</option>
              <option value="specific-year">Specific Year</option>
              <option value="specific-date">Specific Date Range</option>
            </select>
          </div>

          {/* Specific Year Selection */}
          {dateRange === 'specific-year' && (
            <div>
              <label className="block text-sm mb-2 text-gray-600">Select Year</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                defaultValue={currentYear.toString()}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Specific Month Selection */}
          {dateRange === 'specific-month' && (
            <>
              <div>
                <label className="block text-sm mb-2 text-gray-600">Select Year</label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  defaultValue={currentYear.toString()}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">Select Month</label>
                <select
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

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

      {/* Error Handling */}
      {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}

      {/* Results Section */}
      {results && (
        <>
          {selectedCategory?.name === 'exchange' ? (
            // Render the summary table for exchange transactions
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Exchange Transaction Summary</h3>
              <p>
                Total Transactions: <strong>{results.transactionCount}</strong>
              </p>
              <p>
                Total Amount: <strong>{results.totalAmount?.toFixed(2)}</strong>
              </p>
              <p>
                Time Range: <strong>{fromDate || 'N/A'} to {toDate || 'N/A'}</strong>
              </p>
              {/* Optionally, render the list of transactions */}
              {results.transactions && results.transactions.length > 0 ? (
                <table className="min-w-full mt-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.transactions.map((t) => (
                      <tr key={t.id}>
                        <td className="border px-4 py-2">
                          {new Date(t.tranDate).toLocaleDateString()}
                        </td>
                        <td className="border px-4 py-2">{t.amount.toFixed(2)}</td>
                        <td className="border px-4 py-2">{t.exchangeType}</td>
                        <td className="border px-4 py-2">{t.user.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No exchange transactions found for the selected criteria.</p>
              )}
            </section>
          ) : (
            // Render the cards for regular transactions
            <section className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {results.cashIn.toFixed(2)}
                </div>
                <div className="text-gray-600">Cash In</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {results.cashOut.toFixed(2)}
                </div>
                <div className="text-gray-600">Cash Out</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {(results.cashIn - results.cashOut).toFixed(2)}
                </div>
                <div className="text-gray-600">Total Cash</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {results.digitalIn.toFixed(2)}
                </div>
                <div className="text-gray-600">Digital In</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {results.digitalOut.toFixed(2)}
                </div>
                <div className="text-gray-600">Digital Out</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {(results.digitalIn - results.digitalOut).toFixed(2)}
                </div>
                <div className="text-gray-600">Total Digital</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {results.totalIn.toFixed(2)}
                </div>
                <div className="text-gray-600">Total In</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {results.totalOut.toFixed(2)}
                </div>
                <div className="text-gray-600">Total Out</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {(results.totalIn - results.totalOut).toFixed(2)}
                </div>
                <div className="text-gray-600">Net Total</div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
