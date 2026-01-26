import { requireAdmin } from "@/src/middlewares/rbac";
import { userRepository } from "@/src/repositories/user.repository";
import { logger } from "@/src/lib/logger";
import { success, fail } from "@/src/lib/http";
import db from "@/src/providers/db.provider";
import { nanoid } from "nanoid";

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") || nanoid();

  try {
    await db();
    await requireAdmin(requestId);

    // Get query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const result = await userRepository.findAll(page, limit);

    logger.info("Admin users list accessed", { requestId, page, limit, total: result.total });

    return Response.json(success(result), { status: 200 });
  } catch (err: any) {
    logger.error("Admin users list error", { err, requestId });

    if (err.status === 403) {
      return Response.json(fail("Forbidden: Admin access required", 403), {
        status: 403,
      });
    }

    return Response.json(fail("Internal server error", 500), { status: 500 });
  }
}

