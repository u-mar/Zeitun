import { z } from "zod";

export const paymentSchema = z.object({
  debtId: z.string().nonempty("Debt ID is required"),
  cashAmount: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : parseFloat(value as string)),
    z.number().optional()
),
digitalAmount: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : parseFloat(value as string)),
    z.number().optional()
),
});
