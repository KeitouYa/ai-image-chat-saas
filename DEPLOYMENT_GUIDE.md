# 项目提交与部署指南

> 本指南说明如何将 AI_IMG_CHAT 项目提交到代码托管平台和部署到生产环境

---

## 📦 1. 代码托管平台

### 1.1 GitHub（推荐）

**GitHub** 是最流行的代码托管平台，适合开源项目和作品展示。

#### 提交步骤：

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 上创建新仓库（不要初始化 README）
   # 仓库名建议：ai-image-chat-saas 或 ai-img-chat
   ```

2. **初始化 Git（如果还没有）**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Image Chat SaaS Platform"
   ```

3. **添加远程仓库并推送**
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git branch -M main
   git push -u origin main
   ```

4. **添加 README 徽章（可选）**
   在 README.md 顶部添加：
   ```markdown
   [![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
   [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
   ```

#### GitHub 仓库设置建议：

- ✅ **公开仓库**：便于展示给潜在雇主
- ✅ **添加 Topics**：`nextjs`, `typescript`, `ai`, `saas`, `mongodb`, `redis`
- ✅ **添加 Description**：`AI Image Generation & Chat SaaS Platform built with Next.js 15, TypeScript, MongoDB, and multiple AI providers`
- ✅ **启用 GitHub Pages**：可以部署文档网站
- ✅ **添加 LICENSE**：MIT License 或 Apache 2.0

### 1.2 GitLab

**GitLab** 提供免费的私有仓库和 CI/CD 功能。

```bash
# 在 GitLab 上创建项目后
git remote add origin https://gitlab.com/你的用户名/仓库名.git
git push -u origin main
```

### 1.3 Bitbucket

**Bitbucket** 适合需要私有仓库的场景。

```bash
git remote add origin https://bitbucket.org/你的用户名/仓库名.git
git push -u origin main
```

---

## 🚀 2. 部署平台

### 2.1 Vercel（强烈推荐）

**Vercel** 是 Next.js 的官方推荐平台，提供最佳集成体验。

#### 优势：
- ✅ **零配置部署**：自动识别 Next.js 项目
- ✅ **免费套餐**：适合个人项目
- ✅ **自动 HTTPS**：SSL 证书自动配置
- ✅ **环境变量管理**：安全的密钥管理
- ✅ **预览部署**：每个 PR 自动生成预览链接
- ✅ **全球 CDN**：快速访问速度

#### 部署步骤：

1. **通过 GitHub 部署（推荐）**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - Vercel 会自动检测 Next.js 项目

2. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   # 数据库
   DATABASE_URL=mongodb+srv://...
   MONGODB_URI=mongodb+srv://...
   
   # Clerk 认证
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # AI 服务
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=sk-...
   REPLICATE_API_TOKEN=r8_...
   
   # 存储服务
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # 缓存服务
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=your_token
   
   # PayPal（可选）
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_secret
   
   # 可选配置
   METRICS_ENABLED=true
   LOG_LEVEL=info
   ```

3. **部署设置**
   - **Framework Preset**: Next.js（自动检测）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）
   - **Install Command**: `npm install`（默认）

4. **部署完成**
   - Vercel 会自动生成部署 URL：`https://your-project.vercel.app`
   - 可以绑定自定义域名

#### 免费套餐限制：
- 100GB 带宽/月
- 100 次构建/天
- 适合个人项目和小型应用

### 2.2 Netlify

**Netlify** 也是优秀的部署平台，支持 Next.js。

#### 部署步骤：

1. **通过 GitHub 部署**
   - 访问 [netlify.com](https://netlify.com)
   - 使用 GitHub 账号登录
   - 选择 "Add new site" → "Import an existing project"
   - 选择你的 GitHub 仓库

2. **构建配置**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **环境变量**
   在 Site settings → Environment variables 中添加所有环境变量

### 2.3 Railway

**Railway** 提供数据库和 Redis 托管，适合全栈应用。

#### 优势：
- ✅ **数据库托管**：可以直接创建 MongoDB 实例
- ✅ **Redis 托管**：内置 Redis 支持
- ✅ **简单部署**：GitHub 集成，自动部署
- ✅ **免费试用**：$5 免费额度

#### 部署步骤：

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 登录
3. 创建新项目 → "Deploy from GitHub repo"
4. 选择你的仓库
5. 添加 MongoDB 和 Redis 服务
6. 配置环境变量

### 2.4 Render

**Render** 提供免费套餐，适合个人项目。

#### 部署步骤：

1. 访问 [render.com](https://render.com)
2. 创建 "Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

### 2.5 其他平台

- **AWS Amplify**：AWS 的托管服务
- **Google Cloud Run**：容器化部署
- **DigitalOcean App Platform**：简单易用
- **Fly.io**：全球边缘部署

---

## 📝 3. 部署前检查清单

### 3.1 代码检查

- [ ] 确认 `.gitignore` 已正确配置（排除 `.env*` 文件）
- [ ] 确认没有硬编码的 API 密钥
- [ ] 确认 `README.md` 包含项目说明
- [ ] 确认 `package.json` 中的脚本正确

### 3.2 环境变量检查

确保以下环境变量都已配置（不要提交到代码库）：

```bash
# 必需的环境变量
DATABASE_URL          # MongoDB 连接字符串
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
GEMINI_API_KEY
OPENAI_API_KEY
REPLICATE_API_TOKEN
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# 可选的环境变量
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
METRICS_ENABLED
LOG_LEVEL
```

### 3.3 创建 `.env.example` 文件

创建一个示例环境变量文件（可以提交到代码库）：

```bash
# .env.example
DATABASE_URL=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_TOKEN=your_replicate_token
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 3.4 更新 README

确保 README.md 包含：
- ✅ 项目描述
- ✅ 技术栈
- ✅ 功能特性
- ✅ 安装步骤
- ✅ 环境变量说明
- ✅ 部署链接（部署后添加）

---

## 🎨 4. 项目展示平台

### 4.1 个人作品集网站

将项目添加到你的个人作品集网站：

- **展示内容**：
  - 项目截图
  - 技术栈标签
  - 功能特性列表
  - 部署链接
  - GitHub 仓库链接

- **推荐平台**：
  - **Vercel**：部署 Next.js 作品集网站
  - **Netlify**：静态网站托管
  - **GitHub Pages**：免费静态网站

### 4.2 LinkedIn

在 LinkedIn 上展示项目：

1. **添加到"项目"部分**
   - 项目名称
   - 描述（使用 `RESUME_DESCRIPTION.md` 中的内容）
   - 技术栈
   - GitHub 链接
   - 部署链接

2. **发布帖子**
   - 分享项目上线消息
   - 展示技术亮点
   - 添加截图或演示视频

### 4.3 技术博客

写一篇技术博客介绍项目：

- **推荐平台**：
  - **Medium**
  - **Dev.to**
  - **Hashnode**
  - **个人博客**（使用 Next.js 或 Gatsby）

- **博客主题建议**：
  - "如何构建一个 AI SaaS 应用"
  - "Next.js 15 + TypeScript 全栈开发实践"
  - "AI 服务降级机制实现"

### 4.4 技术社区

在技术社区分享项目：

- **Reddit**：r/webdev, r/nextjs, r/typescript
- **Hacker News**：Show HN
- **Twitter/X**：使用 #NextJS #TypeScript #AI 等标签
- **Indie Hackers**：创业项目分享

---

## 🔒 5. 安全注意事项

### 5.1 不要提交敏感信息

确保以下文件/内容不会被提交：

- ❌ `.env` 文件
- ❌ `.env.local` 文件
- ❌ API 密钥
- ❌ 数据库连接字符串
- ❌ 私钥文件

### 5.2 使用环境变量

所有敏感信息都应通过环境变量管理：

```typescript
// ✅ 正确做法
const apiKey = process.env.GEMINI_API_KEY;

// ❌ 错误做法
const apiKey = "AIzaSy...";  // 硬编码密钥
```

### 5.3 检查已提交的代码

如果意外提交了敏感信息：

1. **立即撤销提交**
   ```bash
   git reset HEAD~1  # 撤销最后一次提交
   ```

2. **更新 .gitignore**
   确保敏感文件被忽略

3. **如果已推送到远程**
   - 立即更换所有 API 密钥
   - 使用 `git filter-branch` 或 `BFG Repo-Cleaner` 清理历史

---

## 📊 6. 部署后优化

### 6.1 性能监控

- 使用 Vercel Analytics（如果使用 Vercel）
- 集成 Sentry 进行错误追踪
- 启用性能指标收集（`METRICS_ENABLED=true`）

### 6.2 SEO 优化

- 添加 `metadata` 到 Next.js 页面
- 配置 `robots.txt` 和 `sitemap.xml`
- 添加 Open Graph 和 Twitter Card 元数据

### 6.3 自定义域名

- 在 Vercel/Netlify 中配置自定义域名
- 配置 DNS 记录
- 启用 HTTPS（自动）

---

## 🎯 7. 推荐部署流程

### 完整流程：

1. **准备代码**
   ```bash
   # 确保代码已提交到本地
   git status
   git add .
   git commit -m "Ready for deployment"
   ```

2. **推送到 GitHub**
   ```bash
   git push origin main
   ```

3. **部署到 Vercel**
   - 登录 Vercel
   - 导入 GitHub 仓库
   - 配置环境变量
   - 部署

4. **测试部署**
   - 访问部署 URL
   - 测试所有功能
   - 检查控制台错误

5. **更新文档**
   - 在 README 中添加部署链接
   - 更新项目描述

6. **分享项目**
   - 添加到作品集
   - 在社交媒体分享
   - 在技术社区展示

---

## 📚 8. 有用的资源

### 文档链接：

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 部署指南](https://vercel.com/docs)
- [MongoDB Atlas 设置](https://www.mongodb.com/docs/atlas/getting-started/)
- [Upstash Redis 文档](https://docs.upstash.com/redis)

### 免费服务：

- **MongoDB Atlas**：免费 512MB 数据库
- **Upstash Redis**：免费 10K 命令/天
- **Cloudinary**：免费 25GB 存储
- **Clerk**：免费 10K MAU（月活用户）
- **Vercel**：免费 100GB 带宽/月

---

## ✅ 总结

**推荐方案：**

1. **代码托管**：GitHub（公开仓库，便于展示）
2. **部署平台**：Vercel（Next.js 最佳集成）
3. **数据库**：MongoDB Atlas（免费套餐）
4. **缓存**：Upstash Redis（免费套餐）
5. **展示**：个人作品集网站 + LinkedIn

**快速开始：**

```bash
# 1. 提交到 GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main

# 2. 在 Vercel 中导入 GitHub 仓库
# 3. 配置环境变量
# 4. 部署完成！
```

---

**祝部署顺利！🚀**


