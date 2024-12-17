import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";

// Extended Bank interface to match all column fields
interface Bank {
  id: string;
  no?: number; // Optional, since "no" is dynamically generated in the cell
  accountNumber: string;
  name: string;
  createdAt: string; // ISO date string, expected to be present
  balance: number; // Balance calculated from transactions
}

// Updated columns to match the Bank type
export const columns: ColumnDef<Bank>[] = [
  {
    accessorKey: "no",
    header: "NO",
    cell: ({ row }) => <span>{row.index + 1}</span>, // Generate row number dynamically
  },
  {
    accessorKey: "accountNumber",
    header: "Account Number",
    cell: ({ row }) => <span>{row.original.accountNumber}</span>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => <span>{row.original.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>, // Display balance with two decimal places
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return format(date, "PP"); // Format date to include full date and time
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const bank = row.original;

      return (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <Link href={`/dashboard/admin/bank/view/${bank.id}`}
            className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100">
            View
          </Link>
        </div>
      );
    },
  },
];
