import User, { UserRole } from "@/src/models/user.model";
import { logger } from "@/src/lib/logger";

export const userRepository = {
  // ------------------------------------------------
  // Find user by email
  // ------------------------------------------------
  async findByEmail(userEmail: string) {
    const user = await User.findOne({ userEmail }).lean();
    return user ? JSON.parse(JSON.stringify(user)) : null;
  },

  // ------------------------------------------------
  // Find all users (with pagination)
  // ------------------------------------------------
  async findAll(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(),
    ]);

    return {
      users: users.map((u) => JSON.parse(JSON.stringify(u))),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ------------------------------------------------
  // Find user by Clerk userId
  // ------------------------------------------------
  async findByClerkId(clerkUserId: string) {
    const user = await User.findOne({ clerkUserId }).lean();
    return user ? JSON.parse(JSON.stringify(user)) : null;
  },

  // ------------------------------------------------
  // Create or update user (upsert)
  // ------------------------------------------------
  async upsertUser(
    userEmail: string,
    clerkUserId: string,
    role: UserRole = UserRole.USER
  ) {
    const user = await User.findOneAndUpdate(
      { userEmail },
      {
        userEmail,
        clerkUserId,
        role,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).lean();

    return JSON.parse(JSON.stringify(user));
  },

  // ------------------------------------------------
  // Update user role
  // ------------------------------------------------
  async updateRole(userEmail: string, role: UserRole, requestId?: string) {
    const user = await User.findOneAndUpdate(
      { userEmail },
      { role },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      logger.warn("User not found for role update", { userEmail, role, requestId });
      return null;
    }

    logger.info("User role updated", { userEmail, role, requestId });
    return JSON.parse(JSON.stringify(user));
  },

  // ------------------------------------------------
  // Check if user has role
  // ------------------------------------------------
  async hasRole(userEmail: string, role: UserRole): Promise<boolean> {
    const user = await User.findOne({ userEmail }).lean();
    return ((user as any)?.role as UserRole) === role;
  },
};

