"use server";

import db from "@/src/providers/db.provider";
import { currentUser } from "@clerk/nextjs/server";
import { creditRepository } from "@/src/repositories/credits.repository";

/**
 * Add purchased credits to user's account
 */
export const saveCreditToDb = async (amount: number, credits: number) => {
  console.log("NEXT_RUNTIME =", process.env.NEXT_RUNTIME);
  try {
    await db();
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!userEmail) throw new Error("User email not found");

    const updated = await creditRepository.addCredits(
      userEmail,
      amount,
      credits
    );

    // MUST sanitize for Next.js client components
    return updated ? JSON.parse(JSON.stringify(updated)) : null;
  } catch (err) {
    console.error("🔴 SAVE CREDIT ERROR:", err);
    throw new Error("Failed to save credits");
  }
};

/**
 * Get user's current credits
 */
export const getUserCreditsFromDb = async () => {
  try {
    await db();
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    // 如果用户未登录或没有邮箱，返回默认积分（0）
    if (!userEmail) {
      console.log("User not authenticated or no email found, returning 0 credits");
      return { credits: 0 };
    }

    const credit = await creditRepository.findUserCredit(userEmail);

    // MUST sanitize
    return credit ? JSON.parse(JSON.stringify(credit)) : { credits: 0 };
  } catch (err) {
    console.error("🔴 GET CREDITS ERROR:", err);
    // 返回默认值而不是抛出错误
    return { credits: 0 };
  }
};

/**
 * Ensure user gets initial free credits (first login)
 */
export const checkCreditRecordDb = async () => {
  try {
    await db();
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!userEmail) throw new Error("User email not found");

    // No need to return a value — avoid serialization issues
    await creditRepository.ensureInitialCredits(userEmail);

    return null; //prevent accidental return of Mongoose objects
  } catch (err) {
    console.error("🔴 CHECK INITIAL CREDIT ERROR:", err);
    throw new Error("Failed to initialize credits");
  }
};
