// ReportPage.tsx
"use client";
import React, { useState } from "react";
import ReportForm from "./_components/ReportForm";
import ReportResult from "./_components/ReportResult";
import SalesReports from "./_components/SalesReport";
import OrderReport from "./_components/OrderReport";

const ReportPage = () => {
  const [reportData, setReportData] = useState(null);

  return (
    // <div className="min-h-screen bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 p-6">
    //   <div className="max-w-6xl mx-auto">
    //     <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
    //       Sales Report
    //     </h1>
    //     <ReportForm onReportGenerated={setReportData} />
    //     {reportData && <ReportResult data={reportData} />}
    //   </div>
    // </div>
    // <SalesReports />
    <OrderReport />
  );
};

export default ReportPage;
