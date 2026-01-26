# 🧪 运行真实性能测试 - 完整指南

## 当前状态

环境变量未配置，无法自动运行测试。请按照以下步骤手动运行测试。

---

## 📋 步骤 1: 配置环境变量

在项目根目录创建或检查 `.env.local` 文件，确保包含：

```env
# 必需的环境变量
MONGODB_URI=your_mongodb_connection_string
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# 可选
OPENAI_API_KEY=your_openai_key  # 用于fallback测试
METRICS_ENABLED=true  # 启用metrics收集
```

---

## 📋 步骤 2: 启动应用（启用Metrics）

在**终端1**中运行：

```bash
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
METRICS_ENABLED=true npm run dev
```

**重要**: 保持这个终端窗口打开，你会在这里看到metrics日志。

---

## 📋 步骤 3: 发送测试请求

### 方法A: 使用浏览器（推荐）

1. 打开浏览器，访问 http://localhost:3000
2. 登录应用（使用Clerk认证）
3. 在聊天界面发送以下消息（建议发送20-30条）：

**测试消息列表**（复制粘贴使用）:
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
```

**测试策略**:
- 前10条：发送不同的消息（测试未缓存性能）
- 后10条：重复发送前5条消息（测试缓存性能）

### 方法B: 使用Postman/curl（需要认证token）

如果你有认证token，可以使用：

```bash
# 替换 YOUR_TOKEN 为实际的认证token
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "What is React?", "provider": "gemini"}'
```

---

## 📋 步骤 4: 收集日志

在**终端1**（运行dev服务器的终端）中，你会看到类似这样的日志：

```
🟢 [INFO] 2025-12-24T23:00:00.000Z [req_abc123] [metric] chat.request {
  "requestId": "req_abc123",
  "userId": "user_xyz",
  "status": "success",
  "cached": false,
  "fallbackUsed": false,
  "totalMs": 2345,
  "dbMs": 45,
  "cacheReadMs": 12,
  "creditMs": 23,
  "aiMs": 2100,
  "cacheWriteMs": 34
}
```

### 保存日志的方法

**方法A: 重定向输出（推荐）**
在启动服务器时使用：
```bash
METRICS_ENABLED=true npm run dev 2>&1 | tee metrics.log
```

**方法B: 手动复制**
- 从终端复制所有包含 `[metric] chat.request` 的日志
- 保存到 `metrics.log` 文件

---

## 📋 步骤 5: 解析Metrics

在**终端2**（新终端）中运行：

```bash
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
node scripts/parse-metrics-from-logs.js metrics.log
```

或者如果日志在标准输入：
```bash
cat metrics.log | node scripts/parse-metrics-from-logs.js -
```

---

## 📋 步骤 6: 查看结果

解析完成后，查看 `real-performance-metrics.json` 文件：

```bash
cat real-performance-metrics.json
```

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

## 📋 步骤 7: 更新简历

用真实数据替换简历中的估算值：

### 当前（估算值）
```
Achieved 45% cache hit rate and <85ms p95 latency for cached responses; 
maintained <2.4s p95 latency for uncached AI calls with <3% fallback rate 
and <2% error rate
```

### 更新为真实数据
```
Achieved [真实值]% cache hit rate and <[真实值]ms p95 latency for cached responses; 
maintained <[真实值]s p95 latency for uncached AI calls with <[真实值]% fallback rate 
and <[真实值]% error rate
```

---

## 🎯 快速测试（最小样本）

如果时间有限，可以快速测试：

1. **发送10条消息**（5条不同 + 5条重复）
2. **收集日志**
3. **解析metrics**

虽然样本较小，但可以验证系统是否正常工作。

---

## ⚠️ 常见问题

### Q: 看不到 [metric] 日志？
A: 确保 `METRICS_ENABLED=true` 已设置

### Q: 所有请求都是 uncached？
A: 正常，首次请求不会命中缓存。发送重复消息测试缓存。

### Q: 解析脚本报错？
A: 检查日志格式，确保包含 `[metric] chat.request`

### Q: 环境变量在哪里配置？
A: 创建 `.env.local` 文件在项目根目录

---

## 📊 预期结果范围

基于架构，真实数据应该在以下范围内：

| 指标 | 预期范围 | 说明 |
|------|---------|------|
| Cache Hit Rate | 30-60% | 取决于消息重复度 |
| P95 Cached | 50-200ms | Redis缓存很快 |
| P95 Uncached | 1.5-4s | AI API调用时间 |
| Fallback Rate | 0-10% | 取决于provider稳定性 |
| Error Rate | 0-5% | 取决于网络和配置 |

---

## ✅ 完成检查清单

- [ ] 环境变量已配置
- [ ] 应用已启动（METRICS_ENABLED=true）
- [ ] 已发送20-30个测试请求
- [ ] 日志已保存到文件
- [ ] Metrics已解析
- [ ] 结果已查看
- [ ] 简历已更新（可选）

---

## 🚀 开始测试

准备好后，运行：

```bash
# 终端1: 启动服务器
METRICS_ENABLED=true npm run dev 2>&1 | tee metrics.log

# 终端2: 在浏览器中发送测试请求
# 然后解析日志
node scripts/parse-metrics-from-logs.js metrics.log
```

**祝测试顺利！** 🎉

