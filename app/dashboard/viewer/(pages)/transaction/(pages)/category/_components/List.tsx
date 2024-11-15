"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { columns } from "./columns";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/dataTable";
import Loading from "@/app/loading";
import { API } from "@/lib/config";

const List = () => {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["transactionCategory"],
    queryFn: () => axios.get(`${API}/viewer/transaction/category`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="my-4 space-y-4 sm:p-6 lg:p-2">
      <div className="flex justify-between">
        <h1 className="font-bold text-2xl">Transaction Categories</h1>
      </div>
      <DataTable columns={columns} data={data} search={'name'} />
    </div>
  );
};

export default List;
