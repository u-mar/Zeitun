import DeleteAlertDialog from "@/app/dashboard/superAdmin/_components/DeleteAlertDialog";
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
      const router = useRouter();
      return (
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <Link
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" href={`/dashboard/superAdmin/product/stock/edit/${stock.id}`}>
            Edit
          </Link>
          {/* Delete Button */}
          <DeleteAlertDialog id={stock.id} type="stock" />
        </div>
      );
    },
  },
];
