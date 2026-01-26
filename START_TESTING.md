# 🚀 开始测试 - 3步快速指南

## 第一步：检查环境配置

### 1.1 检查是否有 `.env.local` 文件

在项目根目录查看是否有 `.env.local` 文件。如果没有，需要创建并配置。

### 1.2 必需的环境变量

确保 `.env.local` 包含以下变量（至少前3个是必需的）：

```env
# 必需
MONGODB_URI=your_mongodb_connection_string
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# AI服务（至少一个）
GEMINI_API_KEY=your_gemini_key
# 或
OPENAI_API_KEY=your_openai_key

# 认证（必需）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

---

## 第二步：启动应用并启用Metrics

### 2.1 打开终端，进入项目目录

```bash
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
```

### 2.2 启动开发服务器（启用Metrics）

**Windows PowerShell:**
```powershell
$env:METRICS_ENABLED="true"; npm run dev
```

**或者使用重定向保存日志:**
```powershell
$env:METRICS_ENABLED="true"; npm run dev *> metrics.log
```

**Windows CMD:**
```cmd
set METRICS_ENABLED=true && npm run dev
```

**或者使用重定向保存日志:**
```cmd
set METRICS_ENABLED=true && npm run dev > metrics.log 2>&1
```

**Git Bash / Linux / Mac:**
```bash
METRICS_ENABLED=true npm run dev 2>&1 | tee metrics.log
```

### 2.3 等待服务器启动

看到类似这样的输出表示启动成功：
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
```

---

## 第三步：发送测试请求并收集数据

### 3.1 打开浏览器

访问: **http://localhost:3000**

### 3.2 登录应用

使用Clerk认证登录（如果没有账号，先注册）

### 3.3 发送测试消息

在聊天界面发送以下消息（建议发送20-30条）：

**测试消息列表**（可以复制粘贴）:
```
What is React?
Explain TypeScript
What is Next.js?
How does caching work?
What is MongoDB?
What is Redis?
Explain async programming
What are React hooks?
What is TypeScript?
How does Next.js work?
What is caching?
Explain MongoDB
What is Redis?
How does async work?
What are hooks?
```

**测试策略**:
1. **前10条**: 发送不同的消息（测试未缓存性能）
2. **后10条**: 重复发送前5条消息（测试缓存性能）

### 3.4 停止服务器

发送完测试消息后，在运行 `npm run dev` 的终端按 **Ctrl+C** 停止服务器

---

## 第四步：解析Metrics数据

### 4.1 打开新的终端窗口

保持项目目录不变

### 4.2 运行解析脚本

**如果使用了重定向保存日志:**
```bash
node scripts/parse-metrics-from-logs.js metrics.log
```

**如果没有保存日志文件，需要手动:**
1. 从运行服务器的终端复制所有包含 `[metric] chat.request` 的日志
2. 保存到 `metrics.log` 文件
3. 运行解析脚本

### 4.3 查看结果

解析完成后，查看 `real-performance-metrics.json` 文件：

```bash
# Windows PowerShell
Get-Content real-performance-metrics.json

# Windows CMD
type real-performance-metrics.json

# Git Bash / Linux / Mac
cat real-performance-metrics.json
```

---

## 📊 结果示例

你会看到类似这样的结果：

```json
{
  "timestamp": "2025-12-24T23:00:00.000Z",
  "note": "Real metrics from actual application logs",
  "sampleSize": 25,
  "metrics": {
    "cacheHitRate": 48.0,
    "fallbackRate": 2.0,
    "errorRate": 0.0,
    "p95Latency": 2150,
    "p95CachedLatency": 95,
    "p95UncachedLatency": 2450,
    "avgLatency": 1200,
    "minLatency": 45,
    "maxLatency": 3200
  }
}
```

---

## ✅ 快速检查清单

- [ ] `.env.local` 文件已配置
- [ ] 应用已启动（METRICS_ENABLED=true）
- [ ] 浏览器已打开 http://localhost:3000
- [ ] 已登录应用
- [ ] 已发送20-30个测试消息
- [ ] 服务器已停止
- [ ] 日志已保存
- [ ] Metrics已解析
- [ ] 结果已查看

---

## 🆘 遇到问题？

### 问题1: 看不到 [metric] 日志
**解决**: 确保 `METRICS_ENABLED=true` 已设置

### 问题2: 所有请求都是 uncached
**解决**: 正常！首次请求不会命中缓存。发送重复消息测试缓存。

### 问题3: 解析脚本报错
**解决**: 
- 检查日志文件是否存在
- 确保日志中包含 `[metric] chat.request`
- 检查日志格式是否正确

### 问题4: 环境变量未配置
**解决**: 
- 创建 `.env.local` 文件
- 参考 `README.md` 或 `docs/DEPLOYMENT.md` 配置环境变量

---

## 🎯 最小测试（5分钟）

如果时间有限，快速测试：

1. 启动: `METRICS_ENABLED=true npm run dev`
2. 发送: 10个消息（5个不同 + 5个重复）
3. 停止: Ctrl+C
4. 解析: `node scripts/parse-metrics-from-logs.js metrics.log`

---

## 📝 下一步

获取真实数据后：
1. 查看 `real-performance-metrics.json`
2. 用真实数据更新简历描述
3. 替换 `RESUME_DESCRIPTION.md` 中的估算值

---

**准备好了吗？开始第一步！** 🚀

