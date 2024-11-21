"use client";
import { DataTable } from "@/components/ui/dataTable";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { API } from "@/lib/config";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  PhoneNumber: string;
  role: string;
}
export default function List() {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter()

  const { data, isError, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      axios.get(`${API}/superAdmin/user`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return <div>Error loading data</div>;
  }

  return (
    <div className="my-4 space-y-4 sm:p-6 lg:p-2">
      <div className="flex justify-between">
        <h1 className="font-bold text-2xl">Users</h1>
        <Link href={"/dashboard/superAdmin/user/add"}>
          <Button variant={"default"}>
            Add User
          </Button></Link>
      </div>
      <DataTable columns={columns} data={data} search={'name'} />
    </div>
  )
}
