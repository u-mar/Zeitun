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
      const user = row.original;

      // Check if the user role is superAdmin
      const isSuperAdmin = user.role === "superAdmin";
console.log('isSuperAdmin', isSuperAdmin);
      return (
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <div
            className={`${isSuperAdmin
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
              }`}
            title={
              isSuperAdmin
                ? "Editing is disabled for Super Admins"
                : "Edit this user"
            }
          >
            {isSuperAdmin ? (
              <button className="px-3 py-1 bg-yellow-500 text-white rounded">
                Edit
              </button>
            ) : (
              <Link
                href={`/dashboard/admin/user/edit/${user.id}`}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Edit
              </Link>
            )}
          </div>

          {/* Delete Button */}
          <div
            className={`${isSuperAdmin
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
              }`}
            title={
              isSuperAdmin
                ? "Deleting is disabled for Super Admins"
                : "Delete this user"
            }
          >
            {isSuperAdmin ? (
              <button className="px-3 py-1 bg-red-500 text-white rounded">
                Delete
              </button>
            ) : (
              <DeleteAlertDialog id={user.id} type="user" />
            )}
          </div>
        </div>
      );
    },
  }

];
