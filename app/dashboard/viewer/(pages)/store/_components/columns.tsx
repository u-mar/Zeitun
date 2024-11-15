import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

interface Account {
  id: string;
  no: number;
  account: string;
  balance: number;
  cashBalance: number;
  total: number;
  createdAt: Date;
}

export const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "no",
    header: "NO",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "account",
    header: "Account Type",
  },
  {
    accessorKey: "balance",
    header: "Digital balances",
    cell: ({ row }) => {
      return <span className="text-gray-700 font-semibold">{row.original.balance.toFixed(2)}</span>; // Format total price
    },
  },
  {
    accessorKey: "cashBalance",
    header: "Cash Balances",
    cell: ({ row }) => {
      return <span className="text-gray-700 font-semibold">{row.original.cashBalance.toFixed(2)}</span>; // Format total price
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const balance = row.original.balance;
      const cashBalance = row.original.cashBalance;
      const total = cashBalance + balance
      return <span className="text-gray-700 font-semibold">{total.toFixed(2)}  </span>; // Format total price
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return format(date, "PPpp"); // Format date to include full date and time
    },
  },
];
