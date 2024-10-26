"use client";
import { transactionCategorySchema } from "@/app/validationSchema/transactionCategorySchema";
import { z } from "zod";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { API } from "@/lib/config";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionCategory } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"; // Import for Checkbox UI component

const TransactionCategoryForm = ({
  transactionCategory,
}: {
  transactionCategory?: TransactionCategory;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof transactionCategorySchema>>({
    resolver: zodResolver(transactionCategorySchema),
    defaultValues: {
      name: transactionCategory?.name || "",
      description: transactionCategory?.description || "",
      isAdmin: transactionCategory?.isAdmin || false, // Correctly handling isAdmin field
    },
  });

  const onSubmit = async (
    values: z.infer<typeof transactionCategorySchema>
  ) => {
    try {
      const updatedValues = {
        ...values,
      };

      if (transactionCategory) {
        await axios.patch(
          `${API}/admin/transaction/category/${transactionCategory.id}`,
          updatedValues
        );
      } else {
        await axios.post(`${API}/admin/transaction/category`, updatedValues);
      }

      queryClient.invalidateQueries({ queryKey: ["transactionCategory"] });

      toast.success(
        `Successfully ${
          transactionCategory ? "Updated" : "Created"
        } Transaction Category`
      );
      router.push("/dashboard/admin/transaction/category");
    } catch (err) {
      toast.error("Unknown error, please try again.");
    }
  };

  return (
    <>
      <Card className="max-w-xl mx-auto my-10 bg-white shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            {transactionCategory
              ? "Update Transaction Category"
              : "Register New Transaction Category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter transaction Category name"
                        {...field}
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a description"
                        {...field}
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Admin-only toggle */}
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Admin Only</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SubmitButtonWithContent
                loading={form.formState.isSubmitting}
                isUpdate={!!transactionCategory}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default TransactionCategoryForm;

export const SubmitButtonWithContent = ({
  loading,
  isUpdate,
}: {
  loading: boolean;
  isUpdate: boolean;
}) => {
  if (loading) {
    return (
      <Button className="space-x-2 gap-x-1 bg-indigo-600 hover:bg-indigo-700 text-white">
        {isUpdate ? "Updating " : "Registering "}
        TransactionCategory{" "}
        <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
      </Button>
    );
  }

  return (
    <Button
      type="submit"
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      {isUpdate
        ? "Update Transaction Category"
        : "Register Transaction Category"}
    </Button>
  );
};
