import { logger } from "./logger";

/**
 * Timeout utility for async operations
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Operation timed out",
  requestId?: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } catch (err) {
    logger.error("Operation timeout", { errorMessage, timeoutMs, requestId, err });
    throw err;
  }
}

/**
 * Default timeouts for different operations
 */
export const TIMEOUTS = {
  AI_CHAT: 30000, // 30 seconds
  IMAGE_GENERATION: 120000, // 2 minutes
  DB_OPERATION: 5000, // 5 seconds
  EXTERNAL_API: 10000, // 10 seconds
} as const;


