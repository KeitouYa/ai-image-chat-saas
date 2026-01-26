import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./ai.interface";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const client = new GoogleGenerativeAI(apiKey);

export class GeminiProvider implements AIProvider {
  private modelName = "gemini-2.5-flash";

  async chat(message: string): Promise<string> {
    const model = client.getGenerativeModel({ model: this.modelName });

    const chatSession = model.startChat({
      generationConfig: { temperature: 1, maxOutputTokens: 500 },
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "You are a helpful assistant for an AI image generator website. " +
                "Reply under 50 characters if asked about image features. " +
                "App is free to try; login needed to save images.",
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage(message);
    return result.response.text().trim();
  }
}
