'use client'
import { Product, Variant, SKU, SellItem, Sell, Category } from "@prisma/client";
import { CheckCircleIcon, XCircleIcon, ChartBarIcon, } from '@heroicons/react/24/solid';
import { FaArrowLeft, FaSearch, FaSortAmountDown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Pagination from "@/app/dashboard/_components/Pagination";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Tooltip } from "react-tooltip";

// Dynamically import chart component
const SalesChart = dynamic(() => import("./SalesChart"), { ssr: false });

interface ProductDetailProps {
  product: Product & {
    category: Category;
    variants: (Variant & {
      skus: (SKU & {
        sellItem: (SellItem & {
          sell: Sell;
        })[];
      })[];
    })[];
    orderItem: (SellItem & { sell: Sell })[];
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<string>("info");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulate loading state
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  // Filter and sort sales data
  const filteredSales = product.orderItem.filter(item => 
    new Date(item.sell.createdAt).toLocaleDateString().includes(searchTerm)
  );

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (sortField === "date") {
      return sortDirection === "asc" 
        ? new Date(a.sell.createdAt).getTime() - new Date(b.sell.createdAt).getTime()
        : new Date(b.sell.createdAt).getTime() - new Date(a.sell.createdAt).getTime();
    } else if (sortField === "quantity") {
      return sortDirection === "asc" ? a.quantity - b.quantity : b.quantity - a.quantity;
    } else if (sortField === "price") {
      return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
    }
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSoldProducts = sortedSales.slice(indexOfFirstItem, indexOfLastItem);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Calculate sales metrics
  const totalSales = product.orderItem.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalQuantitySold = product.orderItem.reduce((sum, item) => sum + item.quantity, 0);
  const averagePrice = totalQuantitySold > 0 ? totalSales / totalQuantitySold : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 bg-gray-50"
    >
      {/* Header and Navigation */}
      <div className="flex justify-between items-center mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300 bg-white py-2 px-4 rounded-lg shadow-sm"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </motion.button>
        <h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          {product.name}
        </h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white"
        >
          <h3 className="text-lg font-semibold opacity-80">Total Sales</h3>
          <p className="text-3xl font-bold">${totalSales.toFixed(2)}</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl shadow-lg text-white"
        >
          <h3 className="text-lg font-semibold opacity-80">Units Sold</h3>
          <p className="text-3xl font-bold">{totalQuantitySold}</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-lg text-white"
        >
          <h3 className="text-lg font-semibold opacity-80">Average Price</h3>
          <p className="text-3xl font-bold">${averagePrice.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-white rounded-xl shadow-md p-1 overflow-hidden">
        {["info", "variants", "sales"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-center font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {isLoading ? (
        <div className="bg-white p-8 rounded-xl shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
        </div>
      ) : (
        <>
          {/* Product Information Tab */}
          {activeTab === "info" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Product Details</h2>
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-sm font-medium text-gray-500">Product Name</h3>
                      <p className="text-lg font-semibold text-gray-800">{product.name}</p>
                    </div>
                    <div className="border-b pb-3">
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <div className="flex items-center">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                          {product.category.name}
                        </span>
                      </div>
                    </div>
                    <div className="border-b pb-3">
                      <h3 className="text-sm font-medium text-gray-500">Price</h3>
                      <p className="text-lg font-semibold text-gray-800">${product.price}</p>
                    </div>
                    <div className="border-b pb-3">
                      <h3 className="text-sm font-medium text-gray-500">Stock Quantity</h3>
                      <p className="text-lg font-semibold text-gray-800">{product.stockQuantity}</p>
                    </div>
                    <div className="border-b pb-3">
                      <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                      <p className="text-lg font-semibold text-gray-800">
                        {new Date(product.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Description</h2>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {product.description || "No description available."}
                  </p>
                  
                  {/* Additional visualizations could go here */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4 text-gray-800">Sales Overview</h3>
                    <div className="h-64 bg-gray-50 rounded-lg border p-4">
                      <SalesChart salesData={product.orderItem} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Variants Tab */}
          {activeTab === "variants" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg mb-8"
            >
              <h2 className="text-2xl font-bold mb-8 text-indigo-600">Variants & SKUs</h2>
              
              {product.variants.length > 0 ? (
                <div className="space-y-8">
                  {product.variants.map((variant, idx) => (
                    <motion.div 
                      key={variant.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Color: <span className="text-indigo-600">{variant.color}</span>
                          </h3>
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: variant.color.toLowerCase() }}
                            data-tooltip-id={`color-${variant.id}`}
                            data-tooltip-content={variant.color}
                          ></div>
                          <Tooltip id={`color-${variant.id}`} />
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Quantity</th>
                              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {variant.skus.map((sku) => (
                              <tr key={sku.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{sku.sku}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sku.size}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sku.stockQuantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {sku.stockQuantity > 10 ? (
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      In Stock
                                    </span>
                                  ) : sku.stockQuantity > 0 ? (
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Low Stock
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      Out of Stock
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No variants available for this product.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Sales History Tab */}
          {activeTab === "sales" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-xl shadow-lg mb-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-bold text-green-600 mb-4 md:mb-0">Sales History</h2>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by date..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  
                  <div className="relative inline-block">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSort("date")}
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 
                          ${sortField === "date" ? "bg-indigo-50 border-indigo-300" : "bg-white"}`}
                      >
                        Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                      </button>
                      <button
                        onClick={() => toggleSort("quantity")}
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 
                          ${sortField === "quantity" ? "bg-indigo-50 border-indigo-300" : "bg-white"}`}
                      >
                        Quantity {sortField === "quantity" && (sortDirection === "asc" ? "↑" : "↓")}
                      </button>
                      <button
                        onClick={() => toggleSort("price")}
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 
                          ${sortField === "price" ? "bg-indigo-50 border-indigo-300" : "bg-white"}`}
                      >
                        Price {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {filteredSales.length > 0 ? (
                <>
                  <div className="overflow-x-auto bg-white rounded-xl shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N/O</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Per Unit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {currentSoldProducts.map((sellItem, index) => (
                          <motion.tr 
                            key={sellItem.id} 
                            className="hover:bg-gray-50 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indexOfFirstItem + index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sellItem.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${sellItem.price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${(sellItem.quantity * sellItem.price).toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(sellItem.sell.createdAt).toLocaleDateString('en-US', { 
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit' 
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {sellItem.sell.status === "pending" ? (
                                <span className="flex items-center text-yellow-600">
                                  <XCircleIcon className="h-5 w-5 mr-2" /> Pending
                                </span>
                              ) : (
                                <span className="flex items-center text-green-600">
                                  <CheckCircleIcon className="h-5 w-5 mr-2" /> Completed
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6">
                    <Pagination
                      totalItems={filteredSales.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No sales found</h3>
                  <p className="mt-1 text-sm text-gray-500">No sales match your search criteria.</p>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
      
      {/* Quick Action Button */}
      <motion.div 
        className="fixed bottom-8 right-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button 
          onClick={() => router.push(`/dashboard/superAdmin/product/edit/${product.id}`)}
          className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg text-white hover:shadow-xl transition-all duration-300"
          data-tooltip-id="edit-tooltip"
          data-tooltip-content="Edit Product"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <Tooltip id="edit-tooltip" />
      </motion.div>
    </motion.div>
  );
}
