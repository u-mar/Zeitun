import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";

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
    cell: ({ row }) => <span>{row.original.toAmount.toFixed(2)}</span>,
  },
  {
    accessorKey: "fromAmount",
    header: "From Amount",
    cell: ({ row }) => <span>{row.original.fromAmount.toFixed(2)}</span>,
  },
  {
    accessorKey: "exchangeRate",
    header: "Exchange Rate",
    cell: ({ row }) =>
      row.original.exchangeRate ? (
        <span>{row.original.exchangeRate.toFixed(2)}</span>
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

      const HOURS_48_IN_MILLISECONDS = 48 * 60 * 60 * 1000;

      function isWithin48Hours(date: Date): boolean {
        const currentTime = new Date().getTime();
        const createdTime = new Date(date).getTime();
        return currentTime - createdTime <= HOURS_48_IN_MILLISECONDS;
      }

      const within48Hours = isWithin48Hours(new Date(swap.createdAt));

      return (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <Link href={`/dashboard/admin/swap/view/${swap.id}`}>
            <button className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100">
              View
            </button>
          </Link>

          {/* Edit Button */}
          <div
            className={`${within48Hours ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            title={
              within48Hours
                ? "Edit this swap"
                : "Editing disabled for swaps older than 48 hours"
            }
          >
            {within48Hours ? (
              <Link href={`/dashboard/admin/swap/edit/${swap.id}`}>
                <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  Edit
                </button>
              </Link>
            ) : (
              <button className="px-3 py-1 bg-yellow-500 text-white rounded">
                Edit
              </button>
            )}
          </div>

          {/* Delete Button */}
          <div
            className={`${within48Hours ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            title={
              within48Hours
                ? "Delete this swap"
                : "Deleting disabled for swaps older than 48 hours"
            }
          >
            {within48Hours ? (
              <DeleteAlertDialog id={swap.id} type="swap" />
            ) : (
              <button className="px-3 py-1 bg-red-500 text-white rounded">
                Delete
              </button>
            )}
          </div>
        </div>
      );
    },
  }
];
