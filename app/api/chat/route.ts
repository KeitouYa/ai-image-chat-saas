import { auth } from "@clerk/nextjs/server";
import { handleChatController } from "@/src/controllers/chat/chat.controller";
import { checkRateLimit } from "@/src/middlewares/rate-limit";
import { logger } from "@/src/lib/logger";
import { nanoid } from "nanoid";

// Export the POST function (handles POST requests)
// Next.js automatically recognizes GET, POST, etc. functions
// inside route.ts files
export async function POST(req: Request) {
  //Get or generate a request ID (used for log tracing)
  const requestId = req.headers.get("x-request-id") || nanoid();

  try {
    logger.info("➡️ POST /api/chat", { requestId });

    // 1️⃣ Auth
    const { userId } = await auth();

    //If the user is not logged in, return 410 Unauthorized
    if (!userId) {
      logger.warn("Unauthorized chat attempt", { requestId });
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2️⃣ Rate limit (keep if you already use it)
    await checkRateLimit(userId);

    // 3️⃣ Parse client payload ONLY
    const body = await req.json();

    // ✅ Pass context separately
    const response = await handleChatController(body, { userId, requestId });

    return Response.json(response, {
      status: response.success ? 200 : 400,
    });
  } catch (err) {
    //Catch all errors
    logger.error("❌ API /chat error", { err, requestId });

    //Return a generic error response
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
