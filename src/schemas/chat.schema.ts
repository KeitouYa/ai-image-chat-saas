import { z } from "zod";

export const ChatSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(500, "Message is too long (max 500 characters)"),

    provider: z.enum(["gemini", "openai"]).default("gemini"),

    // Optional: For future multi-turn chat support
    history: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string().trim(),
        })
      )
      .optional(),
  })
  .strict(); // IMPORTANT: Reject unknown fields

export type ChatInput = z.infer<typeof ChatSchema>;
