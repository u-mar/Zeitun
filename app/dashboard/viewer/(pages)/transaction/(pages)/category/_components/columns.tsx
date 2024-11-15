"use client";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type TransactionCategory = {
  no: number;
  id: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
};

export const columns: ColumnDef<TransactionCategory>[] = [
  {
    accessorKey: "no",
    header: "NO",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "isAdmin",
    header: "Allowed Users",
    cell: ({ row }) => {
      const isAdmin = row.getValue("isAdmin") as boolean;
      return <div>{isAdmin ? "Admin" : "All Users"}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">Created At</div>,
    cell: ({ row }) => {
      const formattedDate = new Date(row.getValue("createdAt")).toDateString();
      return <div className="text-right font-medium">{formattedDate}</div>;
    },
  },
];
