// Mock dependencies BEFORE imports
jest.mock("mongoose");
jest.mock("@/src/repositories/credits.repository");
jest.mock("@/src/providers/ai/ai.factory");
jest.mock("@/src/providers/ai/openai.provider", () => ({
  OpenAIProvider: jest.fn().mockImplementation(() => ({
    chat: jest.fn(),
  })),
}));
jest.mock("@/src/providers/ai/gemini.provider", () => ({
  GeminiProvider: jest.fn().mockImplementation(() => ({
    chat: jest.fn(),
  })),
}));
jest.mock("@/src/lib/cache");
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(() => ({
    emailAddresses: [{ emailAddress: "test@example.com" }],
  })),
}));
jest.mock("@/src/providers/db.provider", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}));

// Now import after mocks
import { sendChatMessage } from "@/src/services/chat.service";
import { creditRepository } from "@/src/repositories/credits.repository";
import { getAIProvider } from "@/src/providers/ai/ai.factory";
import { cache } from "@/src/lib/cache";

describe("Chat Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables for each test
    delete process.env.DISABLE_CHAT_CREDITS;
    delete process.env.DISABLE_CHAT_CACHE;
    delete process.env.SIMULATE_GEMINI_FAILURE;
  });

  it("should return cached reply if available", async () => {
    const mockCachedReply = "Cached response";
    (cache.get as jest.Mock).mockResolvedValue(mockCachedReply);

    const result = await sendChatMessage(
      "test message",
      "gemini",
      "user123",
      "req123"
    );

    expect(result.reply).toBe(mockCachedReply);
    expect(result.cached).toBe(true);
    expect(creditRepository.deductCreditsAtomic).not.toHaveBeenCalled();
  });

  it("should call AI without deducting credits if not cached (credits disabled)", async () => {
    (cache.get as jest.Mock).mockResolvedValue(null);

    const mockAI = {
      chat: jest.fn().mockResolvedValue("AI response"),
    };
    (getAIProvider as jest.Mock).mockResolvedValue(mockAI);
    (cache.set as jest.Mock).mockResolvedValue(true);

    const result = await sendChatMessage(
      "test message",
      "gemini",
      "user123",
      "req123"
    );

    // Credits are disabled, so no deduction should happen
    expect(creditRepository.deductCreditsAtomic).not.toHaveBeenCalled();
    expect(mockAI.chat).toHaveBeenCalledWith("test message");
    expect(result.reply).toBe("AI response");
    expect(result.cached).toBe(false);
    expect(result.remainingCredits).toBe(null); // No credits deducted
  });

  it("should handle provider fallback correctly", async () => {
    (cache.get as jest.Mock).mockResolvedValue(null);

    // Mock Gemini to fail, OpenAI to succeed
    const mockGemini = {
      chat: jest.fn().mockRejectedValue(new Error("Gemini failed")),
    };
    const mockOpenAI = {
      chat: jest.fn().mockResolvedValue("Fallback response"),
    };

    (getAIProvider as jest.Mock)
      .mockResolvedValueOnce(mockGemini)
      .mockResolvedValueOnce(mockOpenAI);

    (cache.set as jest.Mock).mockResolvedValue(true);

    const result = await sendChatMessage(
      "test message",
      "gemini", // Request Gemini first
      "user123",
      "req123"
    );

    expect(result.reply).toBe("Fallback response");
    expect(result.cached).toBe(false);
  });
});


