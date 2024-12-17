"use client";
import { DataTable } from "@/components/ui/dataTable";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API } from "@/lib/config";
import Loading from "@/app/loading";
import { GroupIcon } from "lucide-react";


export default function List() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["transaction"],
    queryFn: () => axios.get(`${API}/superAdmin/transaction`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <div>Error loading transactions.</div>;
  }


  return (
    <div className="my-4 space-y-4 sm:p-6 lg:p-2">
      <div className="flex justify-between">
        <h1 className="font-bold text-2xl">Transactions</h1>
      </div>
      <div className="flex justify-between">
        <div className="flex ju items-center space-x-2 ml-4">
          <Link
            href={`/dashboard/superAdmin/transaction/category`}
            className="flex items-center px-2 py-1 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 w-auto sm:w-auto text-sm sm:text-sm"
          >
            <GroupIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="truncate">Transaction categories</span>
          </Link>
        </div>

        <Link href={"/dashboard/superAdmin/transaction/add"}>
          <Button variant={"default"}>
            Add Transaction
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} type={"transaction"} search={'details'} />
    </div>
  );
}
