import { Redis } from "@upstash/redis";
import { logger } from "./logger";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  requestId?: string;
}

/**
 * Redis Cache Utility
 * Caches frequently accessed data to reduce DB load
 */
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string, requestId?: string): Promise<T | null> {
    try {
      const value = await redis.get<T>(key);
      if (value) {
        logger.debug("Cache hit", { key, requestId });
      } else {
        logger.debug("Cache miss", { key, requestId });
      }
      return value;
    } catch (err) {
      logger.error("Cache get error", { err, key, requestId });
      return null; // Fail gracefully
    }
  },

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const { ttl = 3600, requestId } = options; // Default 1 hour
      await redis.setex(key, ttl, value);
      logger.debug("Cache set", { key, ttl, requestId });
      return true;
    } catch (err) {
      logger.error("Cache set error", { err, key, requestId: options.requestId });
      return false; // Fail gracefully
    }
  },

  /**
   * Delete value from cache
   */
  async del(key: string, requestId?: string): Promise<boolean> {
    try {
      await redis.del(key);
      logger.debug("Cache deleted", { key, requestId });
      return true;
    } catch (err) {
      logger.error("Cache delete error", { err, key, requestId });
      return false;
    }
  },

  /**
   * Generate cache key for prompts
   */
  promptKey(prompt: string): string {
    // Normalize prompt for cache key
    const normalized = prompt.toLowerCase().trim().replace(/\s+/g, "_");
    return `prompt:${normalized}`;
  },

  /**
   * Generate cache key for user credits
   */
  creditsKey(userEmail: string): string {
    return `credits:${userEmail}`;
  },
};


