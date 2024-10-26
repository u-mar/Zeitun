import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";

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
    header: "balance",
    cell: ({ row }) => {
      return <span className="text-gray-700 font-semibold">{row.original.balance.toFixed(2)}</span>; // Format total price
    },
  },
  {
    accessorKey: "cashBalance",
    header: "Cash Balance",
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
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <Link href={`/dashboard/admin/store/view/${account.id}`}>
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              View
            </button>
          </Link>

          {/* Edit Button */}
          <Link href={`/dashboard/admin/store/edit/${account.id}`}>
            <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              Edit
            </button>
          </Link>

          {/* Delete Button */}
          <DeleteAlertDialog id={account.id} type="store" />
        </div>
      );
    },
  },
];
