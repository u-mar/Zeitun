"use client";
import { DataTable } from "@/components/ui/dataTable";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API } from "@/lib/config";
import Loading from "@/app/loading";


export default function List() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["StockProduct"],
    queryFn: () => axios.get(`${API}/superAdmin/product/stock`).then((res) => res.data),
    staleTime: 0,
    retry: 3,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <div>Error loading products.</div>;
  }


  return (
    <div className="my-4 space-y-4 sm:p-6 lg:p-2">
      <div className="flex justify-between">
        <h1 className="font-bold text-2xl">Stocks</h1>
        <Link href={"/dashboard/superAdmin/product/stock/add"}>
          <Button variant={"default"}>
            Add Stock
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} search={'product'} />
    </div>
  );
}
