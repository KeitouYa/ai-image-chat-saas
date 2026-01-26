import Credit from "@/src/models/credit.model";
import { logger } from "@/src/lib/logger";

export const creditRepository = {
  // ------------------------------------------------
  // Fetch single user's credit record
  // ------------------------------------------------
  async findUserCredit(userEmail: string) {
    // findOne: find a single record
    // { userEmail }: query condition (match by email)
    // .lean(): return a plain JavaScript object (not a Mongoose document, better performance)
    const credit = await Credit.findOne({ userEmail }).lean();
    return credit ? JSON.parse(JSON.stringify(credit)) : null;
  },

  // ------------------------------------------------
  // Add credits (purchase)
  // Handles both create + update logic
  // ------------------------------------------------
  async addCredits(userEmail: string, amount: number, credits: number) {
    let record = await Credit.findOne({ userEmail });

    if (record) {
      record.amount += amount;
      record.credits += credits;
      await record.save(); //save into database
      return record.toObject(); //return a object data
    }

    // Create new record if none exists
    const newRecord = await Credit.create({
      userEmail,
      amount,
      credits,
    });

    return newRecord.toObject();
  },

  // ------------------------------------------------
  // Update credits (e.g., -1 credit for image generation)
  // Safe: if missing, auto-create a record
  // ------------------------------------------------
  async updateCredit(
    userEmail: string,
    amountDelta: number,
    creditDelta: number
  ) {
    const updated = await Credit.findOneAndUpdate(
      { userEmail },
      { $inc: { amount: amountDelta, credits: creditDelta } },
      { new: true, upsert: true } // ⭐ upsert ensures record always exists
    ).lean();

    return updated;
  },

  // ------------------------------------------------
  // ATOMIC: Deduct credits only if sufficient balance exists
  // Prevents race conditions by checking + deducting in single operation
  // Returns { success: boolean, remainingCredits: number | null }
  // ------------------------------------------------
  async deductCreditsAtomic(
    userEmail: string,
    creditAmount: number,
    requestId?: string
  ): Promise<{ success: boolean; remainingCredits: number | null }> {
    // Ensure record exists first
    await this.ensureInitialCredits(userEmail);

    // Atomic operation: only decrement if credits >= creditAmount
    const result = await Credit.findOneAndUpdate(
      {
        userEmail,
        credits: { $gte: creditAmount }, // Only match if sufficient credits
      },
      {
        $inc: { credits: -creditAmount },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!result) {
      // Insufficient credits or user not found
      const current = await Credit.findOne({ userEmail }).lean();
      const currentCredits = (current as any)?.credits ?? 0;
      logger.warn("Insufficient credits for deduction", {
        userEmail,
        requested: creditAmount,
        available: currentCredits,
        requestId,
      });
      return {
        success: false,
        remainingCredits: currentCredits ?? null,
      };
    }

    const resultCredits = (result as any)?.credits ?? 0;
    logger.info("Credits deducted successfully", {
      userEmail,
      deducted: creditAmount,
      remaining: resultCredits,
      requestId,
    });

    return {
      success: true,
      remainingCredits: resultCredits,
    };
  },

  // ------------------------------------------------
  // Ensure record exists (e.g., give 10 free credits)
  // ------------------------------------------------
  async ensureInitialCredits(userEmail: string) {
    const existing = await Credit.findOne({ userEmail });
    if (!existing) {
      return await Credit.create({
        userEmail,
        amount: 0,
        credits: 50,
      });
    }

    return existing;
  },
};
