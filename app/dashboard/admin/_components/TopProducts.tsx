'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { API } from "@/lib/config";

const TopProducts: React.FC = () => {
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch the top 5 products from the API
    const fetchTopProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/admin/dashboard/top-products`); // Replace with your API endpoint
            setTopProducts(response.data);
        } catch (error) {
            console.error("Error fetching top products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTopProducts();
    }, []);

    return (
        <div className="col-span-12 xl:col-span-7">
            <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="mb-6 flex justify-between">
                    <div>
                        <h4 className="text-title-sm2 font-bold text-black dark:text-white">
                            Top 10 Products
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Based on total sales and profit
                        </p>
                    </div>
                </div>

                {/* Table Header */}
                <div className="flex flex-col">
                    <div className="grid grid-cols-5 rounded-sm bg-gray-100 dark:bg-meta-4">
                        <div className="p-2.5 xl:p-4">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Product
                            </h5>
                        </div>
                        <div className="p-2.5 text-center xl:p-4">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Quantity Sold
                            </h5>
                        </div>
                        <div className="p-2.5 text-center xl:p-4">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Price
                            </h5>
                        </div>
                        <div className="p-2.5 text-center xl:p-4">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Total Sales
                            </h5>
                        </div>
                        <div className="p-2.5 text-center xl:p-4">
                            <h5 className="text-sm font-medium uppercase xsm:text-base">
                                Profit
                            </h5>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="animate-pulse">
                            {[...Array(5)].map((_, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-5 border-b border-stroke dark:border-strokedark p-4"
                                >
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Products Data
                        topProducts.map((product, key) => (
                            <div
                                key={key}
                                className={`grid grid-cols-5 ${key === topProducts.length - 1
                                    ? ""
                                    : "border-b border-stroke dark:border-strokedark"
                                    }`}
                            >
                                {/* Product Name and Image */}
                                <div className="flex items-center gap-3 p-2.5 xl:p-5">
                                    <p className=" font-medium text-black dark:text-white sm:block">
                                        {product.productName}
                                    </p>
                                </div>

                                {/* Quantity Sold */}
                                <div className="flex items-center justify-center p-2.5 xl:p-5">
                                    <p className="font-medium text-black dark:text-white">
                                        {product.quantitySold}
                                    </p>
                                </div>

                                {/* Product Price */}
                                <div className="flex items-center justify-center p-2.5 xl:p-5">
                                    <p className="font-medium text-black dark:text-white">
                                        {product.productPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Total Sales */}
                                <div className="flex items-center justify-center p-2.5 xl:p-5">
                                    <p className="font-medium text-meta-3">
                                        {(product.totalSales).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Profit */}
                                <div className="flex items-center justify-center p-2.5 xl:p-5">
                                    <p className="font-medium text-meta-5">
                                        {(product.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopProducts;
