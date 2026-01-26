import { currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@/src/models/user.model";
import { userRepository } from "@/src/repositories/user.repository";
import db from "@/src/providers/db.provider";
import { logger } from "@/src/lib/logger";
import { AppError } from "@/src/lib/errors";

/**
 * Check if user has required role
 * @param requiredRole - Minimum role required
 * @param requestId - Optional request ID for tracing
 * @throws AppError if user doesn't have required role
 */
export async function requireRole(
  requiredRole: UserRole,
  requestId?: string
): Promise<void> {
  await db();

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!userEmail) {
    logger.warn("Unauthorized: No user email", { requestId });
    throw new AppError("Unauthorized", 401);
  }

  // Ensure user exists in DB
  const dbUser = await userRepository.findByEmail(userEmail);
  if (!dbUser) {
    // Auto-create user with default role
    await userRepository.upsertUser(
      userEmail,
      user.id,
      UserRole.USER
    );
  }

  const userRole = dbUser?.role || UserRole.USER;

  // Role hierarchy: ADMIN > SUBSCRIBER > USER
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.USER]: 1,
    [UserRole.SUBSCRIBER]: 2,
    [UserRole.ADMIN]: 3,
  };

  const userLevel = roleHierarchy[userRole as UserRole];
  const requiredLevel = roleHierarchy[requiredRole as UserRole];

  if (userLevel < requiredLevel) {
    logger.warn("Insufficient permissions", {
      userEmail,
      userRole,
      requiredRole,
      requestId,
    });
    throw new AppError("Insufficient permissions", 403);
  }

  logger.debug("Role check passed", {
    userEmail,
    userRole,
    requiredRole,
    requestId,
  });
}

/**
 * Check if user is admin
 */
export async function requireAdmin(requestId?: string): Promise<void> {
  return requireRole(UserRole.ADMIN, requestId);
}

/**
 * Check if user is subscriber or higher
 */
export async function requireSubscriber(requestId?: string): Promise<void> {
  return requireRole(UserRole.SUBSCRIBER, requestId);
}

/**
 * Get user role without throwing
 */
export async function getUserRole(
  requestId?: string
): Promise<UserRole | null> {
  try {
    await db();

    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return null;
    }

    const dbUser = await userRepository.findByEmail(userEmail);
    return (dbUser?.role as UserRole) || UserRole.USER;
  } catch (err) {
    logger.error("Failed to get user role", { err, requestId });
    return null;
  }
}


