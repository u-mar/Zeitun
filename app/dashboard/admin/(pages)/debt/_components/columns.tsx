import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";
import { useRouter } from "next/navigation";

interface Debt {
  id: string;
  no: number;
  details: string;
  takerName: string;
  createdAt: string;
  cashAmount: number;
  digitalAmount: number;
  remainingAmount: number;
  amountTaken: number;
  status: string;
  account: {
    id: string;
    account: string;
  };
}

export const columns: ColumnDef<Debt>[] = [
  {
    accessorKey: "no",
    header: "NO",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "takerName",
    header: "Taker Name",
  },
  {
    accessorKey: "cashAmount",
    header: "Cash Amount", // Accessing the category name directly
  },
  {
    accessorKey: "digitalAmount",
    header: "mPESA Amount", // Accessing the category name directly
  },
  {
    accessorKey: "amountTaken",
    header: "Amount Taken",
    cell: ({ row }) => {
      return <span className="font-bold">{row.original.amountTaken}</span>; // Format price
    },
  },
  {
    accessorKey: "remainingAmount",
    header: "Remaining Amount",
    cell: ({ row }) => {
      return <span className="font-bold text-red-500">{row.original.remainingAmount}</span>; // Format price
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let statusClass = "";
      let statusText = "";

      switch (status) {
      case "taken":
        statusClass = "bg-red-500 text-white";
        statusText = "Taken";
        break;
      case "returned":
        statusClass = "bg-green-500 text-white";
        statusText = "Returned";
        break;
      case "partially_returned":
        statusClass = "bg-yellow-500 text-white";
        statusText = "Partially Returned";
        break;
      default:
        statusClass = "bg-gray-500 text-white";
        statusText = "Unknown";
      }

      return <span className={`px-2 py-1 rounded ${statusClass}`}>{statusText}</span>;
    },
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
      const debt = row.original;
      const router = useRouter();

      return (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <Link href={`/dashboard/admin/debt/view/${debt.id}`}>
            <button className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100">
              View
            </button>
          </Link>

          {/* Edit Button */}
          <Link
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" href={`/dashboard/admin/debt/edit/${debt.id}`}>
            Edit
          </Link>
          {/* Delete Button */}
          <DeleteAlertDialog id={debt.id} type="debt" />
        </div>
      );
    },
  },
];
