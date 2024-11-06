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
import { debtSchema } from "@/app/validationSchema/debtSchema";
import { Loader2 } from "lucide-react";
import { Debt } from "@prisma/client";

// Ensure cashAmount and digitalAmount are numbers in the Zod schema
const refinedDebtSchema = debtSchema.refine((data) => {
  return !isNaN(parseFloat(data.cashAmount?.toString() || "0")) && !isNaN(parseFloat(data.digitalAmount?.toString() || "0"));
}, {
  message: "Amounts must be valid numbers",
  path: ["cashAmount", "digitalAmount"]
});

const AddDebtForm = ({ debt }: { debt?: Debt }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Form references
  const cashAmountRef = useRef<HTMLInputElement | null>(null);
  const digitalAmountRef = useRef<HTMLInputElement | null>(null);
  const takerNameRef = useRef<HTMLInputElement | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof refinedDebtSchema>>({
    resolver: zodResolver(refinedDebtSchema),
    defaultValues: {
      accountId: debt?.accountId || "", // Populate if editing
      cashAmount: debt?.cashAmount || 0, // Store as number initially
      digitalAmount: debt?.digitalAmount || 0, // Store as number initially
      details: debt?.details || "",
      takerName: debt?.takerName || "",
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

  const onSubmit = async (values: z.infer<typeof refinedDebtSchema>) => {
    // Set default values to zero if empty
    const cashAmt = parseFloat((values.cashAmount?.toString() || "0")) || 0;
    const digitalAmt = parseFloat((values.digitalAmount?.toString() || "0")) || 0;
    const totalAmount = cashAmt + digitalAmt;
  
    // if (cashAmt <= 0 || digitalAmt <= 0) {
    //   toast.error("Both cash and digital amounts must be greater than zero");
    //   return;
    // }
  
    if (totalAmount <= 0) {
      toast.error("Total debt amount must be greater than zero");
      return;
    }
  
    setLoading(true);
    try {
      if (debt) {
        // PATCH request for editing
        await axios.patch(`${API}/admin/debt/${debt.id}`, {
          ...values,
          cashAmount: cashAmt,
          digitalAmount: digitalAmt,
        });
        toast.success("Successfully Updated Debt");
      } else {
        // POST request for creating new debt
        await axios.post(`${API}/admin/debt`, {
          ...values,
          cashAmount: cashAmt,
          digitalAmount: digitalAmt,
        });
        toast.success("Successfully Created Debt");
      }
  
      queryClient.invalidateQueries({ queryKey: ["debt"] });
      router.push("/dashboard/admin/debt"); // Navigate to debt dashboard or listing
    } catch (error) {
      console.error("Error handling debt request", error);
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
            {debt ? "Edit Debt" : "Add Debt"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account ID */}
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account ID</FormLabel>
                      <FormControl>
                        <AccountIdSelect
                          control={form.control}
                          setValue={form.setValue}
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.accountId?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>

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
                          onKeyDown={(e) => handleEnterPress(e, takerNameRef)}
                          onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.digitalAmount?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              {/* Taker Name */}
              <FormField
                control={form.control}
                name="takerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taker Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter taker's name"
                        {...field}
                        ref={takerNameRef}
                        onKeyDown={(e) => handleEnterPress(e, detailsRef)}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.takerName?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* Debt Details */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Debt Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter details about the debt"
                        {...field}
                        ref={detailsRef}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.details?.message}</FormMessage>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <SubmitButtonWithContent loading={loading} isEdit={!!debt} />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default AddDebtForm;

// Submit Button Component
export const SubmitButtonWithContent = React.forwardRef<HTMLButtonElement, { loading: boolean, isEdit: boolean }>(
  ({ loading, isEdit }, ref) => {
    if (loading) {
      return (
        <Button className="space-x-2 gap-x-1 bg-gray-400" disabled ref={ref}>
          {isEdit ? "Updating Debt" : "Submitting Debt"}
          <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
        </Button>
      );
    }

    return (
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" ref={ref}>
        {isEdit ? "Update Debt" : "Submit Debt"}
      </Button>
    );
  }
);

SubmitButtonWithContent.displayName = "SubmitButtonWithContent";
