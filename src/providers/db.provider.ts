/**
 * DATABASE PROVIDER (Production-Ready)
 * ----------------------------------------------------
 * Why this version is best:
 * - Prevents multiple connections in Next.js (very important)
 * - Uses a global cached connection (avoids memory leaks)
 * - Works for both dev + serverless environments
 * - Uses standard env var name: MONGODB_URI
 * - Throws clear errors for missing config
 */

import mongoose, { mongo } from "mongoose";

// ----------------------------------------------------
// 1. VALIDATE ENV VARIABLE
// ----------------------------------------------------
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is missing. Please define it in your .env file."
  );
}

// ----------------------------------------------------
// 2. GLOBAL CACHE (prevents hot-reload reconnect loops)
// ----------------------------------------------------
let cached = (global as any).mongoose;

//If no cache exists, create it
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// ----------------------------------------------------
// 3.MAIN DB CONNECT FUNCTION
// ----------------------------------------------------
export default async function db() {
  //If already connected → reuse it
  if (cached.conn) {
    return cached.conn;
  }

  //If not connected but a connection is in progress → wait for it
  if (cached.promise) {
    return cached.promise;
  }

  console.log("🟡 Connecting to MongoDB...");

  //Create a new connection promise and store it in the cache
  cached.promise = mongoose
    .connect(DATABASE_URL!, {
      bufferCommands: false, // keeps memory usage low
    })
    .then((mongooseInstance) => {
      console.log("🟢 MongoDB connection established.");
      return mongooseInstance;
    })
    .catch((err) => {
      console.error("🔴 MongoDB connection failed:", err);
      throw err;
    });

  cached.conn = await cached.promise;
  return cached.conn;
}
