"use server";

import { GeminiProvider } from "./gemini.provider";
import { OpenAIProvider } from "./openai.provider";
import { AIProvider } from "./ai.interface";

export type ProviderName = "gemini" | "openai";

/**
 * Next.js 15 server modules CANNOT export classes.
 * Only async functions can be exported.
 */
export async function getAIProvider(
  provider: ProviderName
): Promise<AIProvider> {
  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    case "gemini":
    default:
      return new GeminiProvider();
  }
}
