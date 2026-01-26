import { logger } from "@/src/lib/logger";
import db from "@/src/providers/db.provider";
import mongoose from "mongoose";

/**
 * Cost Tracking Model
 * Tracks actual costs of AI operations for billing/analytics
 */
const CostTrackingSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    operation: {
      type: String,
      enum: ["chat", "image"],
      required: true,
    },
    provider: { type: String, required: true },
    model: { type: String },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    cost: { type: Number, required: true }, // Cost in USD
    creditsCharged: { type: Number, required: true },
    requestId: { type: String, index: true },
  },
  { timestamps: true }
);

const CostTracking =
  mongoose.models.CostTracking ||
  mongoose.model("CostTracking", CostTrackingSchema);

/**
 * Estimated costs per operation (in USD)
 * These should be updated based on actual provider pricing
 */
const ESTIMATED_COSTS = {
  chat: {
    gemini: {
      "gemini-2.5-flash": 0.000075, // Per 1K tokens (estimated)
      default: 0.0001,
    },
    openai: {
      "gpt-4o-mini": 0.00015, // Per 1K tokens
      default: 0.0002,
    },
  },
  image: {
    replicate: {
      "flux-schnell": 0.003, // Per image
      default: 0.005,
    },
  },
};

/**
 * Track cost of an AI operation
 */
export async function trackCost(
  userEmail: string,
  operation: "chat" | "image",
  provider: string,
  creditsCharged: number,
  requestId?: string,
  metadata?: {
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
  }
): Promise<void> {
  try {
    await db();

    // Estimate cost based on operation type
    let estimatedCost = 0;
    const model = metadata?.model || "default";

    if (operation === "chat") {
      const providerCosts =
        ESTIMATED_COSTS.chat[provider as keyof typeof ESTIMATED_COSTS.chat];
      if (providerCosts) {
        estimatedCost =
          providerCosts[model as keyof typeof providerCosts] ||
          providerCosts.default ||
          0.0001;
        // Rough estimate: assume average 100 tokens per chat
        estimatedCost *= 0.1; // 100 tokens / 1000
      }
    } else if (operation === "image") {
      const providerCosts =
        ESTIMATED_COSTS.image[provider as keyof typeof ESTIMATED_COSTS.image];
      if (providerCosts) {
        estimatedCost =
          providerCosts[model as keyof typeof providerCosts] ||
          providerCosts.default ||
          0.005;
      }
    }

    await CostTracking.create({
      userEmail,
      operation,
      provider,
      model: metadata?.model,
      inputTokens: metadata?.inputTokens,
      outputTokens: metadata?.outputTokens,
      cost: estimatedCost,
      creditsCharged,
      requestId,
    });

    logger.debug("Cost tracked", {
      userEmail,
      operation,
      provider,
      cost: estimatedCost,
      creditsCharged,
      requestId,
    });
  } catch (err) {
    logger.error("Failed to track cost", { err, requestId });
    // Don't throw - cost tracking shouldn't break the main flow
  }
}

/**
 * Get total costs for a user
 */
export async function getUserTotalCost(
  userEmail: string
): Promise<number> {
  try {
    await db();
    const result = await CostTracking.aggregate([
      { $match: { userEmail } },
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);

    return result[0]?.total || 0;
  } catch (err) {
    logger.error("Failed to get user total cost", { err, userEmail });
    return 0;
  }
}

/**
 * Get platform total costs
 */
export async function getPlatformTotalCost(): Promise<number> {
  try {
    await db();
    const result = await CostTracking.aggregate([
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);

    return result[0]?.total || 0;
  } catch (err) {
    logger.error("Failed to get platform total cost", { err });
    return 0;
  }
}


