'use client';

import Pagination from "@/app/dashboard/_components/Pagination";
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

type SoldProduct = {
  productName: string;
  productPrice: number;
  sellPrice: number;
  quantitySold: number;
  profit: number;
  saleDate: string;
};


type ReportData = {
  cashAmount: number;
  digitalAmount: number;
  totalAmount: number;
  orderCount: number;
  profit: number;
  quantityCount: number;
  soldProducts: SoldProduct[]; // New addition
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
  const itemsPerPage = 25; // Define items per page for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
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


  // Pagination data slicing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSoldProducts = results ? results.soldProducts.slice(indexOfFirstItem, indexOfLastItem) : [];

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Fetch categories and users for dropdowns
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, usersRes] = await Promise.all([
          fetch(`${API}/superAdmin/category`),
          fetch(`${API}/superAdmin/user`),
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
            `${API}/superAdmin/product/product-by-category?category=${selectedCategory.id}`
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
          const res = await fetch(`${API}/superAdmin/product`);
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

      const response = await fetch(`${API}/superAdmin/report?${queryParams}`);
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
      <h1 className="text-3xl font-bold text-gray-800 ">Order Report</h1>
      {/* Search Filters Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">Filter Data</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedProduct?.id || 'all'}
              onChange={(e) => {
                const selected = products.find((p) => p.id === e.target.value);
                setSelectedProduct(selected || null);
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">User</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
            <select
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Year</label>
              <select
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Month</label>
              <select
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          )}

          {/* Specific Date Range */}
          {dateRange === 'specific-date' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={fromDate || ''}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={toDate || ''}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Filter Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleFilter}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      </section>


      {/* Error Handling */}
      {error && <div className="text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}

      {/* Summary Stats Section */}
      {results && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-lg shadow-lg">
            {[
              { label: "Total Cash", value: results.cashAmount, color: "text-teal-500" },
              { label: "Total mPesa", value: results.digitalAmount, color: "text-purple-500" },
              { label: "Total Orders", value: results.totalAmount, color: "text-blue-500" },
              { label: "Profit", value: results.profit, color: "text-green-500" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md text-center transition duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <div className={`text-3xl font-bold ${item.color}`}>
                  {item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES
                </div>
                <div className="text-gray-600">{item.label}</div>
              </div>
            ))}
          </section>

          {/* Earnings Table Section */}
          <section className="bg-white p-8 rounded-lg shadow-lg mt-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Earnings Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="py-3 px-6 border-b text-left font-semibold text-gray-700">Summary Type</th>
                    <th className="py-3 px-6 border-b text-left font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "From Date", value: results.fromDate || "Not Selected Yet" },
                    { label: "To Date", value: results.toDate || "Not Selected Yet" },
                    { label: "Orders Count", value: results.orderCount },
                    { label: "Quantities Sold", value: results.quantityCount },
                    { label: "Total Cash", value: `${results.cashAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES` },
                    { label: "Total mPesa", value: `${results.digitalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES` },
                    { label: "Total Amount", value: `${results.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES` },
                    { label: "Profit", value: `${results.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES` },
                    { label: "Selected User", value: results.selectedUserName || "All Users" },
                    { label: "Selected Category", value: results.selectedCategoryName || "All Categories" },
                    { label: "Selected Product", value: results.selectedProductName || "All Products" },
                  ].map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition duration-200">
                      <td className="py-3 px-6 border-b text-gray-600 font-semibold">{item.label}</td>
                      <td className="py-3 px-6 border-b">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>


          {/* Sold Products Table Section */}
          {results && (
            <>
              <section className="bg-white p-6 rounded-lg shadow-md overflow-auto">
                <h3 className="text-lg font-semibold mb-4">Sold Products</h3>
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-6 border-b font-medium text-gray-700">Product Name</th>
                      <th className="py-3 px-6 border-b font-medium text-gray-700">Product Price (KES)</th>
                      <th className="py-3 px-6 border-b font-medium text-gray-700">Sell Price (KES)</th>
                      <th className="py-3 px-6 border-b font-medium text-gray-700">Quantity Sold</th>
                      <th className="py-3 px-6 border-b font-medium text-gray-700">Profit (KES)</th>
                      <th className="py-3 px-6 border-b font-medium text-gray-700">Sale Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSoldProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50 text-center">
                        <td className="py-3 px-6 border-b">{product.productName}</td>
                        <td className="py-3 px-6 border-b">{product.productPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-6 border-b">{product.sellPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-6 border-b">{product.quantitySold}</td>
                        <td className="py-3 px-6 border-b">{product.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-3 px-6 border-b">
                          {new Date(product.saleDate).toLocaleString("en-US", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Component */}
                <Pagination
                  totalItems={results.soldProducts.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </section>
            </>
          )}
        </>
      )}

    </div>

  );
}
