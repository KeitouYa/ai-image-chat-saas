import OpenAI from "openai";
import { AIProvider } from "./ai.interface";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

const client = new OpenAI({ apiKey });

export class OpenAIProvider implements AIProvider {
  private modelName = "gpt-4o-mini";

  async chat(message: string): Promise<string> {
    const completion = await client.chat.completions.create({
      model: this.modelName,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant for an AI image generator website. " +
            "Reply under 50 characters for image feature questions.",
        },
        { role: "user", content: message },
      ],
    });

    return completion.choices[0].message.content ?? "No response";
  }
}
