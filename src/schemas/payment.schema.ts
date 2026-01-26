import { z } from "zod";

export const AddCreditsSchema = z.object({
  amount: z.number().min(1),
  credits: z.number().min(1),
});
export type AddCreditsInput = z.infer<typeof AddCreditsSchema>;
