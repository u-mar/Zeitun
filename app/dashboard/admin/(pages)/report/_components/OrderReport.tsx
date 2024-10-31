'use client';

import { API } from "@/lib/config";
import { useEffect, useState } from "react";

// Define types for data fetched from API
type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
};

type User = {
  id: string;
  name: string;
};

type ReportData = {
  cashAmount: number;
  digitalAmount: number;
  totalAmount: number;
  orderCount: number;
  quantityCount: number;
  selectedUserId?: string;
  selectedUserName?: string;
  selectedCategoryId?: string;
  selectedCategoryName?: string;
  selectedProductId?: string;
  selectedProductName?: string;
  fromDate?: string;
  toDate?: string;
};

export default function OrderReport() {
  // Initialize with current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString(); // January is 0, so we add 1
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string, name: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null);
  const [dateRange, setDateRange] = useState<string>('all-time');
  const [fromDate, setFromDate] = useState<string | null>(null); // New state for date range
  const [toDate, setToDate] = useState<string | null>(null); // New state for date range
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString()); // New state for specific year
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth); // New state for specific month
  const [results, setResults] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and users for dropdowns
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, usersRes] = await Promise.all([
          fetch(`${API}/admin/category`),
          fetch(`${API}/admin/user`),
        ]);

        if (!categoriesRes.ok || !usersRes.ok) throw new Error("Error fetching initial data.");

        setCategories(await categoriesRes.json());
        setUsers(await usersRes.json());
      } catch (err) {
        setError("Error fetching categories or users.");
      }
    };

    fetchInitialData();
  }, []);

  // Fetch products based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        try {
          const res = await fetch(
            `${API}/admin/product/product-by-category?category=${selectedCategory.id}`
          );
          if (!res.ok) throw new Error("Error fetching products.");
          setProducts(await res.json());
        } catch (err) {
          setError("Error fetching products.");
        }
      };
      fetchProducts();
    } else {
      const fetchAllProducts = async () => {
        try {
          const res = await fetch(`${API}/admin/product`);
          if (!res.ok) throw new Error("Error fetching products.");
          setProducts(await res.json());
          setSelectedProduct(null); // Reset product when all categories are selected
        } catch (err) {
          setError("Error fetching products.");
        }
      };
      fetchAllProducts();
    }
  }, [selectedCategory]);

  const handleFilter = async () => {
    setLoading(true);
    setError(null);
    try {
      // Automatically set the current year for "specific-month"
      const currentYear = new Date().getFullYear();
      const effectiveYear = selectedYear || currentYear.toString();

      const queryParams = new URLSearchParams({
        category: selectedCategory?.id || 'all',
        product: selectedProduct?.id || 'all',
        user: selectedUser?.id || 'all',
        dateRange: dateRange,
        fromDate: fromDate || '', // Include fromDate in the request
        toDate: toDate || '', // Include toDate in the request
        year: dateRange === 'specific-year' || dateRange === 'specific-month' ? effectiveYear : '', // Add year for specific year/month
        month: selectedMonth || '', // Include selected month if specific month
      }).toString();

      const response = await fetch(`${API}/admin/report?${queryParams}`);
      if (!response.ok) throw new Error("Error fetching report data.");
      const data = await response.json();
      setResults({
        ...data,
        selectedUserName: selectedUser?.name || 'All Users',
        selectedCategoryName: selectedCategory?.name || 'All Categories',
        selectedProductName: selectedProduct?.name || 'All Products',
      });
    } catch (err) {
      setError("Error fetching report data.");
    } finally {
      setLoading(false);
    }
  };

  // Generate list of years dynamically (starting from 2023 up to the current year)
  const years = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => (2023 + i).toString());
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Search Filters Section */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Search Data</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">Category</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={selectedCategory?.id || 'all'}
              onChange={(e) => {
                const selected = categories.find(c => c.id === e.target.value);
                if (selected) {
                  setSelectedCategory(selected);
                } else {
                  setSelectedCategory(null);
                }
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

          {/* Product Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-600">Product</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={selectedProduct?.id || 'all'}
              onChange={(e) => {
                const selected = products.find(p => p.id === e.target.value);
                if (selected) {
                  setSelectedProduct(selected);
                } else {
                  setSelectedProduct(null);
                }
              }}
              disabled={!selectedCategory}
            >
              <option value="all">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
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
                const selected = users.find(u => u.id === e.target.value);
                if (selected) {
                  setSelectedUser(selected);
                } else {
                  setSelectedUser(null);
                }
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

          {/* Date Range Selection */}
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
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {/* Specific Month Selection */}
          {dateRange === 'specific-month' && (
            <div>
              <label className="block text-sm mb-2 text-gray-600">Select Month</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
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
            {loading ? "Loading..." : "Filter"}
          </button>
        </div>
      </section>

      {/* Error Handling */}
      {error && (
        <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>
      )}

      {/* Summary Stats Section */}
      {results && (
        <>
          <section className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-gray-800">
                {results.cashAmount.toFixed(2)}
              </div>
              <div className="text-gray-600">Total Cash</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-gray-800">
                {results.digitalAmount.toFixed(2)}
              </div>
              <div className="text-gray-600">Total mPesa</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-gray-800">
                {results.totalAmount.toFixed(2)}
              </div>
              <div className="text-gray-600">Total Orders</div>
            </div>
          </section>

          {/* Earnings Table Section */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Summary Type</th>
                  <th className="py-2 px-4 border-b">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">From Date</td>
                  <td className="py-2 px-4 border-b">{results.fromDate || "Not Selected Yet"}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">To Date</td>
                  <td className="py-2 px-4 border-b">{results.toDate || "Not Selected Yet"}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">Orders Count</td>
                  <td className="py-2 px-4 border-b">{results.orderCount}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">Quantities Sold</td>
                  <td className="py-2 px-4 border-b">{results.quantityCount}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">Total Cash</td>
                  <td className="py-2 px-4 border-b"><strong>{results.cashAmount}</strong> <small>KES</small></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">Total mPesa</td>
                  <td className="py-2 px-4 border-b"><strong>{results.digitalAmount}</strong> <small>KES</small></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">Total Amount</td>
                  <td className="py-2 px-4 border-b"><strong>{results.totalAmount}</strong> <small>KES</small></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">Selected User</td>
                  <td className="py-2 px-4 border-b">
                    {results.selectedUserName || "All Users"}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">Selected Category</td>
                  <td className="py-2 px-4 border-b">
                    {results.selectedCategoryName || "All Categories"}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">Selected Product</td>
                  <td className="py-2 px-4 border-b">
                    {results.selectedProductName || "All Products"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
