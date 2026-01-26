import { z } from "zod";

export const ImageGenerateSchema = z.object({
  prompt: z.string().min(3).max(300),
});
export type ImageGenerateInput = z.infer<typeof ImageGenerateSchema>;
