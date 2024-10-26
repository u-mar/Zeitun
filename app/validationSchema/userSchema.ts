import { z } from 'zod'

export const userSchema = z.object({
    name: z.string(),
    email: z.string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email.")
    .max(255, { message: "This field has to be filled." }),
    phoneNumber: z.string().min(7, "phoneNumber must be at least 7 character").max(255, "phoneNumber should not be more than 255 characters"),
    role: z.string().default('admin'),
});



