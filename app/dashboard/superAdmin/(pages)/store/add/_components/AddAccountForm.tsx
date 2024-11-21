"use client";
import { accountSchema } from "@/app/validationSchema/account";
import React, { useRef } from "react";
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

// Handle Enter Key Press to navigate between fields
const handleEnterPress = (
  event: React.KeyboardEvent,
  nextRef: React.RefObject<any>
) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission on Enter
    if (nextRef.current && typeof nextRef.current.focus === "function") {
      nextRef.current.focus(); // Focus on the next input
    }
  }
};

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

  const balanceRef = useRef<HTMLInputElement | null>(null);
  const cashBalanceRef = useRef<HTMLInputElement | null>(null);
  const defaultAccountRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  const onSubmit = async (values: z.infer<typeof accountSchema>) => {
    try {
      if (account) {
        await axios.patch(`${API}/superAdmin/account/${account.id}`, values);
      } else {
        await axios.post(`${API}/superAdmin/account`, values);
      }
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success(`Successfully ${account ? "updated" : "created"} account`);
      router.push("/dashboard/superAdmin/store");
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
                        onKeyDown={(e) => handleEnterPress(e, balanceRef)}
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
                        ref={(e) => {
                          field.ref(e);
                          balanceRef.current = e;
                        }}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                        onKeyDown={(e) =>
                          handleEnterPress(e, cashBalanceRef)
                        } // Set focus to next input
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
                        ref={(e) => {
                          field.ref(e);
                          cashBalanceRef.current = e;
                        }}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                        onKeyDown={(e) =>
                          handleEnterPress(e, defaultAccountRef)
                        }
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
                          ref={defaultAccountRef}
                          type="checkbox"
                          id="default"
                          checked={field.value}
                          onChange={field.onChange}
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          onKeyDown={(e) =>
                            handleEnterPress(e, submitButtonRef)
                          }
                        />
                        <FormLabel htmlFor="default" className="text-gray-700">
                          Set as default account
                        </FormLabel>
                      </div>
                    </FormControl>
                    <p className="text-sm text-gray-500 mt-1">
                      If activated, this account will be used as default
                      throughout the app.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <SubmitButtonWithContent
                ref={submitButtonRef}
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

export const SubmitButtonWithContent = React.forwardRef(
  (
    { loading, isUpdate }: { loading: boolean; isUpdate: boolean },
    ref: React.Ref<HTMLButtonElement>
  ) => {
    if (loading) {
      return (
        <Button
          ref={ref}
          className="space-x-2 gap-x-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isUpdate ? "Updating " : "Registering "}
          Account <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
        </Button>
      );
    }

    return (
      <Button
        type="submit"
        ref={ref}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isUpdate ? "Update Account" : "Register Account"}
      </Button>
    );
  }
);
