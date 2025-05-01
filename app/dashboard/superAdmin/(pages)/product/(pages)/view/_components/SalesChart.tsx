'use client'
import { SellItem, Sell } from "@prisma/client";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface SalesChartProps {
  salesData: (SellItem & { sell: Sell })[];
}

export default function SalesChart({ salesData }: SalesChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || salesData.length === 0) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Process data for the chart
    const processedData = processSalesData(salesData);

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: processedData.labels,
          datasets: [{
            label: 'Sales',
            data: processedData.data,
            borderColor: 'rgba(79, 70, 229, 1)',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: '#1f2937',
              bodyColor: '#1f2937',
              borderColor: 'rgba(203, 213, 225, 1)',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `$${context.parsed.y.toFixed(2)}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(203, 213, 225, 0.5)'
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [salesData]);

  // Process sales data for charting
  const processSalesData = (data: (SellItem & { sell: Sell })[]) => {
    // Group sales by date and calculate total sales per day
    const salesByDate = data.reduce((acc, item) => {
      const date = new Date(item.sell.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += item.price * item.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Sort dates
    const sortedDates = Object.keys(salesByDate).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedDates,
      data: sortedDates.map(date => salesByDate[date])
    };
  };

  return (
    <div className="w-full h-full">
      {salesData.length > 0 ? (
        <canvas ref={chartRef} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No sales data available</p>
        </div>
      )}
    </div>
  );
}