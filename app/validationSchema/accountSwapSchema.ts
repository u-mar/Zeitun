// accountSwapSchema.ts

import { z } from "zod";

export const accountSwapSchema = z.object({
  fromAccountId: z.string().nonempty("From Account ID is required"),
  toAccountId: z.string().nonempty("To Account ID is required"),
  fromAmount: z.number().positive("From Amount must be positive"),
  fromCashAmount: z.number().nonnegative().optional(),
  fromDigitalAmount: z.number().nonnegative().optional(),
  toAmount: z.number().positive("To Amount must be positive"),
  toCashAmount: z.number().nonnegative().optional(),
  toDigitalAmount: z.number().nonnegative().optional(),
  exchangeRate: z.number().optional(),
  details: z.string().optional(),
});
