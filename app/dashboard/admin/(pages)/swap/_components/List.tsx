"use client";
import { DataTable } from "@/components/ui/dataTable";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { API } from "@/lib/config";
import Loading from "@/app/loading";


export default function List() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["swap"],
    queryFn: () => axios.get(`${API}/admin/swap`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return <div>Error loading swaps.</div>;
  }


  return (
    <div className="my-4 space-y-4 sm:p-6 lg:p-2">
      <div className="flex justify-between">
        <h1 className="font-bold text-2xl">Swaps</h1>
        <Link href={"/dashboard/admin/swap/add"}>
          <Button variant={"default"}>
            Add Swap
          </Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} type={"swap"} search={'details'} />
    </div>
  );
}
