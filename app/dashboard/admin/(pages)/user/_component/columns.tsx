import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";

interface Users {
  id: string
  name: string
  email: string
  role: string
  PhoneNumber: string
}
export const columns: ColumnDef<Users>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { name } = row.original;
      return <div className="font-medium text-left ">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <Link
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" href={`/dashboard/admin/user/edit/${user.id}`}>
            Edit
          </Link>
          {/* Delete Button */}
          <DeleteAlertDialog id={user.id} type="user" />
        </div>
      )
    }
  }
];
