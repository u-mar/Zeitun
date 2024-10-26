import { z } from "zod";

export const transactionSchema = z.object({
  accountId: z.string().min(1, { message: "Account is required" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  amount: z.number().positive({ message: "Amount must be positive" }),
  acc: z.enum(["Cr", "Dr"]).optional(), // Optional for exchanges
  type: z.enum(["cash", "digital"]).optional(), // Optional for exchanges
  details: z.string().optional(),
  ref: z.string(), // Reference will be auto-generated
  tranDate: z.string().optional(), // Will be handled below

  // exchange type
  isExchange: z.boolean().optional(), // Optional for exchanges
  exchangeType: z.enum(["withdrawal", "deposit"]).optional(), // To select if it's a withdrawal or deposit for exchange
  senderName: z.string().optional(), // Optional for exchanges withdrawal
  senderPhone: z.string().optional(), // Optional for exchanges withdrawal
  receiverName: z.string().optional(), // Optional for exchanges deposit
  receiverPhone: z.string().optional(), // Optional for exchanges deposit
});
