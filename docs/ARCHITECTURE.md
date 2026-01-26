# Architecture Documentation

## Overview

This document describes the architecture of the AI Image + Chat SaaS application.

## System Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Next.js App Router          │
│  ┌───────────────────────────────┐  │
│  │      API Routes Layer         │  │
│  │  - Authentication (Clerk)    │  │
│  │  - Rate Limiting             │  │
│  │  - Request Tracing           │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │    Controllers Layer         │  │
│  │  - Input Validation (Zod)    │  │
│  │  - Error Handling           │  │
│  │  - Response Formatting      │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │     Services Layer           │  │
│  │  - Business Logic           │  │
│  │  - Credit Deduction         │  │
│  │  - Caching                  │  │
│  │  - Fallback Logic           │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │   Repositories Layer         │  │
│  │  - Data Access              │  │
│  │  - Atomic Operations        │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │     Providers Layer          │  │
│  │  - AI Providers (Gemini/OpenAI)│ │
│  │  - Database (MongoDB)        │  │
│  │  - Cache (Redis)             │  │
│  │  - Image Storage (Cloudinary)│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Data Flow

### Chat Request Flow

1. **Client** sends POST request to `/api/chat`
2. **Middleware** authenticates user and generates requestId
3. **API Route** extracts userId and requestId
4. **Controller** validates input with Zod schema
5. **Service** checks cache, deducts credits atomically, calls AI provider
6. **Repository** performs atomic credit deduction
7. **Provider** calls external AI API
8. **Service** caches response and returns result
9. **Controller** formats response
10. **API Route** returns JSON response

### Image Generation Flow

1. **Client** calls server action `generateImageAi()`
2. **Service** deducts credits atomically
3. **Service** calls Replicate API for image generation
4. **Service** uploads image to Cloudinary
5. **Repository** saves image metadata to MongoDB
6. **Service** returns image ID and remaining credits

## Key Components

### Credit Deduction System

- **Atomic Operations**: Uses MongoDB `findOneAndUpdate` with conditions
- **Race Condition Prevention**: Checks and deducts in single operation
- **Credit Validation**: Prevents negative credits

### Caching Strategy

- **Prompt Caching**: Common prompts cached for 24 hours
- **Credit Caching**: User credits cached (invalidated on updates)
- **Cache Key Strategy**: Normalized keys for consistency

### Error Handling

- **Structured Errors**: Custom error classes (ValidationError, InsufficientCreditsError, etc.)
- **Error Propagation**: Errors bubble up through layers
- **Logging**: All errors logged with context

### Security

- **Authentication**: Clerk middleware
- **Authorization**: RBAC middleware
- **Rate Limiting**: Upstash Redis-based rate limiting
- **Input Validation**: Zod schemas with `.strict()`

## Database Schema

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
  role: "user" | "admin" | "subscriber"
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

## Performance Optimizations

1. **Redis Caching**: Reduces database queries
2. **Prompt Caching**: Avoids duplicate AI calls
3. **Connection Pooling**: MongoDB connection reuse
4. **Timeout Handling**: Prevents hanging requests
5. **Fallback Providers**: Ensures availability

## Scalability Considerations

- **Stateless API**: Can scale horizontally
- **External Services**: AI providers handle scaling
- **Database Indexing**: Optimized queries
- **Caching**: Reduces load on database
- **Rate Limiting**: Prevents abuse

## Monitoring & Observability

- **Request Tracing**: requestId propagated through all layers
- **Structured Logging**: Consistent log format
- **Cost Tracking**: Track AI operation costs
- **Analytics**: Built-in analytics system


