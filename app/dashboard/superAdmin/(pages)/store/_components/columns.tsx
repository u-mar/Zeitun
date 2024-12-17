import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "@/app/dashboard/superAdmin/_components/DeleteAlertDialog";

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
      return <span className="text-gray-700 font-semibold">{row.original.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>; // Format total price
    },
  },
  {
    accessorKey: "cashBalance",
    header: "Cash Balances",
    cell: ({ row }) => {
      return <span className="text-gray-700 font-semibold">{row.original.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>; // Format total price
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const balance = row.original.balance;
      const cashBalance = row.original.cashBalance;
      const total = cashBalance + balance
      return <span className="text-gray-700 font-semibold">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  </span>; // Format total price
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
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <div className="flex items-center space-x-2">

          {/* Edit Button */}
          <Link
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            href={`/dashboard/superAdmin/store/edit/${account.id}`}>
            Edit
          </Link>

          {/* Delete Button */}
          <DeleteAlertDialog id={account.id} type="store" />
        </div>
      );
    },
  },
];
