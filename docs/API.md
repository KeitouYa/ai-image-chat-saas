# API Documentation

## Authentication

All API endpoints (except public routes) require authentication via Clerk. Include the authentication token in the request headers.

## Request Format

All requests should include:
- `Content-Type: application/json`
- Authentication headers (handled by Clerk middleware)
- Optional: `x-request-id` header for tracing

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Chat

#### POST /api/chat

Send a chat message to the AI.

**Request Body:**

```json
{
  "message": "Hello, how are you?",
  "provider": "gemini" // Optional: "gemini" | "openai", defaults to "gemini"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "reply": "I'm doing well, thank you!",
    "remainingCredits": 9,
    "cached": false
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `402` - Insufficient credits
- `429` - Rate limit exceeded
- `500` - Internal server error

**Credit Cost:** 1 credit per message (not deducted for cached responses)

---

### Credits

#### GET /api/credits

Get user's current credit balance.

**Response:**

```json
{
  "success": true,
  "data": {
    "credits": 10,
    "amount": 0
  }
}
```

#### POST /api/credits

Add credits via PayPal payment.

**Request Body:**

```json
{
  "amount": 10.00,
  "credits": 100
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "credits": 110,
    "amount": 10.00
  }
}
```

---

### Image Generation

Image generation is handled via server actions, not REST API.

**Server Action:** `generateImageAi(prompt: string)`

**Returns:**

```typescript
{
  success: boolean;
  _id: string | null; // Image ID if successful
  credits: number | null; // Remaining credits
}
```

**Credit Cost:** 1 credit per image

---

### Admin Endpoints

#### GET /api/admin/stats

Get platform statistics (admin only).

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150
    },
    "credits": {
      "totalInCirculation": 5000,
      "totalPurchased": 10000
    },
    "images": {
      "total": 2500
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `403` - Forbidden (not admin)

#### GET /api/admin/users

List all users (admin only).

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [],
    "page": 1,
    "limit": 50
  }
}
```

---

## Rate Limiting

Rate limiting is enforced per user:
- Default: 20 requests per minute
- Returns `429 Too Many Requests` when exceeded

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `402` - Payment Required (insufficient credits)
- `403` - Forbidden (insufficient permissions)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Request Tracing

Include `x-request-id` header in requests for tracing. If not provided, one will be generated automatically.

Example:
```
x-request-id: abc123xyz
```

This ID will be included in all logs related to the request.


