import { z } from "zod";

export const bankSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    userId: z.string().optional(),
});
