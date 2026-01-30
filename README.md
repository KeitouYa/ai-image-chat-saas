# AI Image Generator & Chat Platform

A production-ready SaaS application featuring AI-powered image generation and intelligent chat, built with modern full-stack technologies and enterprise-grade architecture.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green?logo=mongodb)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)

**Live Demo**: [https://ai-image-generator-chatbot.vercel.app/](https://ai-image-generator-chatbot.vercel.app/)

## Technical Highlights

### Architecture & Design Patterns

- **Layered Architecture**: Clean separation with `API Route → Controller → Service → Repository → Model`
- **Factory Pattern**: Dynamic AI provider switching with automatic failover
- **Atomic Operations**: MongoDB `$gte` operator prevents credit race conditions
- **Request Tracing**: Unique `requestId` (nanoid) propagates through entire request lifecycle

### Performance & Reliability

- **Multi-Provider Failover**: Gemini → OpenAI automatic fallback on failure
- **Redis Caching**: 24-hour response cache with Upstash Redis
- **Timeout Protection**: 30s for AI calls, 2min for image generation
- **Rate Limiting**: Token bucket algorithm with configurable limits

### Security

- **RBAC Authorization**: Three-tier role system (USER/SUBSCRIBER/ADMIN)
- **Clerk Authentication**: Secure user management with webhook integration
- **Input Validation**: Zod schemas for all API endpoints

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, Radix UI, shadcn/ui |
| Backend | Next.js API Routes, Node.js |
| Database | MongoDB 8, Mongoose ODM |
| Caching | Upstash Redis |
| Auth | Clerk |
| AI Services | Google Gemini, OpenAI (fallback), Replicate (Flux Schnell) |
| Storage | Cloudinary |
| Payment | PayPal |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Next.js API Routes                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ /api/chat   │  │ /api/image  │  │ /api/credits        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
┌─────────▼────────────────▼────────────────────▼─────────────┐
│                     Controller Layer                         │
│         (Request validation, Error handling)                 │
└─────────┬────────────────┬────────────────────┬─────────────┘
          │                │                    │
┌─────────▼────────────────▼────────────────────▼─────────────┐
│                      Service Layer                           │
│    (Business logic, AI provider orchestration, Caching)      │
└─────────┬────────────────┬────────────────────┬─────────────┘
          │                │                    │
┌─────────▼────────────────▼────────────────────▼─────────────┐
│                    Repository Layer                          │
│              (Data access, Atomic operations)                │
└─────────┬────────────────┬────────────────────┬─────────────┘
          │                │                    │
┌─────────▼────────┐ ┌─────▼─────┐ ┌───────────▼─────────────┐
│    MongoDB       │ │   Redis   │ │   External Services     │
│  (Users, Images, │ │  (Cache)  │ │ (Gemini, OpenAI,        │
│   Credits)       │ │           │ │  Replicate, Cloudinary) │
└──────────────────┘ └───────────┘ └─────────────────────────┘
```

## Key Implementation Details

### AI Provider Failover

```typescript
// Automatic failover from Gemini to OpenAI
async function generateResponse(prompt: string): Promise<string> {
  try {
    return await geminiProvider.generate(prompt);
  } catch (error) {
    logger.warn('Gemini failed, falling back to OpenAI');
    return await openaiProvider.generate(prompt);
  }
}
```

### Atomic Credit Deduction

```typescript
// Prevents race conditions with atomic MongoDB operation
const result = await Credit.findOneAndUpdate(
  { userEmail, credits: { $gte: cost } },  // Only if sufficient credits
  { $inc: { credits: -cost } },
  { new: true }
);
if (!result) throw new InsufficientCreditsError();
```

### Request Tracing

```typescript
// Unique ID propagates through entire request lifecycle
const requestId = nanoid();
logger.info({ requestId, action: 'chat_request' });
// ... all subsequent logs include requestId
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/                # API endpoints
│   │   ├── chat/           # AI chat endpoint
│   │   ├── image/          # Image generation endpoint
│   │   └── credits/        # Credit management
│   ├── chat/               # Chat page
│   ├── dashboard/          # User dashboard
│   └── buy-credits/        # Payment page
│
├── src/
│   ├── controllers/        # Request handling
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── models/             # MongoDB schemas
│   ├── providers/          # External service integrations
│   │   ├── ai/             # AI providers (Gemini, OpenAI)
│   │   └── db/             # Database connection
│   ├── middlewares/        # Rate limiting, RBAC
│   └── lib/                # Utilities (logger, cache, errors)
│
└── components/             # React components
    ├── ui/                 # Base UI components
    └── forms/              # Form components
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- API keys for: Clerk, Google Gemini, Replicate, Cloudinary

### Installation

```bash
git clone https://github.com/yourusername/ai-image-chat.git
cd ai-image-chat
npm install --legacy-peer-deps
```

### Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI Services
GEMINI_API_KEY=...
OPENAI_API_KEY=...
REPLICATE_API_TOKEN=...

# Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Cache
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **AI Chat**: Intelligent conversations powered by Gemini/OpenAI with response caching
- **Image Generation**: Text-to-image using Replicate's Flux Schnell model
- **Credit System**: Pay-per-use model with atomic transaction handling
- **User Dashboard**: View and manage generated images
- **Role-Based Access**: Different permissions for users, subscribers, and admins

