# 🧠 AI Image + Chat SaaS Complete Development Guide

> A production-ready, enterprise-level AI SaaS application with AI chat and image generation capabilities. This guide will walk you through building a complete, fully-featured AI SaaS platform from scratch.

## 📖 Table of Contents

- [Project Introduction](#-project-introduction)
- [Technology Stack](#️-technology-stack-details)
- [Features](#-features)
- [Building from Scratch](#-building-from-scratch)
  - [Step 1: Environment Setup](#step-1-environment-setup)
  - [Step 2: Create Next.js Project](#step-2-create-nextjs-project)
  - [Step 3: Install Dependencies](#step-3-install-dependencies)
  - [Step 4: Configure Third-Party Services](#step-4-configure-third-party-services)
  - [Step 5: Project Structure Setup](#step-5-project-structure-setup)
  - [Step 6: Core Functionality Implementation](#step-6-core-functionality-implementation)
- [Running the Project](#-running-the-project)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [FAQ](#-faq)
- [Advanced Features](#-advanced-features)

---

## 🎯 Project Introduction

### What is This Project?

This is a **full-stack AI SaaS application** where users can:

1. **Chat with AI**: Have conversations using Google Gemini or OpenAI
2. **Generate AI Images**: Create high-quality AI images from text prompts
3. **Credit System**: Pay-per-use credit-based system
4. **User Management**: Complete user authentication, authorization, and role management
5. **Admin Panel**: Statistics and user management features

### Project Features

- ✅ **Production-Ready**: Includes enterprise-level features like error handling, logging, monitoring
- ✅ **Clear Architecture**: Layered architecture design, easy to maintain and extend
- ✅ **Performance Optimized**: Redis caching, connection pooling, timeout handling
- ✅ **Secure & Reliable**: Authentication, authorization, rate limiting, input validation, atomic operations
- ✅ **Observable**: Request tracing, structured logging, cost tracking

### Use Cases

- Learn Next.js 15 App Router and full-stack development
- Learn TypeScript and modern web development best practices
- Learn AI integration and SaaS application development
- Use as a starting point for commercial projects

---

## 🛠️ Technology Stack Details

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.4 | React framework with SSR, API Routes, App Router |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling framework |
| **shadcn/ui** | - | UI component library |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | - | Backend API endpoints |
| **MongoDB + Mongoose** | 8.19.1 | Database and ODM |
| **Upstash Redis** | 1.35.7 | Caching and rate limiting |

### Third-Party Services

| Service | Purpose |
|---------|---------|
| **Clerk** | User authentication and authorization |
| **Google Gemini API** | AI chat (primary) |
| **OpenAI API** | AI chat (fallback) |
| **Replicate** | AI image generation (Flux model) |
| **Cloudinary** | Image storage and CDN |
| **PayPal** | Payment integration |

### Development Tools

- **Jest** - Unit testing
- **ESLint** - Code linting
- **TypeScript** - Type checking

---

## ✨ Features

### Core Features

1. **AI Chat**
   - Supports Gemini and OpenAI dual providers
   - Automatic fallback mechanism (switches if one fails)
   - Prompt caching (24 hours, saves credits)
   - 30-second timeout protection

2. **AI Image Generation**
   - Uses Flux Schnell model
   - 16:9 aspect ratio PNG format
   - Automatic upload to Cloudinary
   - 2-minute timeout protection

3. **Credit System**
   - New users get 10 free credits
   - Atomic credit deduction (prevents concurrency issues)
   - Credits cannot go negative
   - PayPal credit purchase

4. **User System**
   - Clerk authentication (supports multiple login methods)
   - Role-based access control (RBAC)
   - Three roles: USER, SUBSCRIBER, ADMIN

5. **Rate Limiting**
   - 20 requests per minute per user
   - Redis-based implementation

6. **Caching Optimization**
   - Redis caching for common prompts
   - Caching user credit information
   - Reduces database queries and AI API calls

7. **Request Tracing**
   - Unique ID assigned to each request
   - Log tracing across all layers
   - Easy debugging and monitoring

8. **Admin Features**
   - Platform statistics
   - User list and management
   - Cost tracking

---

## 🚀 Building from Scratch

> This section provides detailed instructions on how to build this project from scratch. Even if you have no prior experience, you can complete it by following these steps.

### Step 1: Environment Setup

#### 1.1 Install Node.js

Ensure your system has Node.js 20 or higher installed.

**Check version:**
```bash
node --version  # Should be >= 20.0.0
npm --version   # Should be >= 10.0.0
```

**If not installed:**
- Windows/Mac: Download from [nodejs.org](https://nodejs.org/)
- Linux: Install using package manager

#### 1.2 Install Code Editor

Recommended: **VS Code** with the following extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

#### 1.3 Prepare Git (Optional)

```bash
git --version
```

If not installed, install from [git-scm.com](https://git-scm.com/).

---

### Step 2: Create Next.js Project

#### 2.1 Create Project Using Next.js CLI

```bash
npx create-next-app@latest ai_img_chat
```

**Configuration options:**
```
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like to use `src/` directory? ... Yes
√ Would you like to use App Router? ... Yes
√ Would you like to customize the default import alias (@/*)? ... Yes (default is fine)
```

#### 2.2 Navigate to Project Directory

```bash
cd ai_img_chat
```

#### 2.3 Verify Project Creation

```bash
npm run dev
```

Open browser and visit `http://localhost:3000`, you should see the Next.js welcome page.

---

### Step 3: Install Dependencies

#### 3.1 Install Core Dependencies

```bash
# Authentication
npm install @clerk/nextjs

# AI Providers
npm install @google/generative-ai openai

# Database
npm install mongoose

# Caching and Rate Limiting
npm install @upstash/redis @upstash/ratelimit

# Image Generation and Storage
npm install replicate cloudinary

# Payment
npm install @paypal/react-paypal-js

# Utility Libraries
npm install zod nanoid dayjs file-saver
npm install class-variance-authority clsx tailwind-merge
npm install next-themes react-hot-toast react-chat-elements
npm install lucide-react
```

#### 3.2 Install Development Dependencies

```bash
npm install -D jest @testing-library/jest-dom @testing-library/react
npm install -D @types/jest jest-environment-jsdom
npm install -D @types/node @types/react @types/react-dom
npm install -D @types/file-saver
```

#### 3.3 Verify Installation

Check the `package.json` file, it should contain all dependencies. Create or update scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit"
  }
}
```

---

### Step 4: Configure Third-Party Services

#### 4.1 Setup MongoDB Database

**Option A: MongoDB Atlas (Cloud Database, Recommended)**

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Register/Login
3. Create a free cluster (Free Tier)
4. Create a database user (remember username and password)
5. Configure IP whitelist (allow all IPs: `0.0.0.0/0`)
6. Get connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

**Option B: Local MongoDB**

```bash
# Install MongoDB (example: macOS)
brew install mongodb-community
brew services start mongodb-community
```

Connection string: `mongodb://localhost:27017/ai_img_chat`

#### 4.2 Setup Upstash Redis (Caching and Rate Limiting)

1. Visit [Upstash](https://upstash.com/)
2. Register/Login
3. Create Redis database (select free tier)
4. Get REST URL and REST Token

#### 4.3 Setup Clerk (Authentication)

1. Visit [Clerk](https://clerk.com/)
2. Register/Login
3. Create application
4. Find **API Keys** in Dashboard
5. Copy `Publishable Key` and `Secret Key`

#### 4.4 Setup Google Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login with Google account
3. Create API Key
4. Copy API Key

#### 4.5 Setup OpenAI API (Optional, Fallback)

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Register/Login
3. Add payment method (requires credit card)
4. Create new Key in API Keys page
5. Copy API Key

#### 4.6 Setup Replicate (Image Generation)

1. Visit [Replicate](https://replicate.com/)
2. Register/Login
3. Find API Token in Account Settings
4. Copy API Token

#### 4.7 Setup Cloudinary (Image Storage)

1. Visit [Cloudinary](https://cloudinary.com/)
2. Register free account
3. Find account details in Dashboard
4. Copy the following:
   - Cloud Name
   - API Key
   - API Secret

#### 4.8 Setup PayPal (Payment, Optional)

1. Visit [PayPal Developer](https://developer.paypal.com/)
2. Register/Login
3. Create application
4. Get Client ID and Secret

#### 4.9 Create Environment Variables File

Create `.env.local` file in project root:

```env
# ============================================
# Database Configuration
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
# Or local: MONGODB_URI=mongodb://localhost:27017/ai_img_chat

# ============================================
# Redis Configuration (Upstash)
# ============================================
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# ============================================
# Authentication Configuration (Clerk)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# ============================================
# AI Provider Configuration
# ============================================
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key  # Optional

# ============================================
# Image Generation Configuration (Replicate)
# ============================================
REPLICATE_API_TOKEN=r8_xxxxx

# ============================================
# Image Storage Configuration (Cloudinary)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ============================================
# Payment Configuration (PayPal, Optional)
# ============================================
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# ============================================
# Environment Configuration
# ============================================
NODE_ENV=development
```

**Important Notes:**
- Do not commit `.env.local` to Git
- Ensure `.gitignore` includes `.env.local`
- Production environment needs these variables set in deployment platform

---

### Step 5: Project Structure Setup

Create the following directory structure:

```
ai_img_chat/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── chat/
│   │   ├── credits/
│   │   └── admin/
│   ├── dashboard/            # Dashboard pages
│   ├── chat/                 # Chat page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
│
├── src/
│   ├── controllers/          # Controller layer
│   ├── services/             # Service layer (business logic)
│   ├── repositories/         # Data access layer
│   ├── providers/            # External service providers
│   │   └── ai/              # AI providers
│   ├── middlewares/          # Middleware
│   ├── lib/                  # Utility libraries
│   ├── models/               # Database models
│   ├── schemas/              # Zod validation schemas
│   └── types/                # TypeScript types
│
├── components/               # React components
│   ├── ui/                   # Base UI components
│   ├── nav/                  # Navigation components
│   └── cards/                # Card components
│
├── context/                  # React Context
├── public/                   # Static assets
└── docs/                     # Documentation
```

**Commands to create directories:**

```bash
# Execute in project root
mkdir -p src/controllers src/services src/repositories
mkdir -p src/providers/ai src/middlewares src/lib
mkdir -p src/models src/schemas src/types
mkdir -p components/ui components/nav components/cards
mkdir -p context docs
mkdir -p app/api/chat app/api/credits app/api/admin
mkdir -p app/dashboard app/chat
```

---

### Step 6: Core Functionality Implementation

> This section shows key code implementations. Complete code is in the project repository, only core parts are shown here.

#### 6.1 Configure TypeScript Path Aliases

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 6.2 Create Database Connection Provider

Create `src/providers/db.provider.ts`:

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI or DATABASE_URL in .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

#### 6.3 Create Database Models

**Create `src/models/credit.model.ts`:**

```typescript
import mongoose from "mongoose";

const CreditSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    credits: Number,
    amount: Number,
  },
  { timestamps: true }
);

const Credit = mongoose.models.Credit || mongoose.model("Credit", CreditSchema);

export default Credit;
```

**Create `src/models/image.model.ts`:**

```typescript
import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    userName: String,
    url: String,
    name: String,
  },
  { timestamps: true }
);

const Image = mongoose.models.Image || mongoose.model("Image", ImageSchema);

export default Image;
```

**Create `src/models/user.model.ts`:**

```typescript
import mongoose from "mongoose";

export enum UserRole {
  USER = "user",
  SUBSCRIBER = "subscriber",
  ADMIN = "admin",
}

const UserSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, unique: true, index: true },
    clerkUserId: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
export { UserRole };
```

#### 6.4 Create Logger Utility

Create `src/lib/logger.ts`:

```typescript
interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

export const logger = {
  info: (message: string, context?: LogContext | any) => {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId ? `[${context.requestId}]` : "";
    console.log(`🟢 [INFO] ${timestamp} ${requestId}`, message, context);
  },

  warn: (message: string, context?: LogContext | any) => {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId ? `[${context.requestId}]` : "";
    console.warn(`🟠 [WARN] ${timestamp} ${requestId}`, message, context);
  },

  error: (message: string, context?: LogContext | any) => {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId ? `[${context.requestId}]` : "";
    console.error(`🔴 [ERROR] ${timestamp} ${requestId}`, message, context);
  },

  debug: (message: string, context?: LogContext | any) => {
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      const requestId = context?.requestId ? `[${context.requestId}]` : "";
      console.log(`🔍 [DEBUG] ${timestamp} ${requestId}`, message, context);
    }
  },
};
```

#### 6.5 Create Error Handling Classes

Create `src/lib/errors.ts`:

```typescript
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InsufficientCreditsError extends AppError {
  remainingCredits?: number;

  constructor(message: string, remainingCredits?: number) {
    super(message, 402);
    this.remainingCredits = remainingCredits;
  }
}

export class ProviderError extends AppError {
  constructor(message: string) {
    super(message, 502);
  }
}
```

#### 6.6 Create HTTP Response Utility

Create `src/lib/http.ts`:

```typescript
export function success<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

export function fail(message: string, statusCode: number = 400) {
  return {
    success: false,
    error: message,
    statusCode,
  };
}
```

#### 6.7 Create Redis Cache Utility

Create `src/lib/cache.ts`:

```typescript
import { Redis } from "@upstash/redis";
import { logger } from "./logger";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  requestId?: string;
}

export const cache = {
  async get<T>(key: string, requestId?: string): Promise<T | null> {
    try {
      const value = await redis.get<T>(key);
      if (value) {
        logger.debug("Cache hit", { key, requestId });
      } else {
        logger.debug("Cache miss", { key, requestId });
      }
      return value;
    } catch (err) {
      logger.error("Cache get error", { err, key, requestId });
      return null;
    }
  },

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const { ttl = 3600, requestId } = options;
      await redis.setex(key, ttl, value);
      logger.debug("Cache set", { key, ttl, requestId });
      return true;
    } catch (err) {
      logger.error("Cache set error", { err, key, requestId: options.requestId });
      return false;
    }
  },

  async del(key: string, requestId?: string): Promise<boolean> {
    try {
      await redis.del(key);
      logger.debug("Cache deleted", { key, requestId });
      return true;
    } catch (err) {
      logger.error("Cache delete error", { err, key, requestId });
      return false;
    }
  },

  promptKey(prompt: string): string {
    const normalized = prompt.toLowerCase().trim().replace(/\s+/g, "_");
    return `prompt:${normalized}`;
  },

  creditsKey(userEmail: string): string {
    return `credits:${userEmail}`;
  },
};
```

#### 6.8 Create AI Provider Interface and Implementation

Create `src/providers/ai/ai.interface.ts`:

```typescript
export interface AIProvider {
  chat(message: string): Promise<string>;
}
```

Create `src/providers/ai/gemini.provider.ts`:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./ai.interface";

export class GeminiProvider implements AIProvider {
  private model: any;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async chat(message: string): Promise<string> {
    const result = await this.model.generateContent(message);
    const response = await result.response;
    return response.text();
  }
}
```

Create `src/providers/ai/openai.provider.ts`:

```typescript
import OpenAI from "openai";
import { AIProvider } from "./ai.interface";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async chat(message: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    return completion.choices[0]?.message?.content || "";
  }
}
```

Create `src/providers/ai/ai.factory.ts`:

```typescript
import { GeminiProvider } from "./gemini.provider";
import { OpenAIProvider } from "./openai.provider";
import { AIProvider } from "./ai.interface";

export async function getAIProvider(
  provider: "gemini" | "openai" = "gemini"
): Promise<AIProvider> {
  if (provider === "gemini") {
    return new GeminiProvider();
  } else {
    return new OpenAIProvider();
  }
}
```

#### 6.9 Create Credit Repository

Create `src/repositories/credits.repository.ts`:

```typescript
import Credit from "@/src/models/credit.model";
import { logger } from "@/src/lib/logger";

export const creditRepository = {
  async findUserCredit(userEmail: string) {
    const credit = await Credit.findOne({ userEmail }).lean();
    return credit ? JSON.parse(JSON.stringify(credit)) : null;
  },

  async addCredits(userEmail: string, amount: number, credits: number) {
    let record = await Credit.findOne({ userEmail });

    if (record) {
      record.amount += amount;
      record.credits += credits;
      await record.save();
      return record.toObject();
    }

    const newRecord = await Credit.create({
      userEmail,
      amount,
      credits,
    });

    return newRecord.toObject();
  },

  // Atomic operation: only deduct if credits are sufficient
  async deductCreditsAtomic(
    userEmail: string,
    creditAmount: number,
    requestId?: string
  ): Promise<{ success: boolean; remainingCredits: number | null }> {
    await this.ensureInitialCredits(userEmail);

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

  async ensureInitialCredits(userEmail: string) {
    const existing = await Credit.findOne({ userEmail });
    if (!existing) {
      return await Credit.create({
        userEmail,
        amount: 0,
        credits: 10, // New users get 10 free credits
      });
    }
    return existing;
  },
};
```

#### 6.10 Create Chat Service

Create `src/services/chat.service.ts`:

```typescript
"use server";

import { getAIProvider } from "@/src/providers/ai/ai.factory";
import { logger } from "@/src/lib/logger";
import db from "@/src/providers/db.provider";
import { creditRepository } from "@/src/repositories/credits.repository";
import { currentUser } from "@clerk/nextjs/server";
import { InsufficientCreditsError, ProviderError } from "@/src/lib/errors";
import { cache } from "@/src/lib/cache";

const CHAT_CREDIT_COST = 1;

async function getCachedReply(
  message: string,
  requestId?: string
): Promise<string | null> {
  const cacheKey = cache.promptKey(message);
  return await cache.get<string>(cacheKey, requestId);
}

async function cacheReply(
  message: string,
  reply: string,
  requestId?: string
): Promise<void> {
  const cacheKey = cache.promptKey(message);
  await cache.set(cacheKey, reply, { ttl: 86400, requestId }); // 24 hours
}

async function chatWithFallback(
  message: string,
  primaryProvider: "gemini" | "openai",
  requestId?: string
): Promise<string> {
  const providers: Array<"gemini" | "openai"> =
    primaryProvider === "gemini" ? ["gemini", "openai"] : ["openai", "gemini"];

  for (const provider of providers) {
    try {
      logger.debug(`Attempting provider: ${provider}`, { requestId });
      const ai = await getAIProvider(provider);
      const reply = await ai.chat(message);
      logger.info(`Success with provider: ${provider}`, { requestId });
      return reply;
    } catch (err) {
      logger.warn(`Provider ${provider} failed, trying fallback`, {
        err,
        requestId,
      });

      if (provider === providers[providers.length - 1]) {
        throw new ProviderError(
          `All AI providers failed. Last error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }

  throw new ProviderError("No providers available");
}

export async function sendChatMessage(
  message: string,
  provider: "gemini" | "openai" = "gemini",
  userId: string,
  requestId?: string
) {
  try {
    await db();

    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      throw new Error("User email not found");
    }

    // Step 1: Check cache
    const cachedReply = await getCachedReply(message, requestId);
    if (cachedReply) {
      logger.info("Cache hit - returning cached reply", {
        userId,
        requestId,
      });
      return {
        reply: cachedReply,
        remainingCredits: null,
        cached: true,
      };
    }

    // Step 2: Atomic credit deduction
    const deductionResult = await creditRepository.deductCreditsAtomic(
      userEmail,
      CHAT_CREDIT_COST,
      requestId
    );

    if (!deductionResult.success) {
      logger.warn("Insufficient credits for chat", {
        userId,
        userEmail,
        remainingCredits: deductionResult.remainingCredits,
        requestId,
      });
      throw new InsufficientCreditsError(
        "Insufficient credits to send chat message",
        deductionResult.remainingCredits ?? undefined
      );
    }

    logger.info(`🤖 Using provider: ${provider}`, { userId, requestId });

    // Step 3: Call AI (with fallback)
    const reply = await chatWithFallback(message, provider, requestId);

    // Step 4: Cache reply
    await cacheReply(message, reply, requestId);

    return {
      reply: reply?.trim() || "No response",
      remainingCredits: deductionResult.remainingCredits,
      cached: false,
    };
  } catch (err) {
    logger.error("CHAT SERVICE ERROR:", { err, requestId });
    throw err;
  }
}
```

#### 6.11 Create Chat Controller

Create `src/controllers/chat/chat.controller.ts`:

```typescript
import { sendChatMessage } from "@/src/services/chat.service";
import { success, fail } from "@/src/lib/http";
import { ValidationError, InsufficientCreditsError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";

export async function handleChatController(
  message: string,
  provider: "gemini" | "openai",
  userId: string,
  requestId?: string
) {
  try {
    // Validate input
    if (!message || message.trim().length === 0) {
      throw new ValidationError("Message cannot be empty");
    }

    if (message.length > 1000) {
      throw new ValidationError("Message too long (max 1000 characters)");
    }

    // Call service
    const result = await sendChatMessage(message, provider, userId, requestId);

    return success(result);
  } catch (err: any) {
    logger.error("Chat controller error", { err, requestId });

    if (err instanceof ValidationError) {
      return fail(err.message, 400);
    }

    if (err instanceof InsufficientCreditsError) {
      return fail(err.message, 402);
    }

    return fail("Internal server error", 500);
  }
}
```

#### 6.12 Create Chat API Route

Create `app/api/chat/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { handleChatController } from "@/src/controllers/chat/chat.controller";
import { logger } from "@/src/lib/logger";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || nanoid();

  try {
    const user = await currentUser();
    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, provider = "gemini" } = body;

    const result = await handleChatController(
      message,
      provider,
      user.id,
      requestId
    );

    return Response.json(result, {
      status: result.success ? 200 : (result as any).statusCode || 500,
    });
  } catch (err: any) {
    logger.error("Chat API error", { err, requestId });
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

#### 6.13 Create Middleware

Create `middleware.ts` (root directory):

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { logger } from "@/src/lib/logger";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/buy-credits(.*)",
]);

const isProtectedApiRoute = createRouteMatcher([
  "/api/chat(.*)",
  "/api/image(.*)",
  "/api/credits(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const start = Date.now();
  const { method } = req;
  const url = req.nextUrl.pathname;
  const requestId = req.headers.get("x-request-id") || nanoid();

  req.headers.set("x-request-id", requestId);

  logger.info(`➡️ [${method}] ${url}`, { requestId });

  if (isProtectedRoute(req) || isProtectedApiRoute(req)) {
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
```

#### 6.14 Configure Root Layout

Update `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/nav/top-nav";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/context/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Generate images with AI for free. Buy credits to generate more images.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TopNav />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Code Linting

```bash
npm run lint
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Push Code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Import Project in Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables (copy all variables from `.env.local`)
   - Click "Deploy"

3. **Configure Clerk**
   - Add Vercel deployment URL in Clerk Dashboard
   - Update allowed origins

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t ai-img-chat .
docker run -p 3000:3000 --env-file .env.local ai-img-chat
```

---

## 📁 Project Structure

```
ai_img_chat/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── chat/route.ts    # Chat API
│   │   ├── credits/         # Credits API
│   │   └── admin/           # Admin API
│   ├── dashboard/           # Dashboard pages
│   ├── chat/                # Chat page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
│
├── src/
│   ├── controllers/         # Controllers: handle requests/responses
│   ├── services/            # Services: business logic
│   ├── repositories/        # Repositories: data access
│   ├── providers/           # Providers: external services
│   │   └── ai/             # AI provider implementations
│   ├── middlewares/         # Middleware: rate limiting, RBAC, etc.
│   ├── lib/                 # Utility libraries
│   │   ├── logger.ts       # Logging utility
│   │   ├── cache.ts        # Redis cache
│   │   ├── errors.ts       # Error classes
│   │   └── http.ts         # HTTP response utilities
│   ├── models/              # Database models (Mongoose)
│   ├── schemas/             # Zod validation schemas
│   └── types/               # TypeScript type definitions
│
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── nav/                 # Navigation components
│   └── cards/               # Card components
│
├── context/                 # React Context
├── public/                  # Static assets
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── ARCHITECTURE.md     # Architecture documentation
│   └── DEPLOYMENT.md       # Deployment documentation
│
├── middleware.ts            # Next.js middleware
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

---

## ❓ FAQ

### Q1: MongoDB Connection Failed

**Issue:** Cannot connect to MongoDB

**Solutions:**
1. Check if `MONGODB_URI` environment variable is correct
2. Check if MongoDB Atlas IP whitelist includes your IP
3. Check network connection

### Q2: Clerk Authentication Failed

**Issue:** Still shows unauthenticated after login

**Solutions:**
1. Check if `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are correct
2. Check application URL configuration in Clerk Dashboard
3. Clear browser cache and cookies

### Q3: Redis Connection Failed

**Issue:** Caching and rate limiting not working

**Solutions:**
1. Check Upstash Redis URL and Token
2. Check network connection
3. Check console error logs

### Q4: AI API Call Failed

**Issue:** Gemini or OpenAI API returns error

**Solutions:**
1. Check if API Key is valid
2. Check if API quota is exhausted
3. Check error logs for specific error messages

### Q5: Image Generation Failed

**Issue:** Replicate or Cloudinary errors

**Solutions:**
1. Check if Replicate API Token is valid
2. Check if Cloudinary configuration is correct
3. Check network connection and firewall settings

---

## 🎓 Advanced Features

The project has implemented the following advanced features (see `docs/` directory for more):

1. **Role-Based Access Control (RBAC)**
2. **Request Tracing and Logging**
3. **Redis Caching Optimization**
4. **AI Provider Automatic Fallback**
5. **Atomic Credit Deduction (prevents concurrency issues)**
6. **Rate Limiting Protection**
7. **Cost Tracking**
8. **Feature Flags**
9. **Admin Panel**
10. **Unit Testing**

See `docs/ARCHITECTURE.md` for architecture design, see `docs/API.md` for API usage.

---

## 📚 Learning Resources

### Next.js
- [Next.js Official Documentation](https://nextjs.org/docs)
- [App Router Documentation](https://nextjs.org/docs/app)

### TypeScript
- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)

### MongoDB
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

### Third-Party Services
- [Clerk Documentation](https://clerk.com/docs)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Replicate Documentation](https://replicate.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## 📄 License

[Your License]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests.

## 📧 Support

For questions, please create an Issue or contact the project maintainer.

---

**Happy Building! 🎉**

