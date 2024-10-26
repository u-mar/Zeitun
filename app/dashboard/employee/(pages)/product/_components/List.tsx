"use client";
import { DataTable } from "@/components/ui/dataTable";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { columns } from "./columns";
import { API } from "@/lib/config";
import Loading from "@/app/loading";


export default function List() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["EmployeeProduct"],
    queryFn: () => axios.get(`${API}/employee/product`).then((res) => res.data),
    staleTime: 60 * 1000,
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
      <DataTable columns={columns} data={data} search={'name'} />
    </div>
  );
}
