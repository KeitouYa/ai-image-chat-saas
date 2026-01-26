# 🧪 正在测试 - 当前步骤

## ✅ 已完成
- [x] METRICS_ENABLED=true 已设置
- [x] 服务器应该正在运行

## 📋 下一步操作

### 1. 确认服务器运行状态

在浏览器中访问: **http://localhost:3000**

如果能看到应用界面，说明服务器正常运行 ✅

### 2. 登录应用

使用 Clerk 认证登录（如果没有账号，先注册一个）

### 3. 发送测试消息

在聊天界面发送以下消息（建议发送 20-30 条）：

**快速测试消息列表**（复制粘贴使用）:

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
What is Redis?
```

**测试策略**:
- **前 10 条**: 发送不同的消息（测试未缓存性能）
- **后 10 条**: 重复发送前 5 条消息（测试缓存性能）

### 4. 观察终端日志

在运行 `npm run dev` 的终端中，你应该能看到类似这样的日志：

```
🟢 [INFO] 2025-12-24T23:00:00.000Z [req_abc123] [metric] chat.request {
  "requestId": "req_abc123",
  "status": "success",
  "cached": false,
  "fallbackUsed": false,
  "totalMs": 2345,
  ...
}
```

**重要**: 确保能看到 `[metric] chat.request` 这样的日志条目！

### 5. 收集日志

发送完所有测试消息后：

**方法A: 如果使用了重定向**
```bash
# 日志已经保存在 metrics.log 文件中
# 直接跳到步骤6
```

**方法B: 如果没有重定向**
1. 从运行服务器的终端复制所有包含 `[metric] chat.request` 的日志
2. 保存到项目根目录的 `metrics.log` 文件

### 6. 停止服务器

在运行 `npm run dev` 的终端按 **Ctrl+C** 停止服务器

### 7. 解析 Metrics

打开**新的终端窗口**，运行：

```bash
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
node scripts/parse-metrics-from-logs.js metrics.log
```

### 8. 查看结果

```powershell
Get-Content real-performance-metrics.json
```

---

## 🎯 当前状态检查

### ✅ 检查点 1: 服务器是否运行？
- 访问 http://localhost:3000
- 能看到应用界面吗？ → ✅ 是 / ❌ 否

### ✅ 检查点 2: Metrics 是否启用？
- 在终端日志中能看到 `[metric] chat.request` 吗？ → ✅ 是 / ❌ 否

### ✅ 检查点 3: 已发送测试消息？
- 已发送多少条消息？ → [填写数字]

---

## 💡 提示

1. **首次请求不会命中缓存** - 这是正常的，需要发送重复消息测试缓存
2. **至少发送 20 条消息** - 样本越大，数据越可靠
3. **观察日志** - 确保能看到 metrics 日志输出

---

## 🆘 如果遇到问题

### 问题: 看不到 [metric] 日志
**可能原因**:
- METRICS_ENABLED 未正确设置
- 日志级别设置问题

**解决**:
- 检查环境变量: `echo $env:METRICS_ENABLED` (PowerShell)
- 重启服务器

### 问题: 应用无法访问
**可能原因**:
- 服务器未启动
- 端口被占用

**解决**:
- 检查服务器是否在运行
- 查看终端是否有错误信息

---

## 📊 预期结果

测试完成后，你应该得到类似这样的数据：

```json
{
  "cacheHitRate": 45.0,
  "p95CachedLatency": 95,
  "p95UncachedLatency": 2400,
  "fallbackRate": 3.0,
  "errorRate": 2.0
}
```

---

**现在开始发送测试消息吧！** 🚀

发送完消息后告诉我，我帮你解析数据！

