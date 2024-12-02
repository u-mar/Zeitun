import DeleteAlertDialog from "@/app/dashboard/_components/DeleteAlertDialog";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stock {
  id: string;
  no: number;

  product: {
    name: string;
  };
  quantity: number;
  createdAt: string;

  variants: {
    color: string;
    skus: {
      size: string;
      sku: string;
      stockQuantity: number;
    }[];
  }[];
}

export const columns: ColumnDef<Stock>[] = [
  {
    accessorKey: "no",
    header: "NO",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "product.name",
    header: "product",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      return <span className="font-bold">{row.original.quantity} units</span>;
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
      const stock = row.original;
      const HOURS_48_IN_MILLISECONDS = 48 * 60 * 60 * 1000;

      function isWithin48Hours(date: Date): boolean {
        const currentTime = new Date().getTime();
        const createdTime = new Date(date).getTime();
        return currentTime - createdTime <= HOURS_48_IN_MILLISECONDS;
      }

      const within48Hours = isWithin48Hours(new Date(stock.createdAt));

      return (
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <div
            className={`${within48Hours
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-50"
              }`}
            title={
              within48Hours
                ? "Edit this stock"
                : "Editing disabled for stocks older than 48 hours"
            }
          >
            {within48Hours ? (
              <Link
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" href={`/dashboard/admin/product/stock/edit/${stock.id}`}>
                Edit
              </Link>
            ) : (
              <button className="px-3 py-1 bg-yellow-500 text-white rounded">
                Edit
              </button>
            )}
          </div>

          {/* Delete Button */}
          <div
            className={`${within48Hours
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-50"
              }`}
            title={
              within48Hours
                ? "Delete this stock"
                : "Deleting disabled for stocks older than 48 hours"
            }
          >
            {within48Hours ? (
              <DeleteAlertDialog id={stock.id} type="stock" />

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
