"use client";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/config";
import { useQueryClient } from "@tanstack/react-query";

const DeleteAlertDialog = ({ id, type }: { id: string; type: string }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (type === "order") {
        await axios.delete(`${API}/employee/sell/${id}`);
        queryClient.invalidateQueries({ queryKey: [`EmployeeOrder`] });
      } else if (type === "transaction") {
        await axios.delete(`${API}/employee/transaction/${id}`);
        queryClient.invalidateQueries({ queryKey: [`EmployeeTransaction`] });
      }
      router.refresh();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
    } catch (error: any) {
      console.error("Error during deletion:", error);

      // Check if the error response contains a specific message
      const errorMessage = error?.response?.data?.error || "Something went wrong";

      // Show more detailed error messages if available
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        {loading ? (
          <button className="px-3 py-1 border bg-red-600 text-white flex border-gray-400 rounded hover:bg-gray-100">
            Delete
            <Loader2 className="animate-spin h-4 w-4 text-white mx-2" />
          </button>
        ) : (
          <button className="px-3 py-1 border bg-red-600 text-white border-gray-400 rounded hover:bg-red-500">
            Delete
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeleteAlertDialog;
