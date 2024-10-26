import { z } from 'zod'

export const accountSchema = z.object({
    account: z.string().min(1, "account must be at least one character").max(255, "account should not be more than 255 characters"),
    balance: z.number().min(0, "balance must be a positive number"),
    cashBalance: z.number().min(0, "cashBalance must be a positive number"),
    default: z.boolean().optional(),
})