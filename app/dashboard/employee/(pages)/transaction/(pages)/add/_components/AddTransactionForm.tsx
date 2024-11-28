"use client";
import { z } from "zod";
import React, { useEffect, useRef, useState } from "react";
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
import CategoryIdSelect from "./CategoryIdSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Transaction } from "@prisma/client";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { transactionSchema } from "@/app/validationSchema/transactionSchema";

const AddTransactionForm = ({ transaction }: { transaction?: Transaction }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isExchange, setIsExchange] = useState(false);

  // Function to adjust UTC time to East Africa Time (EAT)
  const adjustToEastAfricaTime = (date: Date) => {
    const offset = 3 * 60 * 60 * 1000; // East Africa Time is UTC + 3
    const eastAfricaDate = new Date(date.getTime() + offset);
    return eastAfricaDate.toISOString().slice(0, 19); // Remove the 'Z' at the end to avoid UTC
  };
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

  const transactionAmountRef = useRef<HTMLInputElement | null>(null);
  const transactionDetailsRef = useRef<HTMLTextAreaElement | null>(null);
  const senderNameRef = useRef<HTMLInputElement | null>(null);
  const senderPhoneRef = useRef<HTMLInputElement | null>(null);
  const receiverNameRef = useRef<HTMLInputElement | null>(null);
  const receiverPhoneRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: transaction?.accountId || "",
      categoryId: transaction?.categoryId || "",
      amount: transaction?.amount || 0,
      acc:
        transaction?.acc === "Cr" || transaction?.acc === "Dr"
          ? (transaction.acc as "Cr" | "Dr")
          : undefined, // Use type assertion to avoid TS error
      details: transaction?.details || "",
      type: transaction?.type || undefined, // Optional for exchanges
      ref: transaction?.ref || "", // Generated automatically
      tranDate: transaction?.tranDate
        ? new Date(transaction.tranDate).toISOString().slice(0, 16) // Format to match datetime-local input
        : adjustToEastAfricaTime(new Date()), // Default to current date with time adjusted to East Africa Time
      isExchange: transaction?.isExchange || false, // Default for isExchange
      exchangeType: transaction?.exchangeType || undefined,
      senderName: transaction?.senderName || undefined,
      senderPhone: transaction?.senderPhone || undefined,
      receiverName: transaction?.receiverName || undefined,
      receiverPhone: transaction?.receiverPhone || undefined
    },
  });

  // Watch categoryId to determine if it's exchange or withdrawal
  const watchCategory = form.watch("categoryId");
  const watchExchangeType = form.watch("exchangeType");

  // Generate the reference number
  const generateRef = (transactionType: string) => {
    const currentDate = new Date();
    const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeStr = adjustToEastAfricaTime(currentDate).split("T")[1]; // Adjusted time in HH:MM:SS
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit random number
    return `${transactionType}-${dateStr}-${timeStr}-${randomDigits}`;
  };

  // Automatically set the reference whenever the transaction type (credit or debt) changes
  useEffect(() => {
    const accValue = form.watch("acc"); // Watch for changes in the transaction type (acc)
    const generatedRef = generateRef(
      accValue === "Cr" ? "deposit" : "withdraw"
    );
    form.setValue("ref", generatedRef);
  }, [form.watch("acc")]);

  // Watch for category changes and call the API to check if it's an exchange category
  useEffect(() => {
    const checkCategoryType = async () => {
      if (watchCategory) {
        try {
          const response = await axios.get(
            `${API}/employee/transaction/category/${watchCategory}`
          );
          const category = response.data;

          // Set isExchange to true if category is 'withdrawal' or 'exchange'
          if (category.name === "withdrawal" || category.name === "exchange") {
            setIsExchange(true);
            form.setValue("isExchange", true); // Automatically set isExchange to true
            form.setValue("acc", undefined); // Clear acc for exchange transactions
            form.setValue("type", undefined); // Clear type for exchange transactions
          } else {
            setIsExchange(false);
            form.setValue("isExchange", false); // Reset isExchange to false
          }
        } catch (error) {
          console.error("Error fetching category details", error);
        }
      }
    };

    checkCategoryType();
  }, [watchCategory]);

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    // Convert tranDate to a full ISO format before sending to Prisma
    const formattedDate = values.tranDate
      ? new Date(values.tranDate).toISOString()
      : new Date().toISOString();
    setLoading(true);
    try {
      const response = transaction
        ? await axios.patch(`${API}/employee/transaction/${transaction.id}`, {
          ...values,
          tranDate: formattedDate, // Ensure date is correctly formatted
        })
        : await axios.post(`${API}/employee/transaction`, {
          ...values,
          tranDate: formattedDate, // Ensure date is correctly formatted
        });
      queryClient.invalidateQueries({ queryKey: ["transaction"] });
      toast.success(
        `Successfully ${transaction ? "Updated" : "Created"} Transaction`
      );

      router.push("/dashboard/employee/transaction");
    } catch (error) {
      console.error("Error creating transaction", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto my-10 p-4 shadow-lg rounded-lg">
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl font-bold">Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account ID */}
                <FormField
                  control={form.control}
                  name="accountId"
                  render={() => <AccountIdSelect control={form.control} />}
                />

                {/* Category ID */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={() => <CategoryIdSelect control={form.control} />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any" // Allows decimal numbers
                          placeholder="Enter transaction amount"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          onKeyDown={(e) => {
                            if (isExchange) {
                              if (watchExchangeType === "withdrawal") {
                                handleEnterPress(e, senderNameRef); // Focus on Sender Name
                              } else {
                                handleEnterPress(e, receiverNameRef); // Focus on Receiver Name
                              }
                            } else {
                              handleEnterPress(e, transactionDetailsRef); // Focus on Transaction Details
                            }
                          }}
                          onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* acc (credit or debt), not shown if exchange */}
                {!isExchange && (
                  <FormField
                    control={form.control}
                    name="acc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex space-x-4"
                          >
                            {/* Credit Option */}
                            <div className="flex items-center space-x-2 text-green-900">
                              <RadioGroupItem value="Cr" id="Cr" />
                              <label htmlFor="Cr">IN</label>
                            </div>

                            {/* Debt Option */}
                            <div className="flex items-center space-x-2 text-red-900">
                              <RadioGroupItem value="Dr" id="Dr" />
                              <label htmlFor="Dr">OUT</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Exchange-related fields (conditionally shown) */}
              {isExchange && (
                <>
                  {/* Select whether it's withdrawal or deposit */}
                  <FormField
                    control={form.control}
                    name="exchangeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Exchange Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex space-x-4"
                          >
                            {/* Withdrawal Option */}
                            <div className="flex items-center space-x-2 text-green-900">
                              <RadioGroupItem
                                value="withdrawal"
                                id="withdrawal"
                              />
                              <label htmlFor="withdrawal">Withdrawal</label>
                            </div>

                            {/* Deposit Option */}
                            <div className="flex items-center space-x-2 text-red-900">
                              <RadioGroupItem value="deposit" id="deposit" />
                              <label htmlFor="deposit">Deposit</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Conditionally show sender or receiver info based on exchange type */}
                  {watchExchangeType === "withdrawal" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="senderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Name</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter sender's name"
                                {...field}
                                ref={senderNameRef}
                                onKeyDown={(e) => handleEnterPress(e, senderPhoneRef)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="senderPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sender Phone</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Enter sender's phone number"
                                {...field}
                                ref={senderPhoneRef}
                                onKeyDown={(e) => handleEnterPress(e, transactionDetailsRef)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="receiverName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receiver Name</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter receiver's name"
                                {...field}
                                ref={receiverNameRef}
                                onKeyDown={(e) => handleEnterPress(e, receiverPhoneRef)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receiverPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receiver Phone</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Enter receiver's phone number"
                                {...field}
                                ref={receiverPhoneRef}
                                onKeyDown={(e) => handleEnterPress(e, transactionDetailsRef)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Transaction Type (cash or digital) */}
              {!isExchange && (
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Method</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="digital">Digital</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Transaction Date */}
              <FormField
                control={form.control}
                name="tranDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local" // Use datetime-local for both date and time
                        placeholder="Enter transaction date"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transaction Details */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter transaction details"
                        {...field}
                        ref={transactionDetailsRef}
                        onKeyDown={(e) => handleEnterPress(e, submitButtonRef)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transaction Reference (Auto-generated and not editable) */}
              <FormField
                control={form.control}
                name="ref"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Reference</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        readOnly
                        {...field}
                        value={form.watch("ref")} // Show the auto-generated reference
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <SubmitButtonWithContent
                loading={form.formState.isSubmitting || loading}
                ref={submitButtonRef}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default AddTransactionForm;

// Submit Button Component
export const SubmitButtonWithContent = React.forwardRef<HTMLButtonElement, { loading: boolean }>(
  ({ loading }, ref) => {
    if (loading) {
      return (
        <Button className="space-x-2 gap-x-1 bg-gray-400" disabled ref={ref}>
          Submitting Transaction
          <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
        </Button>
      );
    }

    return (
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" ref={ref}>
        Submit Transaction
      </Button>
    );
  }
);

SubmitButtonWithContent.displayName = "SubmitButtonWithContent";
