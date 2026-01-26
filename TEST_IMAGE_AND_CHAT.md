# 🧪 测试图片生成和聊天 - 完整指南

## 🎯 测试目标

测试两个主要功能：
1. **聊天功能** (Chat) - 测试缓存、降级、响应时间
2. **图片生成** (Image Generation) - 测试生成时间、成功率、各阶段耗时

---

## 📋 步骤 1: 启用 Metrics 并启动服务器

### Windows PowerShell:
```powershell
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
$env:METRICS_ENABLED="true"
npm run dev
```

### Windows CMD:
```cmd
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
set METRICS_ENABLED=true
npm run dev
```

### 使用重定向保存日志（推荐）:
```powershell
$env:METRICS_ENABLED="true"
npm run dev *> metrics.log
```

---

## 📋 步骤 2: 测试聊天功能

### 2.1 打开浏览器
访问: **http://localhost:3000/chat**

### 2.2 登录应用
使用 Clerk 认证登录

### 2.3 发送聊天测试消息

**测试消息列表**（发送 20-30 条）:

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
What is React?
Explain TypeScript
What is Next.js?
How does caching work?
What is MongoDB?
```

**测试策略**:
- **前 10 条**: 发送不同的消息（测试未缓存性能）
- **后 10 条**: 重复发送前 5 条消息（测试缓存性能）

---

## 📋 步骤 3: 测试图片生成功能 ⭐

### 3.1 打开图片生成页面
访问: **http://localhost:3000** 或 **http://localhost:3000/image**

### 3.2 生成测试图片

**测试提示词列表**（生成 10-15 张图片）:

```
A beautiful sunset over mountains
A futuristic cityscape at night
A serene forest with sunlight filtering through trees
A cute cat playing with yarn
A modern minimalist office space
A vibrant flower garden in spring
A peaceful beach at sunset
A cozy coffee shop interior
A majestic mountain range
A starry night sky over a lake
A vintage car on a country road
A modern kitchen design
A tropical island paradise
A snowy winter landscape
A colorful abstract art piece
```

**测试策略**:
- 生成不同类型的图片（风景、动物、建筑等）
- 观察每张图片的生成时间
- 注意是否有失败的情况

### 3.3 观察图片生成过程

在终端中，你应该能看到类似这样的日志：

```
🟢 [INFO] ... [metric] image.generation {
  "requestId": "req_xxx",
  "status": "success",
  "totalMs": 15000,
  "replicateMs": 12000,
  "downloadMs": 500,
  "uploadMs": 2000,
  ...
}
```

---

## 📋 步骤 4: 收集日志

### 方法 A: 如果使用了重定向
日志已经保存在 `metrics.log` 文件中 ✅

### 方法 B: 如果没有重定向
1. 从运行服务器的终端复制所有包含 `[metric]` 的日志
2. 保存到项目根目录的 `metrics.log` 文件

**重要**: 确保日志中包含：
- `[metric] chat.request` - 聊天 metrics
- `[metric] image.generation` - 图片生成 metrics

---

## 📋 步骤 5: 停止服务器

在运行 `npm run dev` 的终端按 **Ctrl+C** 停止服务器

---

## 📋 步骤 6: 解析所有 Metrics

运行新的解析脚本（支持聊天和图片生成）:

```bash
node scripts/parse-all-metrics.js metrics.log
```

这个脚本会：
- 解析聊天 metrics
- 解析图片生成 metrics
- 生成综合报告

---

## 📋 步骤 7: 查看结果

### 查看完整报告:
```powershell
Get-Content all-performance-metrics.json
```

### 报告包含:

**聊天指标**:
- Cache Hit Rate
- P95 Latency (Cached/Uncached)
- Fallback Rate
- Error Rate

**图片生成指标**:
- Success Rate
- P95 Total Latency
- P95 Replicate Latency (AI生成时间)
- P95 Download Latency (下载时间)
- P95 Upload Latency (上传到Cloudinary时间)
- Error Rate

---

## 📊 预期结果示例

```json
{
  "chat": {
    "cacheHitRate": 45.0,
    "p95CachedLatency": 95,
    "p95UncachedLatency": 2400,
    "fallbackRate": 3.0,
    "errorRate": 2.0
  },
  "image": {
    "successRate": 95.0,
    "p95Latency": 15000,
    "p95ReplicateLatency": 12000,
    "p95DownloadLatency": 500,
    "p95UploadLatency": 2000,
    "errorRate": 5.0
  }
}
```

---

## ✅ 测试检查清单

### 聊天测试
- [ ] 已发送 20-30 条聊天消息
- [ ] 包含重复消息（测试缓存）
- [ ] 终端中能看到 `[metric] chat.request` 日志

### 图片生成测试
- [ ] 已生成 10-15 张图片
- [ ] 使用了不同的提示词
- [ ] 终端中能看到 `[metric] image.generation` 日志

### 数据收集
- [ ] 日志已保存到 `metrics.log`
- [ ] 已运行解析脚本
- [ ] 已查看 `all-performance-metrics.json`

---

## 🎯 重点测试图片生成

### 图片生成的关键指标

1. **总生成时间** (totalMs)
   - 从请求到完成的全部时间
   - 预期: 10-30秒

2. **Replicate 生成时间** (replicateMs)
   - AI模型生成图片的时间
   - 预期: 8-20秒

3. **下载时间** (downloadMs)
   - 从Replicate下载图片的时间
   - 预期: 0.5-2秒

4. **上传时间** (uploadMs)
   - 上传到Cloudinary的时间
   - 预期: 1-5秒

5. **成功率** (successRate)
   - 成功生成的百分比
   - 预期: >90%

---

## 💡 测试提示

1. **图片生成较慢**: 每张图片需要 10-30 秒，请耐心等待
2. **观察各阶段**: 注意 Replicate、下载、上传各阶段的时间
3. **测试失败情况**: 如果遇到失败，也会记录在 metrics 中
4. **成本考虑**: 每张图片消耗 1 个积分，确保有足够的积分

---

## 🆘 常见问题

### Q: 看不到 [metric] image.generation 日志？
A: 确保 `METRICS_ENABLED=true` 已设置，并且代码已更新（添加了metrics收集）

### Q: 图片生成失败？
A: 检查：
- REPLICATE_API_TOKEN 是否配置
- CLOUDINARY 配置是否正确
- 是否有足够的积分

### Q: 解析脚本只显示聊天数据？
A: 确保日志中包含 `[metric] image.generation` 条目

---

## 📝 更新简历

获取真实数据后，可以在简历中添加：

**聊天功能**:
```
Achieved 45% cache hit rate and <85ms p95 latency for cached responses; 
maintained <2.4s p95 latency for uncached AI calls
```

**图片生成功能**:
```
Achieved 95% success rate with <15s p95 latency for image generation, 
including <12s AI generation time and <2s upload time
```

---

**现在开始测试吧！** 🚀

特别关注图片生成的性能指标！

