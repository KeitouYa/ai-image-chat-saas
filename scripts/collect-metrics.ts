/**
 * Metrics Collection Script
 * Collects all available metrics from the application
 */

import db from "@/src/providers/db.provider";
import { getPlatformTotalCost, getUserTotalCost } from "@/src/services/cost-tracking.service";
import { analytics } from "@/src/lib/analytics";
import mongoose from "mongoose";
import Credit from "@/src/models/credit.model";
import User from "@/src/models/user.model";
import Image from "@/src/models/image.model";
import CostTracking from "@/src/models/cost-tracking.model";

// Define CostTracking model if not already defined
if (!mongoose.models.CostTracking) {
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
      cost: { type: Number, required: true },
      creditsCharged: { type: Number, required: true },
      requestId: { type: String, index: true },
    },
    { timestamps: true }
  );
  mongoose.model("CostTracking", CostTrackingSchema);
}

interface MetricsReport {
  timestamp: string;
  testCoverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  platformStats: {
    users: {
      total: number;
    };
    credits: {
      totalInCirculation: number;
      totalPurchased: number;
    };
    images: {
      total: number;
    };
    costs: {
      totalPlatformCost: number;
    };
  };
  costBreakdown?: {
    byOperation: {
      chat: number;
      image: number;
    };
    byProvider: {
      gemini: number;
      openai: number;
      replicate: number;
    };
    totalOperations: number;
  };
  analytics?: {
    totalEvents: number;
    recentEvents: any[];
  };
}

async function collectMetrics(): Promise<MetricsReport> {
  try {
    await db();

    // Platform Stats
    const [totalUsers, totalCredits, totalImages, totalCreditsPurchased] =
      await Promise.all([
        User.countDocuments(),
        Credit.aggregate([
          { $group: { _id: null, total: { $sum: "$credits" } } },
        ]),
        Image.countDocuments(),
        Credit.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const totalPlatformCost = await getPlatformTotalCost();

    // Cost Breakdown
    const costBreakdown = await mongoose.models.CostTracking?.aggregate([
      {
        $group: {
          _id: null,
          chatCost: {
            $sum: { $cond: [{ $eq: ["$operation", "chat"] }, "$cost", 0] },
          },
          imageCost: {
            $sum: { $cond: [{ $eq: ["$operation", "image"] }, "$cost", 0] },
          },
          geminiCost: {
            $sum: { $cond: [{ $eq: ["$provider", "gemini"] }, "$cost", 0] },
          },
          openaiCost: {
            $sum: { $cond: [{ $eq: ["$provider", "openai"] }, "$cost", 0] },
          },
          replicateCost: {
            $sum: { $cond: [{ $eq: ["$provider", "replicate"] }, "$cost", 0] },
          },
          totalOps: { $sum: 1 },
        },
      },
    ]);

    const breakdown = costBreakdown?.[0] || {
      chatCost: 0,
      imageCost: 0,
      geminiCost: 0,
      openaiCost: 0,
      replicateCost: 0,
      totalOps: 0,
    };

    // Analytics Events
    const analyticsEvents = analytics.getEvents(100);

    const report: MetricsReport = {
      timestamp: new Date().toISOString(),
      platformStats: {
        users: {
          total: totalUsers,
        },
        credits: {
          totalInCirculation: totalCredits[0]?.total || 0,
          totalPurchased: totalCreditsPurchased[0]?.total || 0,
        },
        images: {
          total: totalImages,
        },
        costs: {
          totalPlatformCost,
        },
      },
      costBreakdown: {
        byOperation: {
          chat: breakdown.chatCost || 0,
          image: breakdown.imageCost || 0,
        },
        byProvider: {
          gemini: breakdown.geminiCost || 0,
          openai: breakdown.openaiCost || 0,
          replicate: breakdown.replicateCost || 0,
        },
        totalOperations: breakdown.totalOps || 0,
      },
      analytics: {
        totalEvents: analyticsEvents.length,
        recentEvents: analyticsEvents.slice(-10),
      },
    };

    return report;
  } catch (error) {
    console.error("Error collecting metrics:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
}

// Run if called directly
if (require.main === module) {
  collectMetrics()
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to collect metrics:", error);
      process.exit(1);
    });
}

export { collectMetrics };

