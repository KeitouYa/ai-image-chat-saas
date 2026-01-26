# Features Documentation

## Core Features

### 1. AI Chat

- **Providers**: Gemini (default) or OpenAI
- **Caching**: Common prompts cached for 24 hours
- **Fallback**: Automatic fallback to secondary provider on failure
- **Timeout**: 30-second timeout per request
- **Cost**: 1 credit per message (free for cached responses)

### 2. Image Generation

- **Model**: Flux Schnell via Replicate
- **Storage**: Cloudinary
- **Format**: PNG, 16:9 aspect ratio
- **Cost**: 1 credit per image
- **Timeout**: 2-minute timeout

### 3. Credit System

- **Initial Credits**: 10 free credits on signup
- **Purchase**: PayPal integration
- **Atomic Deduction**: Prevents race conditions
- **Validation**: Credits cannot go negative

### 4. Authentication & Authorization

- **Authentication**: Clerk-based
- **Roles**: User, Subscriber, Admin
- **RBAC**: Role-based access control
- **Protected Routes**: Middleware protection

### 5. Rate Limiting

- **Limit**: 20 requests per minute per user
- **Storage**: Upstash Redis
- **Response**: 429 Too Many Requests

### 6. Caching

- **Prompt Caching**: Redis-based
- **TTL**: 24 hours for prompts
- **Credit Caching**: User credits cached

### 7. Request Tracing

- **Request ID**: Generated per request
- **Propagation**: Passed through all layers
- **Logging**: Included in all log entries

### 8. Error Handling

- **Structured Errors**: Custom error classes
- **HTTP Status Codes**: Proper status codes
- **Logging**: All errors logged with context

## Advanced Features

### 1. Feature Flags

- **In-Memory**: Simple feature flag system
- **Rollout**: Percentage-based rollouts
- **Usage**: `isFeatureEnabled('FLAG_NAME')`

### 2. Analytics

- **Event Tracking**: Built-in analytics
- **AI Usage**: Track AI operation usage
- **Credit Purchases**: Track purchases
- **Events**: Stored in memory (extendable to external service)

### 3. Cost Tracking

- **Per Operation**: Track costs per AI operation
- **User Costs**: Track per-user costs
- **Platform Costs**: Track total platform costs
- **Estimation**: Estimated costs based on provider pricing

### 4. Admin Dashboard

- **Stats**: Platform statistics
- **Users**: User management
- **Protected**: Admin-only access

## Performance Features

### 1. Caching Strategy

- **Prompt Cache**: Avoid duplicate AI calls
- **Credit Cache**: Reduce database queries
- **TTL Management**: Configurable TTLs

### 2. Timeout Handling

- **AI Calls**: 30-second timeout
- **Image Generation**: 2-minute timeout
- **Database**: 5-second timeout
- **External APIs**: 10-second timeout

### 3. Fallback Logic

- **Provider Fallback**: Automatic fallback between providers
- **Graceful Degradation**: Continues operation on failures

### 4. Connection Pooling

- **MongoDB**: Automatic connection pooling
- **Redis**: Connection reuse
- **Efficient**: Reduces connection overhead

## Security Features

### 1. Input Validation

- **Zod Schemas**: Type-safe validation
- **Strict Mode**: Prevents injection attacks
- **Sanitization**: Input sanitization

### 2. Authentication

- **Clerk**: Industry-standard authentication
- **Session Management**: Secure session handling
- **Token Validation**: Automatic token validation

### 3. Authorization

- **RBAC**: Role-based access control
- **Middleware**: Route-level protection
- **Admin Routes**: Admin-only endpoints

### 4. Rate Limiting

- **Per User**: Individual rate limits
- **Redis-Based**: Scalable rate limiting
- **Abuse Prevention**: Prevents abuse

## Observability Features

### 1. Logging

- **Structured Logs**: Consistent log format
- **Request IDs**: Request tracing
- **Context**: Rich context in logs
- **Levels**: Info, Warn, Error, Debug

### 2. Request Tracing

- **Request IDs**: Unique per request
- **Propagation**: Through all layers
- **Correlation**: Correlate logs

### 3. Analytics

- **Event Tracking**: Track important events
- **Usage Metrics**: Track usage
- **Cost Metrics**: Track costs

### 4. Error Tracking

- **Structured Errors**: Consistent error format
- **Context**: Rich error context
- **Logging**: All errors logged


