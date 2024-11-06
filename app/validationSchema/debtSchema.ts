import { z } from 'zod'

export const debtSchema = z.object({
    takerName: z.string()
        .min(1, "Name must be at least one character")
        .max(255, "Name should not be more than 255 characters"),
    accountId: z.string()
        .min(1, "Account ID must be at least one character")
        .max(255, "Account ID should not be more than 255 characters"),
    cashAmount: z.preprocess(
        (value) => (typeof value === "string" && value.trim() === "" ? undefined : parseFloat(value as string)),
        z.number().optional()
    ),
    digitalAmount: z.preprocess(
        (value) => (typeof value === "string" && value.trim() === "" ? undefined : parseFloat(value as string)),
        z.number().optional()
    ),
    details: z.string().optional(),
});
