import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface Product {
  id: string;
  no: number;
  name: string;
  category: {
    name: string;
  };
  createdAt: string;
  price: number;
  stockQuantity: number;
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center space-x-2"
        >
          <span>NO</span>
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "category.name",
    header: "Category", // Accessing the category name directly
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center space-x-2"
        >
          <span>Price</span>
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="font-bold">{row.original.price}</span>; // Format price
    },
  },
  {
    accessorKey: "stockQuantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center space-x-2"
        >
          <span>Stock Quantity</span>
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <span className="font-bold">{row.original.stockQuantity} units</span>;
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
          {/* View Button */}
          <Link href={`/dashboard/admin/product/view/${product.id}`}>
            <button className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100">
              View
            </button>
          </Link>

          {/* Edit Button */}
          <Link
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" href={`/dashboard/admin/product/edit/${product.id}`}>
            Edit
          </Link>
          {/* Delete Button */}
          <DeleteAlertDialog id={product.id} type="product" />
        </div>
      );
    },
  },
];
