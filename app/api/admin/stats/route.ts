import { requireAdmin } from "@/src/middlewares/rbac";
import { logger } from "@/src/lib/logger";
import { success, fail } from "@/src/lib/http";
import db from "@/src/providers/db.provider";
import { nanoid } from "nanoid";
import Credit from "@/src/models/credit.model";
import User from "@/src/models/user.model";
import Image from "@/src/models/image.model";
import { getPlatformTotalCost } from "@/src/services/cost-tracking.service";

/**
 * GET /api/admin/stats
 * Get platform statistics (admin only)
 */
export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") || nanoid();
  const totalCost = await getPlatformTotalCost();

  try {
    await db();
    await requireAdmin(requestId);

    // Aggregate stats
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

    const stats = {
      users: {
        total: totalUsers,
      },
      credits: {
        totalInCirculation:
          totalCredits[0]?.total || 0,
        totalPurchased: totalCreditsPurchased[0]?.total || 0,
      },
      images: {
        total: totalImages,
      },
      costs: {
        totalPlatformCost: totalCost,
      }
    };

    logger.info("Admin stats accessed", { requestId, stats });

    return Response.json(success(stats), { status: 200 });
  } catch (err: any) {
    logger.error("Admin stats error", { err, requestId });

    if (err.status === 403) {
      return Response.json(fail("Forbidden: Admin access required", 403), {
        status: 403,
      });
    }

    return Response.json(fail("Internal server error", 500), { status: 500 });
  }
}


