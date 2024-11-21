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
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/config";
import { HiOutlineTrash } from "react-icons/hi";

import { useQueryClient } from "@tanstack/react-query";
import { BsTrash } from "react-icons/bs";

const DeleteAccount = ({ id }: { id: string; }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API}/admin/account/${id}`);
      queryClient.invalidateQueries({ queryKey: [`account`] });


      // Successful deletion
      router.refresh();
      toast.success(`Account deleted successfully!`);
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
          <button className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-lg shadow-md hover:bg-red-600 transition-all">
            <BsTrash className="text-lg" />
            <Loader2 className="animate-spin h-4 w-4 text-white mx-2" />
          </button>
        ) : (
          <button className="flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded-lg shadow-md hover:bg-red-600 transition-all">
            <BsTrash className="text-lg" />
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
export default DeleteAccount;
