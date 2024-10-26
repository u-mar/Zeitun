'use client'
import { Product, Variant, SKU, SellItem, Sell, Category } from "@prisma/client";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'; // For status icons
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface ProductDetailProps {
  product: Product & {
    category: Category; // Add Category to the Product
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

  return (
    <div className="container mx-auto p-6 bg-gray-100">
       <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <FaArrowLeft className="h-6 w-6" />
        </button>
      </div>
      {/* Product Information */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-6 rounded-lg shadow-lg mb-8 text-black">
        <h1 className="text-3xl font-bold mb-4">Product Details</h1>
        <table className="w-full text-left table-auto border-collapse">
          <tbody>
            <tr>
              <th className="px-4 py-2 border font-bold">Product Name</th>
              <td className="px-4 py-2 border">{product.name}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Category Name</th>
              <td className="px-4 py-2 border">{product.category.name}</td> {/* Display Category Name */}
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Price</th>
              <td className="px-4 py-2 border">{product.price}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Description</th>
              <td className="px-4 py-2 border">{product.description}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Stock Quantity</th>
              <td className="px-4 py-2 border">{product.stockQuantity}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border font-bold">Created At</th>
              <td className="px-4 py-2 border">{new Date(product.createdAt).toLocaleString()}</td>
            </tr>
            
          </tbody>
        </table>
      </div>

      {/* Variant and SKU Information */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-bold mb-4 text-indigo-600">Variants & SKUs</h2>
        {product.variants.map((variant) => (
          <div key={variant.id} className="mb-6">
            <h3 className="text-lg font-semibold">Variant Color: <span className="text-indigo-500">{variant.color}</span></h3>
            <table className="w-full mt-4 text-left table-auto border-collapse shadow-lg rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border font-bold">SKU</th>
                  <th className="px-4 py-2 border font-bold">Size</th>
                  <th className="px-4 py-2 border font-bold">Stock Quantity</th>
                </tr>
              </thead>
              <tbody>
                {variant.skus.map((sku) => (
                  <tr key={sku.id} className="hover:bg-gray-100 transition-colors">
                    <td className="px-4 py-2 border">{sku.sku}</td>
                    <td className="px-4 py-2 border">{sku.size}</td>
                    <td className="px-4 py-2 border">{sku.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Sales Information */}
      <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
        <h2 className="text-xl font-bold mb-4 text-green-600">Sales History</h2>
        {product.orderItem.length > 0 ? (
          <table className="w-full text-left table-auto border-collapse shadow-lg rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border font-bold">N/O</th> {/* Index column */}
                <th className="px-4 py-2 border font-bold">Quantity Sold</th>
                <th className="px-4 py-2 border font-bold">Price Per Unit</th>
                <th className="px-4 py-2 border font-bold">Total</th>
                <th className="px-4 py-2 border font-bold">Sell Date & Time</th>
                <th className="px-4 py-2 border font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {product.orderItem.map((sellItem, index) => (
                <tr key={sellItem.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-4 py-2 border">{index + 1}</td> {/* Display index (N/O) */}
                  <td className="px-4 py-2 border">{sellItem.quantity}</td>
                  <td className="px-4 py-2 border">${sellItem.price}</td>
                  <td className="px-4 py-2 border">${sellItem.quantity * sellItem.price}</td>
                  <td className="px-4 py-2 border">{new Date(sellItem.sell.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 border">
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
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-red-500">No sales history for this product.</p>
        )}
      </div>
    </div>
  );
}
