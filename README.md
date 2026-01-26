# 🤖 AI 图像生成 + 聊天 SaaS 应用

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-orange)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-cyan)](https://tailwindcss.com/)

一个功能完整的AI图像生成和聊天SaaS应用，集成了Google Gemini、OpenAI和Replicate的AI服务。支持用户认证、积分系统、图像生成、AI聊天等多种功能。

## 📋 项目概述

### 🎯 核心功能

- **AI 图像生成**: 使用Replicate的Flux Schnell模型生成高质量图像
- **AI 聊天对话**: 支持Gemini和OpenAI双AI提供商，带自动降级机制
- **用户认证**: 基于Clerk的用户注册和登录系统
- **积分系统**: 原子操作的积分扣费和购买系统
- **图像管理**: 基于Cloudinary的图像存储和展示
- **管理后台**: 完整的管理员功能和统计面板
- **响应式设计**: 现代化的UI界面，支持明暗主题切换

> 💡 **重要说明**: 当前项目配置中聊天功能设置为不扣费 (`ENABLE_CHAT_CREDITS = false`)，如需启用请修改 `src/services/chat.service.ts` 中的对应开关。

### 🚀 技术亮点

- **现代化架构**: 采用分层架构设计，职责分离清晰
- **性能优化**: Redis缓存、请求超时控制、连接池复用
- **安全可靠**: RBAC权限控制、原子操作、速率限制
- **可观测性**: 完整的日志记录、请求追踪、错误处理
- **开发者友好**: TypeScript类型安全、Jest测试、CI/CD流程

## 🏗️ 技术栈

### 前端技术栈
- **框架**: Next.js 15.5.4 (App Router)
- **语言**: TypeScript 5
- **UI库**: Radix UI + Tailwind CSS 4
- **状态管理**: React Context + Server Components
- **主题**: next-themes
- **支付**: PayPal React SDK

### 后端技术栈
- **运行时**: Node.js (Next.js Server)
- **数据库**: MongoDB 8 + Mongoose
- **缓存**: Redis (Upstash)
- **认证**: Clerk Authentication
- **AI服务**:
  - Google Gemini AI (默认)
  - OpenAI GPT
  - Replicate (图像生成)

### 基础设施
- **图像存储**: Cloudinary
- **速率限制**: Upstash Rate Limit
- **日志**: 结构化日志系统
- **错误处理**: 自定义错误类
- **验证**: Zod Schema 验证

## 🏛️ 系统架构

### 分层架构设计

```
┌─────────────┐
│   Client    │  ← 浏览器客户端
│  (Browser)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Next.js App Router          │
│  ┌───────────────────────────────┐  │
│  │      API Routes Layer         │  │  ← API路由层
│  │  - Authentication (Clerk)    │  │
│  │  - Rate Limiting             │  │
│  │  - Request Tracing           │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │    Controllers Layer         │  │  ← 控制器层
│  │  - Input Validation (Zod)    │  │
│  │  - Error Handling           │  │
│  │  - Response Formatting      │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │     Services Layer           │  │  ← 服务层
│  │  - Business Logic           │  │
│  │  - Credit Deduction         │  │
│  │  - Caching                  │  │
│  │  - Fallback Logic           │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │   Repositories Layer         │  │  ← 仓库层
│  │  - Data Access              │  │
│  │  - Atomic Operations        │  │
│  └───────────┬───────────────────┘  │
│              ▼                       │
│  ┌───────────────────────────────┐  │
│  │     Providers Layer          │  │  ← 提供商层
│  │  - AI Providers (Gemini/OpenAI)│  │
│  │  - Database (MongoDB)        │  │
│  │  - Cache (Redis)             │  │
│  │  - Image Storage (Cloudinary)│  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 数据流设计

#### 聊天请求流程
1. **客户端**发送POST请求到`/api/chat`
2. **中间件**认证用户并生成requestId
3. **API路由**提取userId和requestId
4. **控制器**使用Zod验证输入
5. **服务**检查缓存，原子扣费，调用AI提供商
6. **仓库**执行原子积分扣费
7. **提供商**调用外部AI API
8. **服务**缓存响应并返回结果

#### 图像生成流程
1. **客户端**调用`generateImageAi()`服务端操作
2. **服务**原子扣费
3. **服务**调用Replicate API生成图像
4. **服务**上传图像到Cloudinary
5. **仓库**保存图像元数据到MongoDB
6. **服务**返回图像ID和剩余积分

## 🎨 页面实现详解

### 1. 首页 (`app/page.tsx`)

**功能特色**:
- 渐变动画标题 "AI Image Generator"
- 图像生成输入表单
- 英雄图像轮播展示

**UI实现**:
```tsx
// 渐变动画效果
<span className="text-8xl bg-gradient-to-l from-blue-500 via-purple-500 to-red-500 text-transparent bg-clip-text animate-pulse">
  AI
</span>
```

### 2. 聊天页面 (`app/chat/page.tsx`)

**功能特色**:
- 实时聊天界面
- 支持Gemini/OpenAI切换
- 加载状态和错误处理
- 自动滚动到底部

**技术实现**:
- 客户端组件 (`"use client"`)
- React状态管理消息历史
- 自动滚动 (`scrollIntoView`)
- 键盘快捷键支持

### 3. 仪表板页面 (`app/dashboard/page.tsx`)

**功能特色**:
- 用户图像收藏展示
- 分页导航
- 响应式网格布局
- 图像详情跳转

**技术实现**:
- 服务端组件 (Next.js 15)
- 异步搜索参数处理
- 动态分页计算
- 图像卡片组件复用

### 4. 购买积分页面 (`app/buy-credits/page.tsx`)

**功能特色**:
- PayPal集成支付
- 多种积分套餐
- 安全支付流程

### 5. 管理后台

- **统计面板** (`app/api/admin/stats/route.ts`): 系统使用统计
- **用户管理** (`app/api/admin/users/route.ts`): 用户信息管理

## 🔧 核心功能实现

### AI 聊天系统

#### 双提供商降级机制

```typescript
// chat.service.ts 中的提供商降级逻辑
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
    // 失败时继续尝试下一个提供商
    continue;
  }
}
```

#### 智能缓存系统

- **提示缓存**: 24小时TTL，减少重复API调用
- **积分缓存**: 用户积分状态缓存，提高查询性能

### 积分系统

#### 原子操作防止竞态条件

```typescript
// credits.repository.ts 中的原子扣费
const result = await CreditModel.findOneAndUpdate(
  {
    userEmail,
    credits: { $gte: amount }, // 条件检查
  },
  {
    $inc: { credits: -amount }, // 原子递减
  },
  {
    new: true, // 返回更新后的文档
    upsert: false,
  }
);
```

### 图像生成系统

#### Flux Schnell 模型集成

```typescript
// image.service.ts 中的图像生成
const output: any = await replicate.run("black-forest-labs/flux-schnell", {
  input: {
    prompt: imagePrompt,
    output_format: "png",
    output_quality: 80,
    aspect_ratio: "16:9",
  },
});
```

### 安全与权限

#### RBAC 权限控制

- **用户角色**: `USER`, `SUBSCRIBER`, `ADMIN`
- **路由保护**: 中间件级别的权限验证
- **API访问控制**: 基于角色的API端点限制

#### 速率限制

```typescript
// rate-limit.ts 中的速率限制
const { success } = await ratelimit.limit(userId);
if (!success) {
  throw new Error("Rate limit exceeded");
}
```

## 🗃️ 数据库设计

### Credit 模型
```typescript
{
  userEmail: string (indexed)
  credits: number
  amount: number
  timestamps: { createdAt, updatedAt }
}
```

### User 模型
```typescript
{
  userEmail: string (unique, indexed)
  clerkUserId: string (unique, indexed)
  role: "user" | "subscriber" | "admin"
  metadata: Map<string, any>
  timestamps: { createdAt, updatedAt }
}
```

### Image 模型
```typescript
{
  userEmail: string (indexed)
  userName: string
  url: string
  name: string
  timestamps: { createdAt, updatedAt }
}
```

## 🔒 安全特性

### 输入验证
- **Zod Schema**: 严格的类型安全验证
- **SQL注入防护**: 参数化查询和输入清理
- **XSS防护**: React自动转义和内容安全策略

### 身份验证与授权
- **Clerk集成**: 行业标准的认证解决方案
- **会话管理**: 安全的会话处理
- **令牌验证**: 自动JWT令牌验证

### 网络安全
- **HTTPS强制**: 生产环境HTTPS
- **CORS配置**: 适当的跨域资源共享
- **CSP头**: 内容安全策略

## 📊 性能优化

### 缓存策略

1. **Redis缓存**: 减少数据库查询
2. **提示缓存**: 避免重复AI调用
3. **连接池**: MongoDB连接复用

### 超时控制

- **AI调用**: 30秒超时
- **图像生成**: 2分钟超时
- **数据库**: 5秒超时
- **外部API**: 10秒超时

### 资源优化

- **图像压缩**: Cloudinary自动优化
- **懒加载**: 图像和组件的按需加载
- **代码分割**: Next.js自动代码分割

## 🚀 部署指南

### 环境要求

- Node.js 18+
- MongoDB 8+
- Redis (Upstash)
- Cloudinary 账户
- Clerk 账户
- PayPal 开发者账户

### 环境变量配置

```bash
# 数据库
MONGODB_URI=mongodb://localhost:27017/ai_image_chat

# Clerk 认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AI 服务
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
REPLICATE_API_TOKEN=your_replicate_token

# 存储服务
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloud_api_key
CLOUDINARY_API_SECRET=your_cloud_secret

# 缓存服务
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

### 部署步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ai_img_chat
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 文件
   ```

4. **构建项目**
   ```bash
   npm run build
   ```

5. **启动服务**
   ```bash
   npm start
   ```

## 🧪 测试

### 开发模拟开关

项目现在支持三个开发模拟开关，用于测试和基准测试：

- `SIMULATE_GEMINI_FAILURE=true` - 模拟Gemini AI失败，触发降级到OpenAI
- `DISABLE_CHAT_CREDITS=true` - 禁用积分扣费系统
- `DISABLE_CHAT_CACHE=true` - 禁用缓存功能

**使用方法：**
```bash
# 模拟降级机制测试
SIMULATE_GEMINI_FAILURE=true npm run dev

# 禁用积分系统测试
DISABLE_CHAT_CREDITS=true npm run dev

# 禁用缓存进行基准测试
DISABLE_CHAT_CACHE=true npm run dev

# 运行开关测试脚本
node test-dev-switches.js
```

这些开关用于：
- **验证降级机制**：确保OpenAI能在Gemini失败时正常工作
- **性能对比测试**：比较缓存开启/关闭时的性能差异
- **基准测试**：创建可靠的性能基准数据

### 运行测试

```bash
# 单元测试
npm test

# 测试覆盖率
npm run test:coverage

# 监听模式测试
npm run test:watch
```

### 测试覆盖

- **聊天服务**: AI提供商切换、缓存机制
- **积分系统**: 原子操作、余额验证
- **图像服务**: 生成流程、上传验证
- **中间件**: 认证、速率限制

## 📈 监控与分析

### 日志系统

- **结构化日志**: 一致的日志格式
- **请求追踪**: requestId贯穿整个请求链
- **上下文信息**: 丰富的错误和调试信息

### 分析功能

- **AI使用追踪**: 跟踪AI操作的使用情况
- **积分购买追踪**: 监控购买行为
- **成本追踪**: 估算AI操作成本

## 🔄 CI/CD 流程

### GitHub Actions 配置

- **自动化测试**: 每次推送运行测试套件
- **类型检查**: TypeScript类型验证
- **代码质量**: ESLint代码规范检查
- **构建验证**: 确保生产构建成功

## 📚 项目结构详解

### 🗂️ 完整项目结构图

```
ai_img_chat/
├── 📁 app/                          # Next.js App Router (页面路由)
│   ├── 📁 api/                      # API 路由处理
│   │   ├── 📁 admin/                # 管理后台 API
│   │   │   ├── 📁 stats/            # 统计数据 API
│   │   │   │   └── route.ts         # 统计数据路由
│   │   │   └── 📁 users/            # 用户管理 API
│   │   │       └── route.ts         # 用户管理路由
│   │   ├── 📁 chat/                 # 聊天 API
│   │   │   └── route.ts             # 聊天消息处理路由
│   │   └── 📄 loading.tsx           # API 加载状态组件
│   ├── 📁 buy-credits/              # 积分购买页面
│   │   └── page.tsx                 # 积分购买页面组件
│   ├── 📁 chat/                     # AI 聊天页面
│   │   └── page.tsx                 # 聊天界面页面组件
│   ├── 📁 dashboard/                # 用户仪表板
│   │   ├── 📁 image/                # 图像详情页
│   │   │   └── 📁 [_id]/            # 动态路由
│   │   │       └── page.tsx         # 单个图像详情页面
│   │   └── page.tsx                 # 仪表板主页
│   ├── 📁 image/                    # 图像相关页面 (备用)
│   │   └── 📁 [_id]/
│   │       └── page.tsx
│   ├── 📄 layout.tsx                # 根布局组件
│   ├── 📄 loading.tsx               # 全局加载状态
│   ├── 📄 page.tsx                  # 首页组件
│   └── 📄 globals.css               # 全局样式
├── 📁 components/                   # React 组件库
│   ├── 📁 cards/                    # 卡片组件
│   │   └── image-card.tsx           # 图像卡片组件
│   ├── 📁 display/                  # 展示组件
│   │   └── hero-image-slider.tsx    # 英雄图像轮播组件
│   ├── 📁 forms/                    # 表单组件
│   │   └── generate-image-input.tsx # 图像生成输入表单
│   ├── 📁 image/                    # 图像相关组件
│   │   └── image-edit-buttons.tsx   # 图像编辑按钮
│   ├── 📁 nav/                      # 导航组件
│   │   ├── credits.tsx              # 积分显示组件
│   │   ├── mode-toggle.tsx          # 主题切换组件
│   │   ├── pagination.tsx           # 分页组件
│   │   └── top-nav.tsx              # 顶部导航栏
│   └── 📁 ui/                       # UI 基础组件
│       ├── button.tsx               # 按钮组件
│       ├── card.tsx                 # 卡片容器组件
│       ├── input.tsx                # 输入框组件
│       └── loader.tsx               # 加载器组件
├── 📁 context/                      # React Context 状态管理
│   ├── image.tsx                    # 图像状态管理
│   ├── paypal.tsx                   # PayPal 支付状态
│   └── theme.tsx                    # 主题状态管理
├── 📁 docs/                         # 项目文档
│   ├── API.md                       # API 接口文档
│   ├── ARCHITECTURE.md              # 系统架构文档
│   ├── DEPLOYMENT.md                # 部署指南
│   ├── FEATURES.md                  # 功能特性文档
│   └── UPGRADE_SUMMARY.md           # 升级总结
├── 📁 src/                          # 核心业务逻辑 (服务端)
│   ├── 📁 controllers/              # 控制器层 (处理请求)
│   │   ├── 📁 chat/                 # 聊天控制器
│   │   │   └── chat.controller.ts   # 聊天请求处理
│   │   ├── 📁 credits/              # 积分控制器
│   │   │   ├── add-credits.controller.ts  # 添加积分
│   │   │   └── get-credits.controller.ts  # 获取积分
│   │   └── 📁 image/                # 图像控制器
│   │       └── generate.controller.ts     # 图像生成控制器
│   ├── 📁 lib/                      # 工具库
│   │   ├── analytics.ts             # 分析工具
│   │   ├── cache.ts                 # Redis 缓存工具
│   │   ├── errors.ts                # 错误处理类
│   │   ├── feature-flags.ts         # 功能开关
│   │   ├── http.ts                  # HTTP 工具函数
│   │   ├── logger.ts                # 日志系统
│   │   ├── timeout.ts               # 超时控制工具
│   │   └── utils.ts                 # 通用工具函数
│   ├── 📁 middlewares/              # 中间件
│   │   ├── rate-limit.ts            # 速率限制中间件
│   │   ├── rbac.ts                  # 角色访问控制
│   │   └── validate.ts              # 请求验证中间件
│   ├── 📁 models/                   # 数据模型 (Mongoose)
│   │   ├── credit.model.ts          # 积分数据模型
│   │   ├── image.model.ts           # 图像数据模型
│   │   └── user.model.ts            # 用户数据模型
│   ├── 📁 providers/                # 外部服务提供商
│   │   ├── 📁 ai/                   # AI 服务提供商
│   │   │   ├── ai.factory.ts        # AI 提供商工厂
│   │   │   ├── ai.interface.ts      # AI 接口定义
│   │   │   ├── gemini.provider.ts   # Gemini AI 提供商
│   │   │   └── openai.provider.ts   # OpenAI 提供商
│   │   └── db.provider.ts           # 数据库连接提供商
│   ├── 📁 repositories/             # 数据访问层
│   │   ├── credits.repository.ts    # 积分数据访问
│   │   ├── image.repository.ts      # 图像数据访问
│   │   └── user.repository.ts       # 用户数据访问
│   ├── 📁 schemas/                  # 数据验证模式
│   │   ├── chat.schema.ts           # 聊天请求验证
│   │   ├── image.schema.ts          # 图像请求验证
│   │   └── payment.schema.ts        # 支付请求验证
│   ├── 📁 services/                 # 业务逻辑层
│   │   ├── chat.service.ts          # 聊天业务逻辑 ⭐
│   │   ├── cost-tracking.service.ts # 成本跟踪服务
│   │   ├── image.service.ts         # 图像生成服务
│   │   └── payment.service.ts       # 支付服务
│   └── 📁 types/                    # TypeScript 类型定义
│       └── image.ts                 # 图像相关类型
├── 📁 public/                       # 静态资源文件
│   ├── images/                      # 示例图片
│   │   ├── city.jpg
│   │   ├── desert.jpg
│   │   ├── mountain.jpg
│   │   └── space.jpg
│   └── logos/                       # 品牌资源
│       └── logo.svg
├── 📁 utils/                        # 构建工具配置
├── 📄 package.json                  # 项目依赖配置
├── 📄 tsconfig.json                 # TypeScript 配置
├── 📄 next.config.ts                # Next.js 配置
├── 📄 tailwind.config.ts            # Tailwind CSS 配置
├── 📄 jest.config.js                # Jest 测试配置
└── 📄 README.md                     # 项目说明文档
```

### 📖 详细文件讲解

#### 🎯 1. App 目录结构详解 (Next.js 15 App Router)

**核心概念**: App Router 是 Next.js 15 的新路由系统，使用文件系统路由，每个文件夹代表一个路由段。

##### 📄 `app/layout.tsx` - 根布局组件
```typescript
// 全局布局，包含所有页面的共同结构
import TopNav from "@/components/nav/top-nav";
import { ClerkProvider } from "@clerk/nextjs";
import { ImageProvider, ThemeProvider, PaypalProvider } from "@/context/*";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>           {/* 用户认证上下文 */}
      <html lang="en">
        <body>
          <ThemeProvider>      {/* 主题上下文 */}
            <ImageProvider>    {/* 图像状态上下文 */}
              <PaypalProvider> {/* 支付上下文 */}
                <TopNav />     {/* 全局导航栏 */}
                {children}      {/* 页面内容 */}
              </PaypalProvider>
            </ImageProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

##### 📄 `app/page.tsx` - 首页组件
```typescript
// 营销页面 + 图像生成功能
import { GenerateImageInput } from "@/components/forms/generate-image-input";
import { HeroImageSlider } from "@/components/display/hero-image-slider";

export default function Home() {
  return (
    <div className="grid max-w-4xl">
      {/* 渐变标题 */}
      <h1 className="text-7xl lg:text-9xl font-bold mb-2">
        <span className="bg-gradient-to-l from-blue-500 via-purple-500 to-red-500
                         text-transparent bg-clip-text animate-pulse">
          AI
        </span>
        <br />
        Image Generator
      </h1>

      <GenerateImageInput />  {/* 图像生成表单 */}
      <HeroImageSlider />     {/* 示例图像轮播 */}
    </div>
  );
}
```

##### 📄 `app/chat/page.tsx` - 聊天页面
```typescript
// 客户端聊天界面
"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{sender, text}>>();
  const [input, setInput] = useState("");

  // 发送消息到 API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 调用 /api/chat 端点
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, provider: "gemini" }),
    });

    const data = await res.json();
    // 处理响应...
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* 聊天消息列表 */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      {/* 输入表单 */}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

##### 📄 `app/dashboard/page.tsx` - 用户仪表板
```typescript
// 服务端组件，获取用户图像
import { getUserImagesFromDb } from "@/src/services/image.service";
import ImageCard from "@/components/cards/image-card";
import Pagination from "@/components/nav/pagination";

interface DashboardProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  const { page } = await searchParams;
  const pageNum = Number(page) || 1;

  // 获取用户图像（分页）
  const { images, totalCount } = await getUserImagesFromDb(pageNum, 6);

  return (
    <div>
      <h1 className="text-2xl font-bold">Images</h1>

      {/* 响应式网格布局 */}
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

##### 📁 API 路由详解

###### 📄 `app/api/chat/route.ts` - 聊天 API 端点
```typescript
import { auth } from "@clerk/nextjs/server";
import { handleChatController } from "@/src/controllers/chat/chat.controller";
import { checkRateLimit } from "@/src/middlewares/rate-limit";

export async function POST(req: Request) {
  // 1. 用户认证
  const { userId } = await auth();
  if (!userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // 2. 速率限制
  await checkRateLimit(userId);

  // 3. 请求处理
  const body = await req.json();
  const response = await handleChatController(body, { userId, requestId });

  return Response.json(response, { status: response.success ? 200 : 400 });
}
```

#### 🎯 2. Src 目录结构详解 (核心业务逻辑)

##### 📁 Controllers 层 - 请求处理

###### 📄 `src/controllers/chat/chat.controller.ts`
```typescript
import { ChatSchema } from "@/src/schemas/chat.schema";
import { sendChatMessage } from "@/src/services/chat.service";

export async function handleChatController(input: unknown, context: ChatContext) {
  // 1. 输入验证
  const parsed = ChatSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0].message);
  }

  // 2. 调用服务层
  const { message, provider } = parsed.data;
  const result = await sendChatMessage(message, provider, context.userId, context.requestId);

  // 3. 返回响应
  return success({
    reply: result.reply,
    remainingCredits: result.remainingCredits,
    cached: result.cached,
  });
}
```

##### 📁 Services 层 - 业务逻辑

###### 📄 `src/services/chat.service.ts` ⭐ **核心服务**
```typescript
// AI 聊天服务 - 包含降级、缓存、指标收集
export async function sendChatMessage(message, provider, userId, requestId) {
  // 1. 环境变量控制开关
  const ENABLE_CHAT_CREDITS = !process.env.DISABLE_CHAT_CREDITS;
  const SIMULATE_GEMINI_FAILURE = process.env.SIMULATE_GEMINI_FAILURE === "true";

  // 2. 性能计时开始
  const t0 = nowMs();

  try {
    // 数据库连接
    await db();

    // 用户认证
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    // 缓存检查
    const cachedReply = DISABLE_CHAT_CACHE ? null : await getCachedReply(message);

    if (cachedReply) {
      // 缓存命中，直接返回
      return { reply: cachedReply, remainingCredits: null, cached: true };
    }

    // 积分扣费（如果启用）
    if (ENABLE_CHAT_CREDITS) {
      await creditRepository.deductCreditsAtomic(userEmail, 1, requestId);
    }

    // AI 调用（带降级机制）
    const fallbackResult = await chatWithFallback(message, provider, requestId);

    // 缓存写入
    if (!DISABLE_CHAT_CACHE) {
      await cacheReply(message, fallbackResult.reply);
    }

    return {
      reply: fallbackResult.reply,
      remainingCredits: null,
      cached: false
    };

  } finally {
    // 指标记录
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

// 降级机制实现
async function chatWithFallback(message, primaryProvider, requestId) {
  const providers = primaryProvider === "gemini"
    ? ["gemini", "openai"]
    : ["openai", "gemini"];

  for (const provider of providers) {
    try {
      // 模拟失败开关
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
      // 尝试下一个提供商
      continue;
    }
  }
}
```

###### 📄 `src/services/image.service.ts` - 图像生成服务
```typescript
export async function generateImageAi(imagePrompt, requestId) {
  // 1. 积分扣费
  const deductionResult = await creditRepository.deductCreditsAtomic(userEmail, 1);

  if (!deductionResult.success) {
    return { success: false, _id: null, credits: deductionResult.remainingCredits };
  }

  // 2. 调用 Replicate AI 生成图像
  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt: imagePrompt,
      output_format: "png",
      output_quality: 80,
      aspect_ratio: "16:9",
    },
  });

  // 3. 下载图像
  const response = await fetch(output[0]);
  const buffer = await response.arrayBuffer();

  // 4. 上传到 Cloudinary
  const uploadResult = await cloudinary.uploader.upload(
    `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`,
    { folder: "ai-generated" }
  );

  // 5. 保存到数据库
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

##### 📁 Repositories 层 - 数据访问

###### 📄 `src/repositories/credits.repository.ts`
```typescript
export class CreditRepository {
  // 原子积分扣费 - 防止竞态条件
  async deductCreditsAtomic(userEmail: string, amount: number, requestId?: string) {
    const result = await CreditModel.findOneAndUpdate(
      {
        userEmail,
        credits: { $gte: amount }, // 条件检查：确保有足够积分
      },
      {
        $inc: { credits: -amount }, // 原子递减
      },
      {
        new: true, // 返回更新后的文档
        upsert: false,
      }
    );

    if (!result) {
      return { success: false, remainingCredits: 0 };
    }

    return { success: true, remainingCredits: result.credits };
  }

  // 获取用户积分
  async getUserCredits(userEmail: string) {
    const creditDoc = await CreditModel.findOne({ userEmail });
    return creditDoc?.credits || 0;
  }

  // 添加积分
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

##### 📁 Providers 层 - 外部服务集成

###### 📄 `src/providers/ai/ai.factory.ts` - AI 提供商工厂
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

###### 📄 `src/providers/ai/gemini.provider.ts` - Gemini AI 集成
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

##### 📁 Models 层 - 数据模型

###### 📄 `src/models/credit.model.ts` - 积分数据模型
```typescript
import mongoose from "mongoose";

const CreditSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
    index: true, // 数据库索引，加速查询
  },
  credits: {
    type: Number,
    required: true,
    default: 10, // 新用户默认10积分
  },
  amount: {
    type: Number,
    required: true,
    default: 10,
  },
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
});

export default mongoose.models.Credit || mongoose.model("Credit", CreditSchema);
```

###### 📄 `src/models/image.model.ts` - 图像数据模型
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
  // Cloudinary 相关字段
  publicId: String,
  width: Number,
  height: Number,
}, {
  timestamps: true,
});

export default mongoose.models.Image || mongoose.model("Image", ImageSchema);
```

##### 📁 Schemas 层 - 请求验证

###### 📄 `src/schemas/chat.schema.ts` - 聊天请求验证
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
}).strict(); // 不允许额外字段

export type ChatRequest = z.infer<typeof ChatSchema>;
```

##### 📁 Middlewares 层 - 请求中间件

###### 📄 `src/middlewares/rate-limit.ts` - 速率限制
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"), // 每分钟20次请求
});

export async function checkRateLimit(userId: string) {
  const { success } = await ratelimit.limit(userId);

  if (!success) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
}
```

###### 📄 `src/middlewares/rbac.ts` - 角色访问控制
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

##### 📁 Lib 层 - 工具库

###### 📄 `src/lib/cache.ts` - Redis 缓存工具
```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const cache = {
  // 提示缓存键生成
  promptKey: (message: string) => `prompt:${Buffer.from(message).toString('base64').slice(0, 50)}`,

  // 获取缓存
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

  // 设置缓存（带TTL）
  async set(key: string, value: any, options: { ttl?: number, requestId?: string } = {}) {
    try {
      const { ttl = 86400, requestId } = options; // 默认24小时
      await redis.setex(key, ttl, JSON.stringify(value));
      logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`, { requestId });
    } catch (err) {
      logger.warn(`Cache set error for key: ${key}`, { err, requestId });
    }
  },
};
```

###### 📄 `src/lib/errors.ts` - 自定义错误类
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

#### 🎨 3. Components 目录详解 (UI 组件)

##### 📄 `components/nav/top-nav.tsx` - 顶部导航栏
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
        <Credits />          {/* 积分显示 */}
        <ModeToggle />       {/* 主题切换 */}
        <UserButton />       {/* 用户菜单 */}
      </div>
    </nav>
  );
}
```

##### 📄 `components/forms/generate-image-input.tsx` - 图像生成表单
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
        // 重定向到仪表板查看新生成的图像
        router.push("/dashboard");
      } else {
        alert(`生成失败: ${result.credits ? '积分不足' : '未知错误'}`);
      }
    } catch (err) {
      alert("生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="描述您想要生成的图像..."
        className="flex-1"
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !prompt.trim()}>
        {loading ? "生成中..." : "生成图像"}
      </Button>
    </form>
  );
}
```

##### 📄 `components/cards/image-card.tsx` - 图像卡片
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

#### 🎭 4. Context 目录详解 (状态管理)

##### 📄 `context/image.tsx` - 图像状态管理
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

##### 📄 `context/theme.tsx` - 主题状态管理
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
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 🔧 配置文件的详细说明

#### 📄 `package.json` - 项目依赖配置
```json
{
  "name": "ai_img_chat",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",                    // 开发服务器
    "build": "next build",               // 生产构建
    "start": "next start",               // 生产服务器
    "test": "jest",                      // 运行测试
    "lint": "next lint",                 // ESLint 检查
    "type-check": "tsc --noEmit"         // TypeScript 类型检查
  },
  "dependencies": {
    // Next.js 生态
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",

    // 认证
    "@clerk/nextjs": "^6.33.0",

    // AI 服务
    "@google/generative-ai": "^0.24.1",
    "openai": "^6.7.0",
    "replicate": "^1.2.0",

    // 数据库
    "mongoose": "^8.19.1",

    // 缓存
    "@upstash/redis": "^1.35.7",
    "@upstash/ratelimit": "^2.0.7",

    // UI 组件
    "@radix-ui/react-slot": "^1.2.3",
    "lucide-react": "^0.544.0",

    // 工具库
    "zod": "^4.1.13",
    "dayjs": "^1.11.18",
    "nanoid": "^5.1.6"
  },
  "devDependencies": {
    // 测试
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "jest": "^29.7.0",

    // TypeScript
    "@types/node": "24.7.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",

    // 样式
    "tailwindcss": "^4",
    "postcss": "^8"
  }
}
```

#### 📄 `next.config.ts` - Next.js 配置
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'], // 服务端组件外部包
  },
  images: {
    domains: ['res.cloudinary.com'], // 允许的图像域名
  },
  env: {
    // 客户端环境变量前缀
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
};

export default nextConfig;
```

#### 📄 `jest.setup.js` - 测试环境配置
```javascript
// 环境变量设置
process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token";
process.env.DATABASE_URL = "mongodb://localhost:27017/test";
process.env.MONGODB_URI = "mongodb://localhost:27017/test"; // 支持 both

// 开发开关设置（测试环境）
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

### 🎯 核心功能实现流程图

```
用户请求 → Clerk认证 → 速率限制 → API路由 → 控制器验证 → 服务层业务逻辑 → 仓库数据访问 → 提供商外部调用
     ↓           ↓           ↓          ↓          ↓              ↓                  ↓              ↓
  响应返回 ← 指标记录 ← 错误处理 ← 格式化响应 ← 输入验证 ← 缓存/积分/AI调用 ← 数据库操作 ← AI提供商响应
```

### 💡 学习建议

1. **从外到内学习**: 先了解页面结构，然后深入API，再学习服务层
2. **关注数据流**: 理解请求如何从前端流到数据库再返回
3. **掌握模式**: 学习分层架构、依赖注入、错误处理等设计模式
4. **实践测试**: 使用提供的开发开关来测试不同场景
5. **性能监控**: 查看指标日志，理解系统性能特征

## 🤝 贡献指南

### 开发环境设置

1. 安装依赖: `npm install`
2. 配置环境变量: 复制 `.env.example` 到 `.env.local`
3. 启动开发服务器: `npm run dev`

### 代码规范

- **TypeScript**: 严格的类型检查
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **命名约定**: PascalCase (组件), camelCase (函数)

### 提交规范

- 使用语义化的提交信息
- 英文提交信息，清晰描述变更
- 关联相关 issue

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- **Next.js**: React 全栈框架
- **Clerk**: 用户认证服务
- **MongoDB**: NoSQL 数据库
- **Redis**: 内存数据结构存储
- **Google AI**: Gemini AI 服务
- **OpenAI**: GPT 模型服务
- **Replicate**: AI 模型托管平台
- **Cloudinary**: 图像存储和处理

---

**项目状态**: ✅ 生产就绪

**最后更新**: 2025年1月

**维护者**: AI Image Chat Team