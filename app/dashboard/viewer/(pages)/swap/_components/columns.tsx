import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

// Extended Swap interface to match all column fields
interface Swap {
  id: string;
  no?: number; // Optional, since "no" is dynamically generated in the cell
  toAmount: number;
  toCashAmount: number;
  toDigitalAmount: number;
  fromAmount: number;
  fromCashAmount: number;
  fromDigitalAmount: number;
  details?: string; // Optional, as it may be absent for some rows
  exchangeRate?: number; // Optional if exchange rate is not always required
  fromAccount: {
    account: string;
  };
  toAccount: {
    account: string;
  };
  category?: {
    name: string; // Optional, as not every swap may have a category
  };
  createdAt: string; // ISO date string, expected to be present
}

// Updated columns to match the Swap type
export const columns: ColumnDef<Swap>[] = [
  {
    accessorKey: "no",
    header: "NO",
    cell: ({ row }) => <span>{row.index + 1}</span>, // Generate row number dynamically
  },
  {
    accessorKey: "details",
    header: "Swap Details",
    cell: ({ row }) =>
      row.original.details ? (
        <span>{row.original.details}</span>
      ) : (
        <span className="text-center">-</span>
      ),
  },
  {
    accessorKey: "fromAccount.account",
    header: "From Account",
    cell: ({ row }) => <span>{row.original.fromAccount.account}</span>,
  },
  {
    accessorKey: "toAccount.account",
    header: "To Account",
    cell: ({ row }) => <span>{row.original.toAccount.account}</span>,
  },
  {
    accessorKey: "toAmount",
    header: "To Amount",
    cell: ({ row }) => <span>{row.original.toAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>,
  },
  {
    accessorKey: "fromAmount",
    header: "From Amount",
    cell: ({ row }) => <span>{row.original.fromAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>,
  },
  {
    accessorKey: "exchangeRate",
    header: "Exchange Rate",
    cell: ({ row }) =>
      row.original.exchangeRate ? (
        <span>{row.original.exchangeRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      ) : (
        <span className="text-center">-</span>
      ),
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
      const swap = row.original;

      return (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <Link href={`/dashboard/viewer/swap/view/${swap.id}`}>
            <button className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100">
              View
            </button>
          </Link>
        </div>
      );
    },
  },
];
