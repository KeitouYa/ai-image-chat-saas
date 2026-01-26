# Deployment Guide

## Prerequisites

- Node.js 20+ installed
- MongoDB database (MongoDB Atlas recommended)
- Upstash Redis account
- Clerk account
- Cloudinary account
- Replicate account
- PayPal account (for payments)

## Environment Variables

Set the following environment variables in your deployment platform:

### Required

```env
MONGODB_URI=your_mongodb_connection_string
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
GEMINI_API_KEY=your_gemini_api_key
# OR
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_TOKEN=your_replicate_api_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Optional

```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
NODE_ENV=production
```

## Vercel Deployment

1. **Connect Repository**
   - Import your repository to Vercel
   - Vercel will auto-detect Next.js

2. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables

3. **Deploy**
   - Push to main branch triggers automatic deployment
   - Or manually deploy from Vercel dashboard

4. **Configure Clerk**
   - Add your Vercel deployment URL to Clerk dashboard
   - Update allowed origins

## Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
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

## Database Setup

1. **MongoDB Atlas**
   - Create a cluster
   - Create a database user
   - Whitelist deployment IP (or 0.0.0.0/0 for Vercel)
   - Get connection string

2. **Initial Setup**
   - Database will auto-create collections on first use
   - Users will get 10 free credits on first login

## Monitoring

### Logs

- Vercel: View logs in dashboard
- Docker: Use `docker logs`
- Production: Consider using a logging service (e.g., Logtail, Datadog)

### Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

## Scaling Considerations

1. **Database**: Use MongoDB Atlas with appropriate tier
2. **Redis**: Upstash scales automatically
3. **API**: Next.js API routes scale with Vercel/serverless
4. **CDN**: Static assets served via Vercel CDN

## Security Checklist

- [ ] All environment variables set
- [ ] Clerk authentication configured
- [ ] MongoDB IP whitelist configured
- [ ] Rate limiting enabled
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] CORS configured (if needed)

## Troubleshooting

### Build Failures

- Check environment variables are set
- Verify Node.js version (20+)
- Check for TypeScript errors: `npm run type-check`

### Runtime Errors

- Check logs for specific error messages
- Verify database connection
- Verify Redis connection
- Check API keys are valid

### Performance Issues

- Enable Redis caching
- Check database indexes
- Monitor API response times
- Consider upgrading database tier


