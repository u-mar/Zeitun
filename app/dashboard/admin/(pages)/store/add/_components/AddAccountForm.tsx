"use client";
import { accountSchema } from "@/app/validationSchema/account";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Accounts } from "@prisma/client";
import { Loader2 } from "lucide-react";

const AddAccountForm = ({ account }: { account?: Accounts }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      account: account?.account,
      balance: account?.balance,
      cashBalance: account?.cashBalance,
      default: account?.default || false, // Added default value
    },
  });

  const onSubmit = async (values: z.infer<typeof accountSchema>) => {
    try {
      if (account) {
        await axios.patch(`${API}/admin/account/${account.id}`, values);
      } else {
        await axios.post(`${API}/admin/account`, values);
      }
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success(`Successfully ${account ? "updated" : "created"} account`);
      router.push("/dashboard/admin/store");
    } catch (err) {
      toast.error("Unknown error, please try again");
    }
  };

  return (
    <>
      <Card className="max-w-xl mx-auto my-10 bg-white shadow-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            {account ? "Update Account" : "Register New Account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Account Type Field */}
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Account Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="KES or USD"
                        {...field}
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Balance Field */}
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter balance"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cash Balance Field */}
              <FormField
                control={form.control}
                name="cashBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Cash Balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter cash balance"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Account Checkbox */}
              <FormField
                control={form.control}
                name="default"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="default"
                          checked={field.value}
                          onChange={field.onChange}
                          className="form-checkbox h-5 w-5 text-indigo-600"
                        />
                        <FormLabel htmlFor="default" className="text-gray-700">
                          Set as default account
                        </FormLabel>
                      </div>
                    </FormControl>
                    <p className="text-sm text-gray-500 mt-1">
                      If activated, this account will be used as default throughout the app.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <SubmitButtonWithContent
                loading={form.formState.isSubmitting}
                isUpdate={!!account}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default AddAccountForm;

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
        Account <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
      </Button>
    );
  }

  return (
    <Button
      type="submit"
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      {isUpdate ? "Update Account" : "Register Account"}
    </Button>
  );
};
