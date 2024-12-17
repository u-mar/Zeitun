"use client";
import { z } from "zod";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { accountSwapSchema } from "@/app/validationSchema/accountSwapSchema";
import { AccountSwap } from "@prisma/client";
import AccountSelect from "./AccountIdSelect";

// Enhanced schema with validation for unique accounts and totals
const enhancedSchema = accountSwapSchema.extend({
  fromCashAmount: z.number().min(0),
  fromDigitalAmount: z.number().min(0),
  toCashAmount: z.number().min(0),
  toDigitalAmount: z.number().min(0),
  fromAccountId: z.string(),
  toAccountId: z.string(),
}).refine(data => data.fromCashAmount + data.fromDigitalAmount === data.fromAmount, {
  message: "Cash + Digital must equal Total",
  path: ["fromAmount"],
}).refine(data => data.toCashAmount + data.toDigitalAmount === data.toAmount, {
  message: "Cash + Digital must equal Total",
  path: ["toAmount"],
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: "From and To accounts must be different",
  path: ["toAccountId"],
});

const AddSwapForm = ({ swap }: { swap?: AccountSwap }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { control, setValue, getValues } = useForm();

  const form = useForm<z.infer<typeof enhancedSchema>>({
    resolver: zodResolver(enhancedSchema),
    defaultValues: {
      fromAccountId: swap?.fromAccountId || "",
      toAccountId: swap?.toAccountId || "",
      fromCashAmount: swap?.fromCashAmount || 0,
      fromDigitalAmount: swap?.fromDigitalAmount || 0,
      toCashAmount: swap?.toCashAmount || 0,
      toDigitalAmount: swap?.toDigitalAmount || 0,
      exchangeRate: swap?.exchangeRate || undefined,
      details: swap?.details || "",
    },
  });


  useEffect(() => {
    // Automatically calculate and set fromAmount based on fromCashAmount and fromDigitalAmount
    const fromCashAmount = form.getValues("fromCashAmount") || 0;
    const fromDigitalAmount = form.getValues("fromDigitalAmount") || 0;
    const newFromAmount = fromCashAmount + fromDigitalAmount;
    if (form.getValues("fromAmount") !== newFromAmount) {
      form.setValue("fromAmount", newFromAmount);
    }

    // Automatically calculate and set toAmount based on toCashAmount and toDigitalAmount
    const toCashAmount = form.getValues("toCashAmount") || 0;
    const toDigitalAmount = form.getValues("toDigitalAmount") || 0;
    const newToAmount = toCashAmount + toDigitalAmount;
    if (form.getValues("toAmount") !== newToAmount) {
      form.setValue("toAmount", newToAmount);
    }
  }, [
    form.watch("fromCashAmount"),
    form.watch("fromDigitalAmount"),
    form.watch("toCashAmount"),
    form.watch("toDigitalAmount"),
  ]);

  // Prevent scroll on number inputs
  const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    event.currentTarget.blur();
  };

  const onSubmit = async (values: z.infer<typeof enhancedSchema>) => {
    setLoading(true);
    try {
      const response = swap
        ? await axios.patch(`${API}/superAdmin/swap/${swap.id}`, values)
        : await axios.post(`${API}/superAdmin/swap`, values);

      queryClient.invalidateQueries({ queryKey: ["swap"] });
      toast.success(`Successfully ${swap ? "Updated" : "Created"} Swap`);
      router.push("/dashboard/superAdmin/swap");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto my-10 p-6 shadow-lg rounded-lg bg-white">
        <CardHeader className="mb-4">
          <CardTitle className="text-3xl font-semibold text-gray-700">Add Swap</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account ID Selects */}
                <FormField
                  control={form.control}
                  name="fromAccountId"
                  render={() => (
                    <AccountSelect
                      control={form.control}
                      setValue={form.setValue}
                      getValues={form.getValues}
                      accountType="fromAccountId"
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="toAccountId"
                  render={() => (
                    <AccountSelect
                      control={form.control}
                      setValue={form.setValue}
                      getValues={form.getValues}
                      accountType="toAccountId"
                    />
                  )}
                />

              </div>

              {/* From Amounts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">

                <FormField
                  control={form.control}
                  name="fromCashAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Cash Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any" // Allows decimal numbers
                          {...field}
                          onWheel={handleWheel}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fromDigitalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Digital Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any" // Allows decimal numbers
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



              {/* To Amounts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">

                <FormField
                  control={form.control}
                  name="toCashAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Cash Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any" // Allows decimal numbersv
                          {...field}
                          onWheel={handleWheel}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toDigitalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Digital Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any" // Allows decimal numbers
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
              {/* Rate Row (Optional) */}
              <div className="border-b pb-4">
                <FormField
                  control={form.control}
                  name="exchangeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter exchange rate"
                          type="number"
                          step="any" // Allows decimal numbers
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


              {/* Details Row (Optional) */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter swap details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* // Summary Section */}

              <div className="border-t pt-4 mt-6 text-gray-700">
                <h3 className="text-lg font-semibold mb-2">Summary</h3>

                {/* From Summary */}
                <div className="mb-4">
                  <h4 className="text-md font-semibold">From</h4>
                  <p>
                    Cash:{" "}
                    <span className="font-semibold">
                      {form.watch("fromCashAmount").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                  <p>
                    Digital:{" "}
                    <span className="font-semibold">
                      {form.watch("fromDigitalAmount").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                  <p>
                    Total:{" "}
                    <span className="font-semibold">
                      {(form.watch("fromCashAmount") + form.watch("fromDigitalAmount")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>

                {/* To Summary */}
                <div>
                  <h4 className="text-md font-semibold">To</h4>
                  <p>
                    Cash:{" "}
                    <span className="font-semibold">
                      {form.watch("toCashAmount").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                  <p>
                    Digital:{" "}
                    <span className="font-semibold">
                      {form.watch("toDigitalAmount").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                  <p>
                    Total:{" "}
                    <span className="font-semibold">
                      {(form.watch("toCashAmount") + form.watch("toDigitalAmount")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <SubmitButtonWithContent loading={form.formState.isSubmitting || loading} />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default AddSwapForm;

// Submit Button Component
export const SubmitButtonWithContent = React.forwardRef<HTMLButtonElement, { loading: boolean }>(
  ({ loading }, ref) => {
    if (loading) {
      return (
        <Button className="space-x-2 gap-x-1 bg-gray-400" disabled ref={ref}>
          Submitting Swap
          <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
        </Button>
      );
    }
    return (
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" ref={ref}>
        Submit Swap
      </Button>
    );
  }
);
SubmitButtonWithContent.displayName = "SubmitButtonWithContent";



