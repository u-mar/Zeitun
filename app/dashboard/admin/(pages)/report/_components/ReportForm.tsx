// ReportForm.tsx
"use client";

import { API } from "@/lib/config";
import React, { useState, useEffect } from "react";
import Select from "react-select";

interface OptionType {
  value: string;
  label: string;
}

interface ReportFormProps {
  onReportGenerated: (data: any) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onReportGenerated }) => {
  const [reportBy, setReportBy] = useState("all"); // 'all', 'product', 'category'
  const [type, setType] = useState("today");
  const [date, setDate] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [productOption, setProductOption] = useState<OptionType | null>(null);
  const [categoryOption, setCategoryOption] = useState<OptionType | null>(null);
  const [productsOptions, setProductsOptions] = useState<OptionType[]>([]);
  const [categoriesOptions, setCategoriesOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate a list of years from 2021 to the current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 }, (_, i) => 2021 + i);

  // Fetch products and categories for select inputs
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch(`${API}/admin/product`);
        const productsData = await productsResponse.json();
        const productsOptions = productsData.map((product: any) => ({
          value: product.name,
          label: product.name,
        }));
        setProductsOptions(productsOptions);

        // Fetch categories
        const categoriesResponse = await fetch(`${API}/admin/category`);
        const categoriesData = await categoriesResponse.json();
        const categoriesOptions = categoriesData.map((category: any) => ({
          value: category.name,
          label: category.name,
        }));
        setCategoriesOptions(categoriesOptions);
      } catch (error) {
        console.error("Failed to fetch products or categories");
      }
    };

    fetchOptions();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, reportBy });
      if (type === "day") params.append("date", date);
      if (type === "yearX") params.append("year", year);
      if (type === "range") {
        params.append("from", from);
        params.append("to", to);
      }
      if (reportBy === "product" && productOption) {
        params.append("productName", productOption.value);
      }
      if (reportBy === "category" && categoryOption) {
        params.append("categoryName", categoryOption.value);
      }

      const response = await fetch(`${API}/admin/report?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        onReportGenerated(data.report);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg mb-6 space-y-6">
      {/* Report By Header */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setReportBy("all")}
          className={`px-4 py-2 rounded ${
            reportBy === "all" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Generate All
        </button>
        <button
          onClick={() => setReportBy("product")}
          className={`px-4 py-2 rounded ${
            reportBy === "product" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Generate as Product
        </button>
        <button
          onClick={() => setReportBy("category")}
          className={`px-4 py-2 rounded ${
            reportBy === "category" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Generate as Category
        </button>
      </div>

      {/* Report Type Selection */}
      <div className="mb-6">
        <label className="block font-semibold text-lg mb-3 text-gray-700">
          Report Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-gray-300 focus:border-blue-500 transition duration-200 ease-in-out rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="day">Specific Day</option>
          <option value="week">This Week</option>
          <option value="year">This Year</option>
          <option value="yearX">Specific Year</option>
          <option value="range">Date Range</option>
        </select>
      </div>

      {/* Date Inputs */}
      {type === "day" && (
        <div className="mb-6">
          <label className="block font-semibold text-lg mb-3 text-gray-700">
            Select Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 focus:border-blue-500 transition duration-200 ease-in-out rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>
      )}

      {type === "yearX" && (
        <div className="mb-6">
          <label className="block font-semibold text-lg mb-3 text-gray-700">
            Select Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 focus:border-blue-500 transition duration-200 ease-in-out rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400"
          >
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === "range" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-lg mb-3 text-gray-700">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 focus:border-blue-500 transition duration-200 ease-in-out rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block font-semibold text-lg mb-3 text-gray-700">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 focus:border-blue-500 transition duration-200 ease-in-out rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      )}

      {/* Product Select Input */}
      {reportBy === "product" && (
        <div className="mb-6">
          <label className="block font-semibold text-lg mb-3 text-gray-700">
            Select Product
          </label>
          <Select
            options={productsOptions}
            value={productOption}
            onChange={(option) => setProductOption(option)}
            isClearable
            placeholder="Search and select a product..."
          />
        </div>
      )}

      {/* Category Select Input */}
      {reportBy === "category" && (
        <div className="mb-6">
          <label className="block font-semibold text-lg mb-3 text-gray-700">
            Select Category
          </label>
          <Select
            options={categoriesOptions}
            value={categoryOption}
            onChange={(option) => setCategoryOption(option)}
            isClearable
            placeholder="Search and select a category..."
          />
        </div>
      )}

      <button
        onClick={fetchReport}
        className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold w-full transition duration-200 hover:shadow-lg ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Report"}
      </button>
    </div>
  );
};

export default ReportForm;
