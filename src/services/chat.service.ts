"use server";

/**
 * ============================================================
 * Chat Service (Orchestration Layer)
 *
 * Responsibilities:
 * 1. Orchestrate DB, Auth, Cache, Credits, AI providers
 * 2. Handle provider fallback & timeout
 * 3. Collect structured metrics
 * 4. Enforce type safety at service boundaries
 *
 * Non-responsibilities:
 * - AI SDK implementation
 * - DB connection details
 * - Cache / Logger internals
 * ============================================================
 */

import crypto from "crypto";
import { getAIProvider } from "@/src/providers/ai/ai.factory";
import { logger } from "@/src/lib/logger";
import db from "@/src/providers/db.provider";
import { creditRepository } from "@/src/repositories/credits.repository";
import { currentUser } from "@clerk/nextjs/server";
import { InsufficientCreditsError, ProviderError } from "@/src/lib/errors";
import { cache } from "@/src/lib/cache";
import { withTimeout, TIMEOUTS } from "@/src/lib/timeout";

/* ============================================================
 * Types (explicit service-level contracts)
 * ============================================================
 */

/**
 * Result of a chat attempt with provider fallback.
 * Explicit return type is critical to avoid unstable inference
 * in try/catch + loop control flow.
 */
type ChatFallbackResult = {
  reply: string;
  providerUsed: "gemini" | "openai";
  fallbackUsed: boolean;
};

/* ============================================================
 * Feature flags (env-controlled behavior)
 *
 * These flags are intentionally read at module load time.
 * ============================================================
 */

const METRICS_ENABLED = process.env.METRICS_ENABLED === "true";
const SIMULATE_GEMINI_FAILURE = process.env.SIMULATE_GEMINI_FAILURE === "true";
const DISABLE_CHAT_CACHE = process.env.DISABLE_CHAT_CACHE === "true";
const DISABLE_CHAT_CREDITS = process.env.DISABLE_CHAT_CREDITS === "true";

/* ============================================================
 * Constants
 * ============================================================
 */

const CHAT_CREDIT_COST = 1;

/* ============================================================
 * Utility helpers
 * ============================================================
 */

/** Millisecond timestamp helper */
function nowMs() {
  return Date.now();
}

/**
 * Hash user prompt before logging.
 * We never log raw prompts to avoid leaking PII.
 */
function promptHash(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 12);
}

/* ============================================================
 * Cache helpers
 *
 * Cache key strategy intentionally ignores user identity.
 * This is acceptable only for stateless, public-style prompts.
 * ============================================================
 */

async function getCachedReply(message: string, requestId?: string) {
  const key = cache.promptKey(message);
  return cache.get<string>(key, requestId);
}

async function cacheReply(message: string, reply: string, requestId?: string) {
  const key = cache.promptKey(message);
  // Cache replies for 24 hours
  await cache.set(key, reply, { ttl: 86400, requestId });
}

/* ============================================================
 * AI provider fallback logic
 *
 * Design principles:
 * - Providers are tried in priority order
 * - Each provider call is timeout-protected
 * - Failure triggers fallback, not silent swallow
 * ============================================================
 */

async function chatWithFallback(
  message: string,
  primary: "gemini" | "openai",
  requestId?: string
): Promise<ChatFallbackResult> {
  /**
   * IMPORTANT:
   * Explicitly type providers array to avoid it being inferred
   * as string[] (which breaks type safety downstream).
   */
  const providers: Array<"gemini" | "openai"> =
    primary === "gemini" ? ["gemini", "openai"] : ["openai", "gemini"];

  for (const provider of providers) {
    try {
      logger.debug(`Attempting AI provider: ${provider}`, { requestId });

      // Fault injection: simulate Gemini outage for testing
      if (SIMULATE_GEMINI_FAILURE && provider === "gemini") {
        throw new Error("Simulated Gemini failure");
      }

      /**
       * Boundary adaptation:
       * We trust that chat.service only passes supported providers.
       * Type assertion is localized here to avoid polluting the system.
       */
      const ai = await getAIProvider(
        provider as Parameters<typeof getAIProvider>[0]
      );

      const reply = await withTimeout(
        ai.chat(message),
        TIMEOUTS.AI_CHAT,
        `AI provider ${provider} timeout`,
        requestId
      );

      return {
        reply,
        providerUsed: provider,
        fallbackUsed: provider !== primary,
      };
    } catch (err) {
      logger.warn(`Provider ${provider} failed`, { err, requestId });

      // Last provider failed → surface a hard error
      if (provider === providers[providers.length - 1]) {
        throw new ProviderError(
          `All AI providers failed: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }
  }

  // Should be unreachable, but kept for exhaustiveness
  throw new ProviderError("No AI providers available");
}

/* ============================================================
 * Public API: sendChatMessage
 *
 * This is the only exported function in this module.
 * ============================================================
 */

export async function sendChatMessage(
  message: string,
  provider: "gemini" | "openai" = "gemini",
  userId: string,
  requestId?: string
) {
  const t0 = nowMs();

  // --- Metrics bookkeeping ---
  let status: "success" | "fail" = "success";
  let errorName: string | null = null;

  let dbMs = 0;
  let cacheReadMs = 0;
  let creditMs = 0;
  let aiMs = 0;
  let cacheWriteMs = 0;

  let cached = false;
  let providerUsed: "gemini" | "openai" | null = null;
  let fallbackUsed = false;
  let remainingCredits: number | null = null;

  // Prompt metadata (safe to log)
  const messageLength = message.length;
  const messageHash = promptHash(message);

  try {
    /* ---------- DB ---------- */
    const tDb = nowMs();
    await db();
    dbMs = nowMs() - tDb;

    /* ---------- Auth ---------- */
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    if (!userEmail) throw new Error("User email not found");

    /* ---------- Cache read ---------- */
    const tCacheR = nowMs();
    const cachedReply = DISABLE_CHAT_CACHE
      ? null
      : await getCachedReply(message, requestId);
    cacheReadMs = nowMs() - tCacheR;

    if (cachedReply) {
      cached = true;
      providerUsed = null;

      return {
        reply: cachedReply,
        remainingCredits: null,
        cached: true,
      };
    }

    /* ---------- Credits ---------- */
    const tCredit = nowMs();
    if (!DISABLE_CHAT_CREDITS) {
      const result = await creditRepository.deductCreditsAtomic(
        userEmail,
        CHAT_CREDIT_COST,
        requestId
      );

      if (!result.success) {
        throw new InsufficientCreditsError(
          "Insufficient credits",
          result.remainingCredits ?? undefined
        );
      }

      remainingCredits = result.remainingCredits;
    }
    
    creditMs = nowMs() - tCredit;

    /* ---------- AI call ---------- */
    const tAi = nowMs();
    const aiResult = await chatWithFallback(message, provider, requestId);
    aiMs = nowMs() - tAi;

    providerUsed = aiResult.providerUsed;
    fallbackUsed = aiResult.fallbackUsed;

    /* ---------- Cache write ---------- */
    const tCacheW = nowMs();
    if (!DISABLE_CHAT_CACHE) {
      await cacheReply(message, aiResult.reply, requestId);
    }
    cacheWriteMs = nowMs() - tCacheW;

    return {
      reply: aiResult.reply.trim() || "No response",
      remainingCredits,
      cached: false,
    };
  } catch (err) {
    status = "fail";
    errorName = err instanceof Error ? err.name : "UnknownError";
    logger.error("CHAT SERVICE ERROR", { err, requestId });
    throw err;
  } finally {
    if (METRICS_ENABLED) {
      logger.info("[metric] chat.request", {
        requestId,
        userId,
        status,
        errorName,
        providerRequested: provider,
        providerUsed,
        fallbackUsed,
        cached,
        messageLength,
        messageHash,
        totalMs: nowMs() - t0,
        dbMs,
        cacheReadMs,
        creditMs,
        aiMs,
        cacheWriteMs,
      });
    }
  }
}
