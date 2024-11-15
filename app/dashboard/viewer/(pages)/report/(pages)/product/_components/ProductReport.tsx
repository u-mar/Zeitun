'use client';
import Pagination from "@/app/dashboard/_components/Pagination";
import { API } from "@/lib/config";
import { useEffect, useState } from "react";
import Select from 'react-select';

// Define types
type Product = {
  id: string;
  name: string;
};

type ProductReport = {
  productName: string;
  productPrice: number; // Price per unit of the product
  totalQuantity: number;
  quantitySold: number;
  remainingQuantity: number;
  totalProductValue: number; // Value of all quantities (stock + sold)
  totalSales: number; // Total sales from sold quantities
  unsoldValue: number; // Value of unsold quantities
  profit: number;
};

// Custom option for "All Products"
const ALL_PRODUCTS_OPTION = { value: "all", label: "All Products" };

export default function ProductReport() {
  const itemsPerPage = 25; // Define items per page for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productOptions, setProductOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ value: string; label: string }[]>([]);
  const [products, setProducts] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState({
    totalProductValue: 0,
    totalSales: 0,
    totalUnsoldValue: 0,
    totalProfit: 0,
  });

  // Pagination data slicing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSoldProducts = products ? products.slice(indexOfFirstItem, indexOfLastItem) : [];

  const handlePageChange = (page: number) => setCurrentPage(page);
  // Fetch products for the multi-select dropdown
  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        const response = await fetch(`${API}/viewer/product`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await response.json();

        // Map product data to options format for React Select
        const options = data.map((product) => ({ value: product.id, label: product.name }));

        setProductOptions([ALL_PRODUCTS_OPTION, ...options]);
      } catch (err) {
        setError("Error fetching products");
      }
    };
    fetchProductOptions();
  }, []);

  // Fetch report data when filter button is clicked
  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const productIds = selectedProducts.some(option => option.value === "all")
        ? "all"
        : selectedProducts.map(option => option.value).join(",");

      const response = await fetch(`${API}/viewer/report/product?productIds=${productIds}`);
      if (!response.ok) throw new Error("Failed to fetch product report");
      const data = await response.json();
      setProducts(data);

      // Calculate totals
      const totalProductValue = data.reduce((sum: number, product: ProductReport) => sum + product.totalProductValue, 0);
      const totalSales = data.reduce((sum: number, product: ProductReport) => sum + product.totalSales, 0);
      const totalUnsoldValue = data.reduce((sum: number, product: ProductReport) => sum + product.unsoldValue, 0);
      const totalProfit = data.reduce((sum: number, product: ProductReport) => sum + product.profit, 0);

      setTotals({ totalProductValue, totalSales, totalUnsoldValue, totalProfit });
    } catch (err) {
      setError("Error fetching product report");
    } finally {
      setLoading(false);
    }
  };

  // Handle selection change for React Select
  const handleProductChange = (selectedOptions: any) => {
    if (selectedOptions.some((option: any) => option.value === "all")) {
      setSelectedProducts([ALL_PRODUCTS_OPTION]);
    } else {
      setSelectedProducts(selectedOptions);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 ">Product Report</h1>
      {/* Product Selection Dropdown */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl  mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Filter Products</h2>
        <div className="space-y-4">
          {/* Product Selection Dropdown */}
          <div>
            <label htmlFor="productSelect" className="block mb-2 text-sm font-semibold text-gray-700">
              Select Products
            </label>
            <Select
              isMulti
              options={productOptions}
              value={selectedProducts}
              onChange={handleProductChange}
              className="w-full"
              placeholder="Choose products..."
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#CBD5E0",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "#A0AEC0",
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#A0AEC0",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#EDF2F7",
                  color: "#4A5568",
                  borderRadius: "5px",
                  padding: "0px 5px",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#4A5568",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#4A5568",
                  "&:hover": {
                    backgroundColor: "#E53E3E",
                    color: "white",
                  },
                }),
              }}
            />
          </div>
        </div>

        {/* Filter Button */}
        <div className="text-center">
          <button
            onClick={fetchReport}
            className="w-3/5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-500 hover:to-blue-600 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>



      {/* Report Table with overflow handling */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Product Report</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-lg">
              <h4 className="text-xl font-bold mb-4 text-center text-gray-700">Summary Totals</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-gray-800">
                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                  <strong>Total Product Value (All Quantities):</strong>
                  <div className="text-2xl font-semibold text-gray-900">{totals.totalProductValue.toFixed(2)} KES</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                  <strong>Total Sales:</strong>
                  <div className="text-2xl font-semibold text-green-700">{totals.totalSales.toFixed(2)} KES</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                  <strong>Total Unsold Value:</strong>
                  <div className="text-2xl font-semibold text-red-600">{totals.totalUnsoldValue.toFixed(2)} KES</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                  <strong>Total Profit:</strong>
                  <div className="text-2xl font-semibold text-blue-700">{totals.totalProfit.toFixed(2)} KES</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Product Name</th>
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Product Price (KES)</th>
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Total Quantity</th>
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Quantity Sold</th>
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Remaining Quantity</th>
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Total Product Value (KES)</th>
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Total Sales (KES)</th>
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Unsold Value (KES)</th>
                    <th className="py-3 px-6 border-b font-medium text-gray-700">Profit (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSoldProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 text-center">
                      <td className="py-3 px-6 border-b">{product.productName}</td>
                      <td className="py-3 px-6 border-b">{product.productPrice.toFixed(2)}</td>
                      <td className="py-3 px-6 border-b">{product.totalQuantity}</td>
                      <td className="py-3 px-6 border-b">{product.quantitySold}</td>
                      <td className="py-3 px-6 border-b">{product.remainingQuantity}</td>
                      <td className="py-3 px-6 border-b">{product.totalProductValue.toFixed(2)}</td>
                      <td className="py-3 px-6 border-b">{product.totalSales.toFixed(2)}</td>
                      <td className="py-3 px-6 border-b">{product.unsoldValue.toFixed(2)}</td>
                      <td className="py-3 px-6 border-b">{product.profit.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                totalItems={products.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>



          </>
        )}
      </section>
    </div>
  );
}
