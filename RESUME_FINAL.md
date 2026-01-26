# AI Image Generation & Chat SaaS Platform — Full-Stack Engineer (Personal Project)

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, MongoDB (Mongoose), Upstash Redis, Clerk, PayPal, Cloudinary, Gemini/OpenAI, Replicate

Delivered a production-grade AI SaaS with auth/RBAC, credit-based billing, chat + image generation, admin analytics, and payment flow, built end-to-end in TypeScript (**1,954 LOC across 35 files**).

Architected a layered backend (Routes → Controllers → Services → Repos → Providers) with Zod validation + standardized API envelopes, enabling clean extensibility for new providers/features.

Hardened reliability with timeouts, Gemini→OpenAI fallback, and request tracing (x-request-id) + structured logs to reduce user-visible failures and speed up debugging.

Guaranteed billing correctness via atomic MongoDB credit deduction (single-step check-and-decrement), preventing race conditions and negative balances under concurrent requests.

Accelerated responses and reduced cost using Redis caching (24h TTL) for prompt replies + credit reads; implemented comprehensive metrics tracking with **12 performance indicators per request** (6 latency dimensions: total/DB/cache/credit/AI/cache-write; 6 business metrics: status/provider/fallback/cache-hit/message-length/error-type) enabling real-time performance analysis and optimization.

Protected system resources with Clerk auth, RBAC (user/subscriber/admin), and per-user rate limiting (20 req/day) backed by Upstash Redis.

**Observability & Quality:** Built end-to-end metrics infrastructure with cost tracking (by user/provider/operation type), platform-wide analytics API, event tracking system, and Jest test framework with coverage reporting across **7 metrics-related modules**.

---

## 📊 Real Metrics Breakdown (For Reference)

### Code Metrics
- **1,954 lines of code** (TypeScript/JavaScript)
- **35 source files**
- **5-layer architecture**: Routes → Controllers → Services → Repos → Providers

### Performance Monitoring
- **12 metrics tracked per request**:
  - **6 Latency metrics**: totalMs, dbMs, cacheReadMs, creditMs, aiMs, cacheWriteMs
  - **6 Business metrics**: status, providerUsed, fallbackUsed, cached, messageLength, errorName
- **Metrics infrastructure**: 7 dedicated modules/files
- **Real-time logging**: Structured JSON logs with request tracing

### Cost Tracking
- **Multi-dimensional cost analysis**:
  - By user (per-user cost aggregation)
  - By provider (Gemini/OpenAI/Replicate)
  - By operation type (chat/image)
  - Token-level tracking (input/output tokens)
- **Platform-wide cost aggregation** via admin API

### Testing & Quality
- **Jest test framework** with coverage reporting
- **3 test scripts**: test, test:watch, test:coverage
- **Unit tests** for core services
- **Test infrastructure**: jest.config.js, jest.setup.js

### Security & Reliability
- **Atomic operations**: MongoDB atomic credit deduction
- **Rate limiting**: 20 requests/day per user (Upstash Redis)
- **Request tracing**: x-request-id propagation across all layers
- **Provider fallback**: Automatic Gemini → OpenAI failover
- **Timeout protection**: Per-operation timeouts (AI: 30s, Image: 2min, DB: 5s)

### Analytics & Observability
- **Event tracking system**: AI usage, credit purchases, custom events
- **Admin stats API**: Platform-wide metrics (users, credits, images, costs)
- **Structured logging**: Request-level context with timestamps
- **Cost tracking database**: Persistent cost records with timestamps

---

## 🎯 Key Achievements to Highlight

1. **Comprehensive Metrics System**: 12 performance indicators per request for real-time monitoring
2. **Production-Ready Architecture**: 5-layer separation with clean interfaces
3. **Cost Optimization**: Multi-dimensional cost tracking enabling data-driven decisions
4. **Quality Assurance**: Jest framework with coverage reporting
5. **Observability**: End-to-end request tracing and structured logging
6. **Scalability**: Redis caching reducing AI API calls and database load

---

*All metrics are based on actual code analysis and implemented features.*

