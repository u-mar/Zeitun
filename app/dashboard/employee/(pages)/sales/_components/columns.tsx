import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../_components/DeleteAlertDialog";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  total: number;
  type: string;
  status: string;
  discount: number;
  createdAt: string;
  items: {
    id: string;
    price: number;
    quantity: number;
    sku: {
      size: string;
      sku: string;
      stockQuantity: number;
      variant: {
        color: string;
      };
    };
  }[];
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => {
      return <span className="text-gray-700 font-medium">{row.original.id}</span>;
    },
  },
  {
    accessorKey: "total",
    header: "Total Price",
    cell: ({ row }) => {
      return <span className="text-gray-700 font-semibold">${row.original.total.toFixed(2)}</span>; // Format total price
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusClass =
        row.original.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800";
      return (
        <span className={`px-2 py-1 rounded font-semibold ${statusClass}`}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => {
      return <span className="text-gray-700">${row.original.discount.toFixed(2)}</span>; // Format discount
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
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="text-gray-700 font-medium">
          {order.items.length} {order.items.length === 1 ? "item" : "items"} {/* Display the item count */}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex items-center space-x-2">
          {/* View Button */}
          <Link href={`/dashboard/employee/sales/view/${order.id}`}>
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
              View
            </button>
          </Link>

          {/* Edit Button */}
          <Link
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            href={`/dashboard/employee/sales/edit/${order.id}`}>
            Edit
          </Link>

          {/* Delete Button */}
          <DeleteAlertDialog id={order.id} type="order" />
        </div>
      );
    },
  },
];
