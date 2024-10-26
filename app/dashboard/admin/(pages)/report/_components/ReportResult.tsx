// ReportResult.tsx
import React from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, ArcElement } from 'chart.js';
// import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface ProductSale {
  productName: string;
  quantitySold: number;
  totalAmount: number;
}

interface CategorySale {
  categoryName: string;
  quantitySold: number;
  totalAmount: number;
}

interface ReportData {
  startDate: string;
  endDate: string;
  totalSalesAmount: number;
  totalItemsSold: number;
  productSales: ProductSale[];
  categorySales: CategorySale[];
  reportBy: string; // 'all', 'product', 'category'
}

interface ReportResultProps {
  data: ReportData;
}

const ReportResult: React.FC<ReportResultProps> = ({ data }) => {
  // Process top five products
  const sortedProductSales = data.productSales.sort(
    (a, b) => b.quantitySold - a.quantitySold
  );
  const topFiveProductSales = sortedProductSales.slice(0, 5);

  // Prepare pie chart data for top five products
  const pieChartData = {
    labels: topFiveProductSales.map((product) => product.productName),
    datasets: [
      {
        label: 'Sales Amount',
        data: topFiveProductSales.map((product) => product.totalAmount),
        backgroundColor: [
          '#4dc9f6',
          '#f67019',
          '#f53794',
          '#537bc4',
          '#acc236',
        ],
      },
    ],
  };

  // Process category sales
  const sortedCategorySales = data.categorySales.sort(
    (a, b) => b.quantitySold - a.quantitySold
  );
  const topCategorySales = sortedCategorySales.slice(0, 5);

  // Prepare bar chart data for categories
  const barChartData = {
    labels: topCategorySales.map((category) => category.categoryName),
    datasets: [
      {
        label: 'Quantity Sold',
        data: topCategorySales.map((category) => category.quantitySold),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Report Results</h2>

      {/* Summary Information */}
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-600">
            Start Date: {new Date(data.startDate).toLocaleDateString()}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-600">
            End Date: {new Date(data.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-600">
            Total Sales Amount: ${data.totalSalesAmount.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-600">
            Total Items Sold: {data.totalItemsSold}
          </p>
        </div>
      </div>

      {data.reportBy === 'all' && (
        <>
          {/* Pie Chart for Top 5 Products */}
          {/* <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Sales Amount of Top 5 Products</h3>
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                  title: {
                    display: true,
                    text: 'Sales Amount of Top 5 Products',
                  },
                },
              }}
            />
          </div> */}

          {/* Product Sales Table */}
          <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Product Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm">
              <thead>
                <tr>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Product Name</th>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Quantity Sold</th>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.productSales.map((product) => (
                  <tr key={product.productName} className="hover:bg-gray-50 transition">
                    <td className="border px-4 py-3 text-gray-600">{product.productName}</td>
                    <td className="border px-4 py-3 text-gray-600">{product.quantitySold}</td>
                    <td className="border px-4 py-3 text-gray-600">
                      ${product.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.reportBy === 'category' && (
        <>
          {/* Bar Chart for Categories */}
          {/* <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Quantity Sold per Category</h3>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Quantity Sold per Category',
                  },
                },
              }}
            />
          </div> */}

          {/* Category Sales Table */}
          <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Category Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm">
              <thead>
                <tr>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Category Name</th>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Quantity Sold</th>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.categorySales.map((category) => (
                  <tr key={category.categoryName} className="hover:bg-gray-50 transition">
                    <td className="border px-4 py-3 text-gray-600">{category.categoryName}</td>
                    <td className="border px-4 py-3 text-gray-600">{category.quantitySold}</td>
                    <td className="border px-4 py-3 text-gray-600">
                      ${category.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.reportBy === 'product' && (
        <>
          {/* Product Sales Table */}
          <h3 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Product Sales</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white shadow-sm">
              <thead>
                <tr>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Product Name</th>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Quantity Sold</th>
                  <th className="border px-4 py-3 bg-gray-100 text-gray-700">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.productSales.map((product) => (
                  <tr key={product.productName} className="hover:bg-gray-50 transition">
                    <td className="border px-4 py-3 text-gray-600">{product.productName}</td>
                    <td className="border px-4 py-3 text-gray-600">{product.quantitySold}</td>
                    <td className="border px-4 py-3 text-gray-600">
                      ${product.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportResult;
