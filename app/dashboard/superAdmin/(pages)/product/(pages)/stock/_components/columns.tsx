import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "@/app/dashboard/_components/DeleteAlertDialog";
import { useRouter } from "next/navigation";

interface Product {
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

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "no",
    header: "NO",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      return <span className="font-bold">{row.original.product.name}</span>; // Format price
    },
  },
  {
    accessorKey: "Quantity",
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
      const product = row.original;
      const router = useRouter();

      return (
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <Link
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" href={`/dashboard/admin/product/stock/edit/${product.id}`}>
            Edit
          </Link>
          {/* Delete Button */}
          <DeleteAlertDialog id={product.id} type="stock" />
        </div>
      );
    },
  },
];
