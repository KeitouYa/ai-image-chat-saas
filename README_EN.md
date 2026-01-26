# 🤖 AI Image Generation + Chat SaaS Application

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-orange)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-cyan)](https://tailwindcss.com/)

A fully-featured AI image generation and chat SaaS application that integrates Google Gemini, OpenAI, and Replicate AI services. Supports user authentication, credit system, image generation, AI chat, and more.

## 📋 Project Overview

### 🎯 Core Features

- **AI Image Generation**: Generate high-quality images using Replicate's Flux Schnell model
- **AI Chat Conversations**: Support for Gemini and OpenAI dual AI providers with automatic fallback
- **User Authentication**: Clerk-based user registration and login system
- **Credit System**: Atomic credit deduction and purchase system
- **Image Management**: Cloudinary-based image storage and display
- **Admin Dashboard**: Complete admin functionality and statistics panel
- **Responsive Design**: Modern UI interface with light/dark theme switching

> 💡 **Important Note**: The current project configuration has chat functionality set to not deduct credits (`ENABLE_CHAT_CREDITS = false`). To enable it, modify the corresponding flag in `src/services/chat.service.ts`.

### 🚀 Technical Highlights

- **Modern Architecture**: Layered architecture design with clear separation of concerns
- **Performance Optimization**: Redis caching, request timeout control, connection pooling
- **Security & Reliability**: RBAC access control, atomic operations, rate limiting
- **Observability**: Complete logging, request tracing, error handling
- **Developer Friendly**: TypeScript type safety, Jest testing, CI/CD pipeline

## 🏗️ Technology Stack

### Frontend Technology Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5
- **UI Library**: Radix UI + Tailwind CSS 4
- **State Management**: React Context + Server Components
- **Theme**: next-themes
- **Payment**: PayPal React SDK

### Backend Technology Stack
- **Runtime**: Node.js (Next.js Server)
- **Database**: MongoDB 8 + Mongoose
- **Cache**: Redis (Upstash)
- **Authentication**: Clerk Authentication
- **AI Services**:
  - Google Gemini AI (default)
  - OpenAI GPT
  - Replicate (image generation)

### Infrastructure
- **Image Storage**: Cloudinary
- **Rate Limiting**: Upstash Rate Limit
- **Logging**: Structured logging system
- **Error Handling**: Custom error classes
- **Validation**: Zod Schema validation

## 🏛️ System Architecture

### Layered Architecture Design

```
┌─────────────┐
│   Client    │  ← Browser client
│  (Browser)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Next.js App Router          │
│  ┌───────────────────────────────┐  │
│  │      API Routes Layer         │  │  ← API Routes Layer
│  │  - Authentication (Clerk)    │  │
│  │  - Rate Limiting             │  │
│  │  - Request Tracing           │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │    Controllers Layer         │  │  ← Controllers Layer
│  │  - Input Validation (Zod)    │  │
│  │  - Error Handling           │  │
│  │  - Response Formatting      │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │     Services Layer           │  │  ← Services Layer
│  │  - Business Logic           │  │
│  │  - Credit Deduction         │  │
│  │  - Caching                  │  │
│  │  - Fallback Logic           │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │   Repositories Layer         │  │  ← Repositories Layer
│  │  - Data Access              │  │
│  │  - Atomic Operations        │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │     Providers Layer          │  │  ← Providers Layer
│  │  - AI Providers (Gemini/OpenAI)│  │
│  │  - Database (MongoDB)        │  │
│  │  - Cache (Redis)             │  │
│  │  - Image Storage (Cloudinary)│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Data Flow Design

#### Chat Request Flow
1. **Client** sends POST request to `/api/chat`
2. **Middleware** authenticates user and generates requestId
3. **API Route** extracts userId and requestId
4. **Controller** validates input with Zod schema
5. **Service** checks cache, deducts credits atomically, calls AI provider
6. **Repository** performs atomic credit deduction
7. **Provider** calls external AI API
8. **Service** caches response and returns result

#### Image Generation Flow
1. **Client** calls `generateImageAi()` server action
2. **Service** deducts credits atomically
3. **Service** calls Replicate API for image generation
4. **Service** uploads image to Cloudinary
5. **Repository** saves image metadata to MongoDB
6. **Service** returns image ID and remaining credits

## 🎨 Page Implementation Details

### 1. Home Page (`app/page.tsx`)

**Features**:
- Gradient animated title "AI Image Generator"
- Image generation input form
- Hero image carousel display

**UI Implementation**:
```tsx
// Gradient animation effect
<span className="text-8xl bg-gradient-to-l from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text animate-pulse">
  AI
</span>
```

### 2. Chat Page (`app/chat/page.tsx`)

**Features**:
- Real-time chat interface
- Support for Gemini/OpenAI switching
- Loading states and error handling
- Auto-scroll to bottom

**Technical Implementation**:
- Client component (`"use client"`)
- React state management for message history
- Auto-scroll (`scrollIntoView`)
- Keyboard shortcuts support

### 3. Dashboard Page (`app/dashboard/page.tsx`)

**Features**:
- User image collection display
- Pagination navigation
- Responsive grid layout
- Image detail navigation

**Technical Implementation**:
- Server component (Next.js 15)
- Async search params handling
- Dynamic pagination calculation
- Reusable image card components

### 4. Buy Credits Page (`app/buy-credits/page.tsx`)

**Features**:
- PayPal integrated payment
- Multiple credit packages
- Secure payment flow

### 5. Admin Dashboard

- **Stats Panel** (`app/api/admin/stats/route.ts`): System usage statistics
- **User Management** (`app/api/admin/users/route.ts`): User information management

## 🔧 Core Feature Implementation

### AI Chat System

#### Dual Provider Fallback Mechanism

```typescript
// Provider fallback logic in chat.service.ts
const providers: Array<"gemini" | "openai"> =
  primaryProvider === "gemini" ? ["gemini", "openai"] : ["openai", "gemini"];

for (const provider of providers) {
  try {
    const ai = await getAIProvider(provider);
    const reply = await withTimeout(
      ai.chat(message),
      TIMEOUTS.AI_CHAT,
      `AI provider ${provider} timeout`
    );
    return reply;
  } catch (err) {
    // Continue to next provider on failure
    continue;
  }
}
```

#### Intelligent Caching System

- **Prompt Caching**: 24-hour TTL, reduces duplicate API calls
- **Credit Caching**: User credit status caching for better query performance

### Credit System

#### Atomic Operations to Prevent Race Conditions

```typescript
// Atomic credit deduction in credits.repository.ts
const result = await CreditModel.findOneAndUpdate(
  {
    userEmail,
    credits: { $gte: amount }, // Condition check
  },
  {
    $inc: { credits: -amount }, // Atomic decrement
  },
  {
    new: true, // Return updated document
    upsert: false,
  }
);
```

### Image Generation System

#### Flux Schnell Model Integration

```typescript
// Image generation in image.service.ts
const output: any = await replicate.run("black-forest-labs/flux-schnell", {
  input: {
    prompt: imagePrompt,
    output_format: "png",
    output_quality: 80,
    aspect_ratio: "16:9",
  },
});
```

### Security & Permissions

#### RBAC Access Control

- **User Roles**: `USER`, `SUBSCRIBER`, `ADMIN`
- **Route Protection**: Middleware-level permission validation
- **API Access Control**: Role-based API endpoint restrictions

#### Rate Limiting

```typescript
// Rate limiting in rate-limit.ts
const { success } = await ratelimit.limit(userId);
if (!success) {
  throw new Error("Rate limit exceeded");
}
```

## 🗃️ Database Design

### Credit Model
```typescript
{
  userEmail: string (indexed)
  credits: number
  amount: number
  timestamps: { createdAt, updatedAt }
}
```

### User Model
```typescript
{
  userEmail: string (unique, indexed)
  clerkUserId: string (unique, indexed)
  role: "user" | "subscriber" | "admin"
  metadata: Map<string, any>
  timestamps: { createdAt, updatedAt }
}
```

### Image Model
```typescript
{
  userEmail: string (indexed)
  userName: string
  url: string
  name: string
  timestamps: { createdAt, updatedAt }
}
```

## 🔒 Security Features

### Input Validation
- **Zod Schema**: Strict type-safe validation
- **SQL Injection Protection**: Parameterized queries and input sanitization
- **XSS Protection**: React auto-escaping and Content Security Policy

### Authentication & Authorization
- **Clerk Integration**: Industry-standard authentication solution
- **Session Management**: Secure session handling
- **Token Validation**: Automatic JWT token validation

### Network Security
- **HTTPS Enforcement**: HTTPS in production
- **CORS Configuration**: Appropriate Cross-Origin Resource Sharing
- **CSP Headers**: Content Security Policy

## 📊 Performance Optimizations

### Caching Strategy

1. **Redis Caching**: Reduces database queries
2. **Prompt Caching**: Avoids duplicate AI calls
3. **Connection Pooling**: MongoDB connection reuse

### Timeout Control

- **AI Calls**: 30-second timeout
- **Image Generation**: 2-minute timeout
- **Database**: 5-second timeout
- **External APIs**: 10-second timeout

### Resource Optimization

- **Image Compression**: Cloudinary automatic optimization
- **Lazy Loading**: On-demand loading for images and components
- **Code Splitting**: Next.js automatic code splitting

## 🚀 Deployment Guide

### Environment Requirements

- Node.js 18+
- MongoDB 8+
- Redis (Upstash)
- Cloudinary account
- Clerk account
- PayPal developer account

### Environment Variables Configuration

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/ai_image_chat

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI Services
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
REPLICATE_API_TOKEN=your_replicate_token

# Storage Services
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloud_api_key
CLOUDINARY_API_SECRET=your_cloud_secret

# Cache Services
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

### Deployment Steps

1. **Clone the project**
   ```bash
   git clone <repository-url>
   cd ai_img_chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local file
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the service**
   ```bash
   npm start
   ```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Test coverage
npm run test:coverage

# Watch mode testing
npm run test:watch
```

### Test Coverage

- **Chat Service**: AI provider switching, caching mechanism
- **Credit System**: Atomic operations, balance validation
- **Image Service**: Generation process, upload validation
- **Middleware**: Authentication, rate limiting

## 📈 Monitoring & Analytics

### Logging System

- **Structured Logging**: Consistent log format
- **Request Tracing**: requestId throughout the request chain
- **Context Information**: Rich error and debug information

### Analytics Features

- **AI Usage Tracking**: Track AI operation usage
- **Credit Purchase Tracking**: Monitor purchase behavior
- **Cost Tracking**: Estimate AI operation costs

## 🔄 CI/CD Pipeline

### GitHub Actions Configuration

- **Automated Testing**: Run test suite on every push
- **Type Checking**: TypeScript type validation
- **Code Quality**: ESLint code quality checks
- **Build Verification**: Ensure production build success

## 📚 Project Structure

```
ai_img_chat/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin API
│   │   ├── chat/                 # Chat API
│   │   └── ...
│   ├── buy-credits/              # Buy Credits Page
│   ├── chat/                     # Chat Page
│   ├── dashboard/                # Dashboard Page
│   └── ...
├── components/                   # React Components
│   ├── cards/                    # Card Components
│   ├── display/                  # Display Components
│   ├── forms/                    # Form Components
│   ├── image/                    # Image Components
│   ├── nav/                      # Navigation Components
│   └── ui/                       # UI Base Components
├── context/                      # React Context
├── docs/                         # Project Documentation
├── src/                          # Source Code
│   ├── controllers/              # Controllers Layer
│   ├── lib/                      # Utility Library
│   ├── middlewares/              # Middleware
│   ├── models/                    # Data Models
│   ├── providers/                # Providers Layer
│   ├── repositories/             # Repositories Layer
│   ├── schemas/                  # Zod Validation Schemas
│   ├── services/                 # Services Layer
│   └── types/                    # TypeScript Types
├── public/                       # Static Assets
└── ...
```

## 📖 Detailed Project Structure Explanation

### 🗂️ Complete Project Structure Chart

```
ai_img_chat/
├── 📁 app/                          # Next.js App Router (Page Routing)
│   ├── 📁 api/                      # API Route Processing
│   │   ├── 📁 admin/                # Admin API
│   │   │   ├── 📁 stats/            # Statistics API
│   │   │   │   └── route.ts         # Statistics Route
│   │   │   └── 📁 users/            # User Management API
│   │   │       └── route.ts         # User Management Route
│   │   ├── 📁 chat/                 # Chat API
│   │   │   └── route.ts             # Chat Message Processing Route
│   │   └── 📄 loading.tsx           # API Loading State Component
│   ├── 📁 buy-credits/              # Credit Purchase Page
│   │   └── page.tsx                 # Credit Purchase Page Component
│   ├── 📁 chat/                     # AI Chat Page
│   │   └── page.tsx                 # Chat Interface Page Component
│   ├── 📁 dashboard/                # User Dashboard
│   │   ├── 📁 image/                # Image Detail Page
│   │   │   └── 📁 [_id]/            # Dynamic Route
│   │   │       └── page.tsx         # Single Image Detail Page
│   │   └── page.tsx                 # Dashboard Home Page
│   ├── 📁 image/                    # Image Related Pages (Backup)
│   │   └── 📁 [_id]/
│   │       └── page.tsx
│   ├── 📄 layout.tsx                # Root Layout Component
│   ├── 📄 loading.tsx               # Global Loading State
│   ├── 📄 page.tsx                  # Home Page Component
│   └── 📄 globals.css               # Global Styles
├── 📁 components/                   # React Component Library
│   ├── 📁 cards/                    # Card Components
│   │   └── image-card.tsx           # Image Card Component
│   ├── 📁 display/                  # Display Components
│   │   └── hero-image-slider.tsx    # Hero Image Carousel Component
│   ├── 📁 forms/                    # Form Components
│   │   └── generate-image-input.tsx # Image Generation Input Form
│   ├── 📁 image/                    # Image Related Components
│   │   └── image-edit-buttons.tsx   # Image Edit Button Component
│   ├── 📁 nav/                      # Navigation Components
│   │   ├── credits.tsx              # Credit Display Component
│   │   ├── mode-toggle.tsx          # Theme Toggle Component
│   │   ├── pagination.tsx           # Pagination Component
│   │   └── top-nav.tsx              # Top Navigation Bar
│   └── 📁 ui/                       # UI Base Components
│       ├── button.tsx               # Button Component
│       ├── card.tsx                 # Card Container Component
│       ├── input.tsx                # Input Field Component
│       └── loader.tsx               # Loader Component
├── 📁 context/                      # React Context State Management
│   ├── image.tsx                    # Image State Management
│   ├── paypal.tsx                   # PayPal Payment State
│   └── theme.tsx                    # Theme State Management
├── 📁 docs/                         # Project Documentation
│   ├── API.md                       # API Interface Documentation
│   ├── ARCHITECTURE.md              # System Architecture Documentation
│   ├── DEPLOYMENT.md                # Deployment Guide
│   ├── FEATURES.md                  # Feature Documentation
│   └── UPGRADE_SUMMARY.md           # Upgrade Summary
├── 📁 src/                          # Core Business Logic (Server-side)
│   ├── 📁 controllers/              # Controller Layer (Request Processing)
│   │   ├── 📁 chat/                 # Chat Controller
│   │   │   └── chat.controller.ts   # Chat Request Processing
│   │   ├── 📁 credits/              # Credit Controller
│   │   │   ├── add-credits.controller.ts  # Add Credits
│   │   │   └── get-credits.controller.ts  # Get Credits
│   │   └── 📁 image/                # Image Controller
│   │       └── generate.controller.ts     # Image Generation Controller
│   ├── 📁 lib/                      # Utility Library
│   │   ├── analytics.ts             # Analytics Tool
│   │   ├── cache.ts                 # Redis Cache Tool
│   │   ├── errors.ts                # Error Handling Classes
│   │   ├── feature-flags.ts         # Feature Flags
│   │   ├── http.ts                  # HTTP Tool Functions
│   │   ├── logger.ts                # Logging System
│   │   ├── timeout.ts               # Timeout Control Tool
│   │   └── utils.ts                 # General Utility Functions
│   ├── 📁 middlewares/              # Middleware
│   │   ├── rate-limit.ts            # Rate Limiting Middleware
│   │   ├── rbac.ts                  # Role-Based Access Control
│   │   └── validate.ts              # Request Validation Middleware
│   ├── 📁 models/                   # Data Models (Mongoose)
│   │   ├── credit.model.ts          # Credit Data Model
│   │   ├── image.model.ts           # Image Data Model
│   │   └── user.model.ts            # User Data Model
│   ├── 📁 providers/                # External Service Providers
│   │   ├── 📁 ai/                   # AI Service Providers
│   │   │   ├── ai.factory.ts        # AI Provider Factory
│   │   │   ├── ai.interface.ts      # AI Interface Definition
│   │   │   ├── gemini.provider.ts   # Gemini AI Provider
│   │   │   └── openai.provider.ts   # OpenAI Provider
│   │   └── db.provider.ts           # Database Connection Provider
│   ├── 📁 repositories/             # Data Access Layer
│   │   ├── credits.repository.ts    # Credit Data Access
│   │   ├── image.repository.ts      # Image Data Access
│   │   └── user.repository.ts       # User Data Access
│   ├── 📁 schemas/                  # Data Validation Schemas
│   │   ├── chat.schema.ts           # Chat Request Validation
│   │   ├── image.schema.ts          # Image Request Validation
│   │   └── payment.schema.ts        # Payment Request Validation
│   ├── 📁 services/                 # Business Logic Layer
│   │   ├── chat.service.ts          # Chat Business Logic ⭐
│   │   ├── cost-tracking.service.ts # Cost Tracking Service
│   │   ├── image.service.ts         # Image Generation Service
│   │   └── payment.service.ts       # Payment Service
│   └── 📁 types/                    # TypeScript Type Definitions
│       └── image.ts                 # Image Related Types
├── 📁 public/                       # Static Resource Files
│   ├── images/                      # Sample Images
│   │   ├── city.jpg
│   │   ├── desert.jpg
│   │   ├── mountain.jpg
│   │   └── space.jpg
│   └── logos/                       # Brand Assets
│       └── logo.svg
├── 📁 utils/                        # Build Tool Configurations
├── 📄 package.json                  # Project Dependency Configuration
├── 📄 tsconfig.json                 # TypeScript Configuration
├── 📄 next.config.ts                # Next.js Configuration
├── 📄 tailwind.config.ts            # Tailwind CSS Configuration
├── 📄 jest.config.js                # Jest Test Configuration
└── 📄 README.md                     # Project Documentation
```

### 📖 Detailed File Explanation

#### 🎯 1. App Directory Structure Explanation (Next.js 15 App Router)

**Core Concept**: App Router is Next.js 15's new routing system that uses file system routing. Each folder represents a route segment.

##### 📄 `app/layout.tsx` - Root Layout Component
```typescript
// Global layout containing common structure for all pages
import TopNav from "@/components/nav/top-nav";
import { ClerkProvider } from "@clerk/nextjs";
import { ImageProvider, ThemeProvider, PaypalProvider } from "@/context/*";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>           {/* User authentication context */}
      <html lang="en">
        <body>
          <ThemeProvider>      {/* Theme context */}
            <ImageProvider>    {/* Image state context */}
              <PaypalProvider> {/* Payment context */}
                <TopNav />     {/* Global navigation bar */}
                {children}      {/* Page content */}
              </PaypalProvider>
            </ImageProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

##### 📄 `app/page.tsx` - Home Page Component
```typescript
// Marketing page + image generation functionality
import { GenerateImageInput } from "@/components/forms/generate-image-input";
import { HeroImageSlider } from "@/components/display/hero-image-slider";

export default function Home() {
  return (
    <div className="grid max-w-4xl">
      {/* Gradient title */}
      <h1 className="text-7xl lg:text-9xl font-bold mb-2">
        <span className="bg-gradient-to-l from-blue-500 via-purple-500 to-red-500
                         text-transparent bg-clip-text animate-pulse">
          AI
        </span>
        <br />
        Image Generator
      </h1>

      <GenerateImageInput />  {/* Image generation form */}
      <HeroImageSlider />     {/* Sample image carousel */}
    </div>
  );
}
```

##### 📄 `app/chat/page.tsx` - Chat Page
```typescript
// Client-side chat interface
"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{sender, text}>>();
  const [input, setInput] = useState("");

  // Send message to API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Call /api/chat endpoint
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, provider: "gemini" }),
    });

    const data = await res.json();
    // Handle response...
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* Chat message list */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

##### 📄 `app/dashboard/page.tsx` - User Dashboard
```typescript
// Server component to get user images
import { getUserImagesFromDb } from "@/src/services/image.service";
import ImageCard from "@/components/cards/image-card";
import Pagination from "@/components/nav/pagination";

interface DashboardProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  const { page } = await searchParams;
  const pageNum = Number(page) || 1;

  // Get user images (paginated)
  const { images, totalCount } = await getUserImagesFromDb(pageNum, 6);

  return (
    <div>
      <h1 className="text-2xl font-bold">Images</h1>

      {/* Responsive grid layout */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {images.map((image) => (
          <Link key={image._id} href={`/dashboard/image/${image._id}`}>
            <ImageCard image={image} />
          </Link>
        ))}
      </div>

      <Pagination page={pageNum} totalPages={Math.ceil(totalCount / 6)} />
    </div>
  );
}
```

##### 📁 API Route Details

###### 📄 `app/api/chat/route.ts` - Chat API Endpoint
```typescript
import { auth } from "@clerk/nextjs/server";
import { handleChatController } from "@/src/controllers/chat/chat.controller";
import { checkRateLimit } from "@/src/middlewares/rate-limit";

export async function POST(req: Request) {
  // 1. User authentication
  const { userId } = await auth();
  if (!userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // 2. Rate limiting
  await checkRateLimit(userId);

  // 3. Request processing
  const body = await req.json();
  const response = await handleChatController(body, { userId, requestId });

  return Response.json(response, { status: response.success ? 200 : 400 });
}
```

#### 🎯 2. Src Directory Structure Explanation (Core Business Logic)

##### 📁 Controllers Layer - Request Processing

###### 📄 `src/controllers/chat/chat.controller.ts`
```typescript
import { ChatSchema } from "@/src/schemas/chat.schema";
import { sendChatMessage } from "@/src/services/chat.service";

export async function handleChatController(input: unknown, context: ChatContext) {
  // 1. Input validation
  const parsed = ChatSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0].message);
  }

  // 2. Call service layer
  const { message, provider } = parsed.data;
  const result = await sendChatMessage(message, provider, context.userId, context.requestId);

  // 3. Return response
  return success({
    reply: result.reply,
    remainingCredits: result.remainingCredits,
    cached: result.cached,
  });
}
```

##### 📁 Services Layer - Business Logic

###### 📄 `src/services/chat.service.ts` ⭐ **Core Service**
```typescript
// AI chat service - includes fallback, caching, metrics collection
export async function sendChatMessage(message, provider, userId, requestId) {
  // 1. Environment variable control switches
  const ENABLE_CHAT_CREDITS = !process.env.DISABLE_CHAT_CREDITS;
  const SIMULATE_GEMINI_FAILURE = process.env.SIMULATE_GEMINI_FAILURE === "true";

  // 2. Performance timing start
  const t0 = nowMs();

  try {
    // Database connection
    await db();

    // User authentication
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    // Cache check
    const cachedReply = DISABLE_CHAT_CACHE ? null : await getCachedReply(message);

    if (cachedReply) {
      // Cache hit, return directly
      return { reply: cachedReply, remainingCredits: null, cached: true };
    }

    // Credit deduction (if enabled)
    if (ENABLE_CHAT_CREDITS) {
      await creditRepository.deductCreditsAtomic(userEmail, 1, requestId);
    }

    // AI call (with fallback mechanism)
    const fallbackResult = await chatWithFallback(message, provider, requestId);

    // Cache write
    if (!DISABLE_CHAT_CACHE) {
      await cacheReply(message, fallbackResult.reply);
    }

    return {
      reply: fallbackResult.reply,
      remainingCredits: null,
      cached: false
    };

  } finally {
    // Metrics recording
    if (metricsEnabled()) {
      const totalMs = nowMs() - t0;
      logger.info("[metric] chat.request", {
        requestId, userId, status, errorName,
        providerRequested: provider,
        providerUsed: fallbackResult?.providerUsed,
        fallbackUsed: fallbackResult?.fallbackUsed,
        cached, messageLength: message.length,
        totalMs, dbMs, cacheReadMs, creditMs, aiMs, cacheWriteMs,
      });
    }
  }
}

// Fallback mechanism implementation
async function chatWithFallback(message, primaryProvider, requestId) {
  const providers = primaryProvider === "gemini"
    ? ["gemini", "openai"]
    : ["openai", "gemini"];

  for (const provider of providers) {
    try {
      // Simulate failure switch
      if (SIMULATE_GEMINI_FAILURE && provider === "gemini") {
        throw new Error("Simulated Gemini failure");
      }

      const ai = await getAIProvider(provider);
      const reply = await withTimeout(ai.chat(message), TIMEOUTS.AI_CHAT);

      return {
        reply,
        providerUsed: provider,
        fallbackUsed: provider !== primaryProvider,
        providerOrder: providers
      };
    } catch (err) {
      // Try next provider
      continue;
    }
  }
}
```

###### 📄 `src/services/image.service.ts` - Image Generation Service
```typescript
export async function generateImageAi(imagePrompt, requestId) {
  // 1. Credit deduction
  const deductionResult = await creditRepository.deductCreditsAtomic(userEmail, 1);

  if (!deductionResult.success) {
    return { success: false, _id: null, credits: deductionResult.remainingCredits };
  }

  // 2. Call Replicate AI to generate image
  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt: imagePrompt,
      output_format: "png",
      output_quality: 80,
      aspect_ratio: "16:9",
    },
  });

  // 3. Download image
  const response = await fetch(output[0]);
  const buffer = await response.arrayBuffer();

  // 4. Upload to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(
    `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`,
    { folder: "ai-generated" }
  );

  // 5. Save to database
  const imageDoc = await imageRepository.create({
    userEmail,
    url: uploadResult.secure_url,
    name: imagePrompt,
  });

  return {
    success: true,
    _id: imageDoc._id,
    credits: deductionResult.remainingCredits
  };
}
```

##### 📁 Repositories Layer - Data Access

###### 📄 `src/repositories/credits.repository.ts`
```typescript
export class CreditRepository {
  // Atomic credit deduction - prevents race conditions
  async deductCreditsAtomic(userEmail: string, amount: number, requestId?: string) {
    const result = await CreditModel.findOneAndUpdate(
      {
        userEmail,
        credits: { $gte: amount }, // Condition check: ensure sufficient credits
      },
      {
        $inc: { credits: -amount }, // Atomic decrement
      },
      {
        new: true, // Return updated document
        upsert: false,
      }
    );

    if (!result) {
      return { success: false, remainingCredits: 0 };
    }

    return { success: true, remainingCredits: result.credits };
  }

  // Get user credits
  async getUserCredits(userEmail: string) {
    const creditDoc = await CreditModel.findOne({ userEmail });
    return creditDoc?.credits || 0;
  }

  // Add credits
  async addCredits(userEmail: string, amount: number) {
    const result = await CreditModel.findOneAndUpdate(
      { userEmail },
      { $inc: { credits: amount } },
      { new: true, upsert: true }
    );
    return result.credits;
  }
}
```

##### 📁 Providers Layer - External Service Integration

###### 📄 `src/providers/ai/ai.factory.ts` - AI Provider Factory
```typescript
export type ProviderName = "gemini" | "openai";

export async function getAIProvider(provider: ProviderName): Promise<AIProvider> {
  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    case "gemini":
    default:
      return new GeminiProvider();
  }
}
```

###### 📄 `src/providers/ai/gemini.provider.ts` - Gemini AI Integration
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const client = new GoogleGenerativeAI(apiKey);

export class GeminiProvider implements AIProvider {
  private modelName = "gemini-2.5-flash";

  async chat(message: string): Promise<string> {
    const model = client.getGenerativeModel({ model: this.modelName });

    const chatSession = model.startChat({
      generationConfig: {
        temperature: 1,
        maxOutputTokens: 500
      },
      history: [{
        role: "user",
        parts: [{
          text: "You are a helpful assistant for an AI image generator website..."
        }],
      }],
    });

    const result = await chatSession.sendMessage(message);
    return result.response.text().trim();
  }
}
```

##### 📁 Models Layer - Data Models

###### 📄 `src/models/credit.model.ts` - Credit Data Model
```typescript
import mongoose from "mongoose";

const CreditSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
    index: true, // Database index for accelerated queries
  },
  credits: {
    type: Number,
    required: true,
    default: 10, // New users get 10 credits by default
  },
  amount: {
    type: Number,
    required: true,
    default: 10,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

export default mongoose.models.Credit || mongoose.model("Credit", CreditSchema);
```

###### 📄 `src/models/image.model.ts` - Image Data Model
```typescript
const ImageSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true,
  },
  userName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  // Cloudinary related fields
  publicId: String,
  width: Number,
  height: Number,
}, {
  timestamps: true,
});

export default mongoose.models.Image || mongoose.model("Image", ImageSchema);
```

##### 📁 Schemas Layer - Request Validation

###### 📄 `src/schemas/chat.schema.ts` - Chat Request Validation
```typescript
import { z } from "zod";

export const ChatSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long")
    .trim(),

  provider: z.enum(["gemini", "openai"])
    .default("gemini")
    .optional(),
}).strict(); // No extra fields allowed

export type ChatRequest = z.infer<typeof ChatSchema>;
```

##### 📁 Middlewares Layer - Request Middleware

###### 📄 `src/middlewares/rate-limit.ts` - Rate Limiting
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute
});

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId);

  if (!success) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
}
```

###### 📄 `src/middlewares/rbac.ts` - Role-Based Access Control
```typescript
export type UserRole = "user" | "subscriber" | "admin";

export function checkRole(requiredRole: UserRole, userRole?: UserRole) {
  const roleHierarchy = {
    user: 1,
    subscriber: 2,
    admin: 3,
  };

  const userLevel = roleHierarchy[userRole || "user"];
  const requiredLevel = roleHierarchy[requiredRole];

  return userLevel >= requiredLevel;
}

export function requireAdmin(userRole?: UserRole) {
  if (!checkRole("admin", userRole)) {
    throw new Error("Admin access required");
  }
}
```

##### 📁 Lib Layer - Utility Library

###### 📄 `src/lib/cache.ts` - Redis Cache Tool
```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const cache = {
  // Prompt cache key generation
  promptKey: (message: string) => `prompt:${Buffer.from(message).toString('base64').slice(0, 50)}`,

  // Get cache
  async get<T>(key: string, requestId?: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (value) {
        logger.debug(`Cache hit for key: ${key}`, { requestId });
        return JSON.parse(value as string);
      }
      logger.debug(`Cache miss for key: ${key}`, { requestId });
      return null;
    } catch (err) {
      logger.warn(`Cache get error for key: ${key}`, { err, requestId });
      return null;
    }
  },

  // Set cache (with TTL)
  async set(key: string, value: any, options: { ttl?: number, requestId?: string } = {}) {
    try {
      const { ttl = 86400, requestId } = options; // Default 24 hours
      await redis.setex(key, ttl, JSON.stringify(value));
      logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`, { requestId });
    } catch (err) {
      logger.warn(`Cache set error for key: ${key}`, { err, requestId });
    }
  },
};
```

###### 📄 `src/lib/errors.ts` - Custom Error Classes
```typescript
export class InsufficientCreditsError extends Error {
  public readonly remainingCredits?: number;

  constructor(message: string, remainingCredits?: number) {
    super(message);
    this.name = "InsufficientCreditsError";
    this.remainingCredits = remainingCredits;
  }
}

export class ProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
```

#### 🎨 3. Components Directory Explanation (UI Components)

##### 📄 `components/nav/top-nav.tsx` - Top Navigation Bar
```typescript
"use client";

import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./mode-toggle";
import { Credits } from "./credits";

export default function TopNav() {
  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <Link href="/" className="text-xl font-bold">
        AI Image Generator
      </Link>

      <div className="flex items-center gap-4">
        <Credits />          {/* Credit display */}
        <ModeToggle />       {/* Theme toggle */}
        <UserButton />       {/* User menu */}
      </div>
    </nav>
  );
}
```

##### 📄 `components/forms/generate-image-input.tsx` - Image Generation Form
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateImageAi } from "@/src/services/image.service";

export function GenerateImageInput() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const result = await generateImageAi(prompt);

      if (result.success) {
        // Redirect to dashboard to view newly generated image
        router.push("/dashboard");
      } else {
        alert(`Generation failed: ${result.credits ? 'Insufficient credits' : 'Unknown error'}`);
      }
    } catch (err) {
      alert("Generation failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        className="flex-1"
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !prompt.trim()}>
        {loading ? "Generating..." : "Generate Image"}
      </Button>
    </form>
  );
}
```

##### 📄 `components/cards/image-card.tsx` - Image Card
```typescript
import Image from "next/image";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";

interface ImageCardProps {
  image: {
    _id: string;
    url: string;
    name: string;
    createdAt: string;
    userName: string;
  };
}

export default function ImageCard({ image }: ImageCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <Image
          src={image.url}
          alt={image.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold truncate">{image.name}</h3>
        <p className="text-sm text-gray-600">
          {image.userName} · {dayjs(image.createdAt).fromNow()}
        </p>
      </div>
    </Card>
  );
}
```

#### 🎭 4. Context Directory Explanation (State Management)

##### 📄 `context/image.tsx` - Image State Management
```typescript
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ImageContextType {
  generatedImages: Array<{
    id: string;
    url: string;
    prompt: string;
  }>;
  addImage: (image: { id: string; url: string; prompt: string }) => void;
  clearImages: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string;
    url: string;
    prompt: string;
  }>>([]);

  const addImage = (image: { id: string; url: string; prompt: string }) => {
    setGeneratedImages(prev => [image, ...prev]);
  };

  const clearImages = () => {
    setGeneratedImages([]);
  };

  return (
    <ImageContext.Provider value={{
      generatedImages,
      addImage,
      clearImages
    }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImage() {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within ImageProvider");
  }
  return context;
}
```

##### 📄 `context/theme.tsx` - Theme State Management
```typescript
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      ...props
    >

      {children}
    </NextThemesProvider>
  );
}
```

### 🔧 Configuration Files Detailed Explanation

#### 📄 `package.json` - Project Dependency Configuration
```json
{
  "name": "ai_img_chat",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",                    // Development server
    "build": "next build",               // Production build
    "start": "next start",               // Production server
    "test": "jest",                      // Run tests
    "lint": "next lint",                 // ESLint check
    "type-check": "tsc --noEmit"         // TypeScript type check
  },
  "dependencies": {
    // Next.js ecosystem
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",

    // Authentication
    "@clerk/nextjs": "^6.33.0",

    // AI services
    "@google/generative-ai": "^0.24.1",
    "openai": "^6.7.0",
    "replicate": "^1.2.0",

    // Database
    "mongoose": "^8.19.1",

    // Cache
    "@upstash/redis": "^1.35.7",
    "@upstash/ratelimit": "^2.0.7",

    // UI components
    "@radix-ui/react-slot": "^1.2.3",
    "lucide-react": "^0.544.0",

    // Tool libraries
    "zod": "^4.1.13",
    "dayjs": "^1.11.18",
    "nanoid": "^5.1.6"
  },
  "devDependencies": {
    // Testing
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "jest": "^29.7.0",

    // TypeScript
    "@types/node": "24.7.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",

    // Styling
    "tailwindcss": "^4",
    "postcss": "^8"
  }
}
```

#### 📄 `next.config.ts` - Next.js Configuration
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'], // External packages for server components
  },
  images: {
    domains: ['res.cloudinary.com'], // Allowed image domains
  },
  env: {
    // Client environment variables prefix
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
};

export default nextConfig;
```

#### 📄 `jest.setup.js` - Test Environment Configuration
```javascript
// Environment variable setup
process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";
process.env.DATABASE_URL = "mongodb://localhost:27017/test";
process.env.MONGODB_URI = "mongodb://localhost:27017/test"; // Support both

// Development simulation switches for testing (default to disabled)
process.env.DISABLE_CHAT_CREDITS = "true";
process.env.DISABLE_CHAT_CACHE = "false";
process.env.SIMULATE_GEMINI_FAILURE = "false";

// Mongoose Mock
jest.mock("mongoose", () => ({
  connect: jest.fn(),
  connection: { readyState: 1 },
  model: jest.fn(() => ({
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
  })),
  models: {},
  Schema: jest.fn(() => ({})),
}));
```

### 🎯 Core Feature Implementation Flow Chart

```
User Request → Clerk Authentication → Rate Limiting → API Route → Controller Validation → Service Layer Business Logic → Repository Data Access → Provider External Call
     ↓           ↓           ↓          ↓          ↓              ↓                  ↓              ↓
Response Return ← Metrics Recording ← Error Handling ← Format Response ← Input Validation ← Cache/Credit/AI Calls ← Database Operations ← AI Provider Response
```

### 💡 Learning Suggestions

1. **Learn from outside to inside**: Start with page structure, then delve into API, then learn service layer
2. **Focus on data flow**: Understand how requests flow from frontend to database and back
3. **Master patterns**: Learn layered architecture, dependency injection, error handling, and other design patterns
4. **Practice testing**: Use provided development switches to test different scenarios
5. **Performance monitoring**: View metric logs to understand system performance characteristics

## 🤝 Contributing Guide

### Development Environment Setup

1. Install dependencies: `npm install`
2. Configure environment variables: Copy `.env.example` to `.env.local`
3. Start development server: `npm run dev`

### Code Standards

- **TypeScript**: Strict type checking
- **ESLint**: Code quality checks
- **Prettier**: Code formatting
- **Naming Convention**: PascalCase (components), camelCase (functions)

### Commit Standards

- Use semantic commit messages
- English commit messages with clear change descriptions
- Reference related issues

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Next.js**: React full-stack framework
- **Clerk**: User authentication service
- **MongoDB**: NoSQL database
- **Redis**: In-memory data structure store
- **Google AI**: Gemini AI service
- **OpenAI**: GPT model service
- **Replicate**: AI model hosting platform
- **Cloudinary**: Image storage and processing

---

**Project Status**: ✅ Production Ready

**Last Updated**: January 2025

**Maintainer**: AI Image Chat Team

----



