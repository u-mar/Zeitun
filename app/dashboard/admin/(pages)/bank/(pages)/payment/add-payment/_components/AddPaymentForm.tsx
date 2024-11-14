"use client";
import { z } from "zod";
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { API } from "@/lib/config";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { bankTransactionSchema } from "@/app/validationSchema/bankTransactionSchema";
import { Loader2 } from "lucide-react";
import { BankTransaction } from "@prisma/client";
import AccountIdSelect from "./AccountIdSelect";

const AddPaymentForm = ({ bankTransaction }: { bankTransaction?: BankTransaction }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Extract bankAccountId and acc from URL
  const searchParams = useSearchParams();
  const bankAccountId = searchParams.get("bankAccountId") || undefined;
  const acc = searchParams.get("acc") || undefined;

  // Ensure acc and bankAccountId are available
  useEffect(() => {
    if (!bankTransaction && (!bankAccountId || !acc)) {
      toast.error("Missing required parameters");
      router.push("/dashboard/admin/bank");
    }
  }, [bankAccountId, acc, bankTransaction, router]);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof bankTransactionSchema>>({
    resolver: zodResolver(bankTransactionSchema),
    defaultValues: {
      bankAccountId: bankTransaction?.bankAccountId || bankAccountId,
      acc: bankTransaction?.acc || (acc === "credit" ? "cr" : "dr"), // Use 'cr' for credit and 'dr' for debit
      accountId: bankTransaction?.accountId || "",
      cashBalance: bankTransaction?.cashBalance || 0,
      digitalBalance: bankTransaction?.digitalBalance || 0,
      details: bankTransaction?.details || "",
    },
  });


  // Prevent scroll on number inputs
  const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    event.currentTarget.blur();
  };


  const onSubmit = async (values: z.infer<typeof bankTransactionSchema>) => {
    const cashAmt = parseFloat(values.cashBalance?.toString() || "0") || 0;
    const digitalAmt = parseFloat(values.digitalBalance?.toString() || "0") || 0;
    const totalAmount = cashAmt + digitalAmt;

    if (totalAmount <= 0) {
      toast.error("Total payment amount must be greater than zero");
      return;
    }

    setLoading(true);
    try {
      if (bankTransaction) {
        await axios.patch(`${API}/admin/bankTransaction/${bankTransaction.id}`, {
          ...values,
          cashBalance: cashAmt,
          digitalBalance: digitalAmt,
        });
        toast.success(`Successfully Updated ${acc || bankTransaction?.acc == 'cr' ? 'Credit' : 'Debit'} Payment`);
      } else {
        await axios.post(`${API}/admin/bankTransaction`, {
          ...values,
          cashBalance: cashAmt,
          digitalBalance: digitalAmt,
        });
        toast.success(`Successfully Created ${acc}`);
      }

      queryClient.invalidateQueries({ queryKey: ["bankPayment"] });
      router.push(`/dashboard/admin/bank/view/${bankAccountId || bankTransaction?.bankAccountId}`);
    } catch (error: any) {
      console.error("Error handling payment request", error);
      toast.error(error.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto my-10 p-6 shadow-lg rounded-lg bg-white">
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl font-bold text-gray-700">
            {bankTransaction ? `Edit ${acc || bankTransaction.acc == 'cr' ? 'Credit' : 'Debit'} Payment` : `Add ${acc == 'credit' ? 'Credit' : 'Debit'} Payment`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash Amount */}
                <FormField
                  control={form.control}
                  name="cashBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter cash amount"
                          {...field}
                          onWheel={handleWheel}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Digital Amount */}
                <FormField
                  control={form.control}
                  name="digitalBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digital Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter digital amount"
                          {...field}
                          onWheel={handleWheel}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Account ID */}
              <FormField
                control={form.control}
                name="accountId"
                render={() => <AccountIdSelect control={form.control} setValue={form.setValue} initialAccountId={bankTransaction?.accountId} />}
              />
              {/* Details */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Details</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter payment details (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex justify-center">
                <SubmitButtonWithContent loading={loading} isEdit={!!bankTransaction} />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default AddPaymentForm;

// Submit Button Component
export const SubmitButtonWithContent = React.forwardRef<
  HTMLButtonElement,
  { loading: boolean; isEdit: boolean }
>(({ loading, isEdit }, ref) => {
  return loading ? (
    <Button className="space-x-2 bg-gray-400" disabled ref={ref}>
      {isEdit ? "Updating Payment" : "Submitting Payment"}
      <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
    </Button>
  ) : (
    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" ref={ref}>
      {isEdit ? "Update Payment" : "Submit Payment"}
    </Button>
  );
});

SubmitButtonWithContent.displayName = "SubmitButtonWithContent";
