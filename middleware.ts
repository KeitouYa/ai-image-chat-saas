import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { logger } from "@/src/lib/logger";

// UI routes requiring login
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/buy-credits(.*)",
]);

// API routes requiring login
const isProtectedApiRoute = createRouteMatcher([
  "/api/chat(.*)",
  "/api/image(.*)",
  "/api/credits(.*)",
  "/api/user(.*)",
  "/api/history(.*)",
]);

// Admin-only routes
const isAdminRoute = createRouteMatcher(["/api/admin(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const start = Date.now();
  const { method } = req;
  const url = req.nextUrl.pathname;
  const requestId = req.headers.get("x-request-id") || nanoid();

  // Add requestId to headers for downstream use
  req.headers.set("x-request-id", requestId);

  logger.info(`➡️ [${method}] ${url}`, { requestId });

  // Protect API + UI routes
  if (isProtectedRoute(req) || isProtectedApiRoute(req)) {
    await auth.protect();
  }

  // Admin routes require authentication (role check happens in route handler)
  if (isAdminRoute(req)) {
    await auth.protect();
  }

  const duration = Date.now() - start;

  logger.info(`⬅️ [${method}] ${url} - ${duration}ms`, { requestId });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
