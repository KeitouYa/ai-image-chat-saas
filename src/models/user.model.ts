import mongoose from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUBSCRIBER = "subscriber",
}

const UserSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, unique: true, index: true },
    clerkUserId: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;


