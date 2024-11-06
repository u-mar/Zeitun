"use client";
import { z } from "zod";
import React, { useRef, useState } from "react";
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
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import AccountIdSelect from "./AccountIdSelect";
import { paymentSchema } from "@/app/validationSchema/debtPaymmentSchema";
import { Loader2 } from "lucide-react";
import { DebtPayment } from "@prisma/client";

// Ensure cashAmount and digitalAmount are numbers in the Zod schema
const refinedDebtPaymentSchema = paymentSchema.refine((data) => {
  return !isNaN(parseFloat(data.cashAmount?.toString() || "0")) && !isNaN(parseFloat(data.digitalAmount?.toString() || "0"));
}, {
  message: "Amounts must be valid numbers",
  path: ["cashAmount", "digitalAmount"]
});

const AddDebtPaymentForm = ({ debtPayment }: { debtPayment?: DebtPayment }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Extract debtId from URL
  const searchParams = new URLSearchParams(window.location.search);
  const debtId = searchParams.get("debtId") as string;

  // Form references
  const cashAmountRef = useRef<HTMLInputElement | null>(null);
  const digitalAmountRef = useRef<HTMLInputElement | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof refinedDebtPaymentSchema>>({
    resolver: zodResolver(refinedDebtPaymentSchema),
    defaultValues: {
      debtId: debtPayment?.debtId || debtId, // Populate if editing or from URL
      cashAmount: debtPayment?.cashAmount || 0, // Store as number initially
      digitalAmount: debtPayment?.digitalAmount || 0, // Store as number initially
    },
  });

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

  const onSubmit = async (values: z.infer<typeof refinedDebtPaymentSchema>) => {
    // Set default values to zero if empty
    const cashAmt = parseFloat((values.cashAmount?.toString() || "0")) || 0;
    const digitalAmt = parseFloat((values.digitalAmount?.toString() || "0")) || 0;
    const totalAmount = cashAmt + digitalAmt;
  
    console.log('values', values);

    if (totalAmount <= 0) {
      toast.error("Total payment amount must be greater than zero");
      return;
    }
    console.log('values', values);
  
    setLoading(true);
    try {
      if (debtPayment) {
        // PATCH request for editing
        await axios.patch(`${API}/admin/debt/payment/${debtPayment.id}`, {
          ...values,
          cashAmount: cashAmt,
          digitalAmount: digitalAmt,
        });
        toast.success("Successfully Updated Debt Payment");
      } else {
        // POST request for creating new debt payment
        await axios.post(`${API}/admin/debt/paid`, {
          ...values,
          cashAmount: cashAmt,
          digitalAmount: digitalAmt,
        });
        toast.success("Successfully Created Debt Payment");
      }
  
      queryClient.invalidateQueries({ queryKey: ["debtPayment"] });
      router.push("/dashboard/admin/debt"); // Navigate to debt payment dashboard or listing
    } catch (error) {
      console.error("Error handling debt payment request", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto my-10 p-4 shadow-lg rounded-lg">
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl font-bold">
            {debtPayment ? "Edit Debt Payment" : "Add Debt Payment"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash Amount */}
                <FormField
                  control={form.control}
                  name="cashAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter cash amount"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.replace(/[^0-9.]/g, ""))
                          }
                          onKeyDown={(e) => handleEnterPress(e, digitalAmountRef)}
                          onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.cashAmount?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Digital Amount */}
                <FormField
                  control={form.control}
                  name="digitalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digital Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter digital amount"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.replace(/[^0-9.]/g, ""))
                          }
                          onKeyDown={(e) => handleEnterPress(e, detailsRef)}
                          onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.digitalAmount?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <SubmitButtonWithContent loading={loading} isEdit={!!debtPayment} />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default AddDebtPaymentForm;

// Submit Button Component
export const SubmitButtonWithContent = React.forwardRef<HTMLButtonElement, { loading: boolean, isEdit: boolean }>(
  ({ loading, isEdit }, ref) => {
    if (loading) {
      return (
        <Button className="space-x-2 gap-x-1 bg-gray-400" disabled ref={ref}>
          {isEdit ? "Updating Payment" : "Submitting Payment"}
          <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
        </Button>
      );
    }

    return (
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" ref={ref}>
        {isEdit ? "Update Payment" : "Submit Payment"}
      </Button>
    );
  }
);

SubmitButtonWithContent.displayName = "SubmitButtonWithContent";
