"use server";

import { ChatSchema } from "@/src/schemas/chat.schema";
import { sendChatMessage } from "@/src/services/chat.service";
import { success, fail } from "@/src/lib/http";
import { ValidationError, InsufficientCreditsError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";

type ChatContext = {
  userId: string;
  requestId: string;
};

export async function handleChatController(
  input: unknown,
  context: ChatContext
) {
  const { userId, requestId } = context;

  try {
    logger.info("📩 Incoming chat request", { requestId, userId });

    // ✅ STRICT schema now works
    const parsed = ChatSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0].message);
    }

    const { message, provider } = parsed.data;

    const result = await sendChatMessage(message, provider, userId, requestId);

    return success({
      reply: result.reply,
      remainingCredits: result.remainingCredits,
      cached: result.cached ?? false,
    });
  } catch (err: any) {
    logger.error("❌ Chat controller error", { err, requestId });

    if (
      err instanceof ValidationError ||
      err instanceof InsufficientCreditsError
    ) {
      return fail(err.message);
    }

    return fail("Failed to process chat request");
  }
}
