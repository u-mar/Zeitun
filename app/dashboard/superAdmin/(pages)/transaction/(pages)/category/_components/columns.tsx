"use client";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import DeleteAlertDialog from "@/app/dashboard/_components/DeleteAlertDialog";

export type TransactionCategory = {
  no: number;
  id: string;
  name: string;
  issuperAdmin: boolean;
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
    accessorKey: "issuperAdmin",
    header: "Allowed Users",
    cell: ({ row }) => {
      const issuperAdmin = row.getValue("issuperAdmin") as boolean;
      return <div>{issuperAdmin ? "superAdmin" : "All Users"}</div>;
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const transactionCategory = row.original;

      return (
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <Link
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            href={`/dashboard/superAdmin/transaction/category/${transactionCategory.id}`}>
            Edit
          </Link>
          {/* Delete Button */}
          <DeleteAlertDialog id={transactionCategory.id} type="transactionCategory" />
        </div>
      );
    },
  },
];
