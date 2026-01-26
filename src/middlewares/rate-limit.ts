import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// PRODUCTION DEFAULT: Free tier (20/day)
// Will override limit dynamically for subscribers
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(20, "1 d"),
  analytics: true,
});

// Utility function for checking rate limit
export async function checkRateLimit(userId: string, limit = 20) {
  return await rateLimiter.limit(`chat_${userId}`);
}
