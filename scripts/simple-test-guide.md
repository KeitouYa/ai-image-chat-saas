# 简单测试指南 - 获取真实Metrics

## 快速步骤

### 1. 启用Metrics并启动应用

```bash
# 在项目根目录
METRICS_ENABLED=true npm run dev
```

### 2. 发送测试请求

在浏览器中：
1. 打开 http://localhost:3000
2. 登录应用
3. 在聊天界面发送以下消息（建议发送20-30条）：
   - 重复发送几次相同消息（测试缓存）
   - 发送一些新消息（测试未缓存）

**测试消息建议**:
```
What is React?
Explain TypeScript
What is Next.js?
How does caching work?
What is MongoDB?
```

### 3. 收集日志

在运行 `npm run dev` 的终端中，你会看到类似这样的日志：

```
🟢 [INFO] 2025-12-24T23:00:00.000Z [req123] [metric] chat.request {
  "requestId": "req123",
  "status": "success",
  "cached": false,
  "fallbackUsed": false,
  "totalMs": 2345,
  ...
}
```

### 4. 保存日志

**方法A**: 复制日志到文件
- 从终端复制包含 `[metric] chat.request` 的所有日志
- 保存到 `metrics.log` 文件

**方法B**: 重定向输出
```bash
METRICS_ENABLED=true npm run dev 2>&1 | tee metrics.log
```

### 5. 解析Metrics

```bash
node scripts/parse-metrics-from-logs.js metrics.log
```

### 6. 查看结果

结果会保存在 `real-performance-metrics.json`，包含：
- Cache Hit Rate
- P95 Latency (Cached/Uncached)
- Fallback Rate
- Error Rate

---

## 自动化脚本（如果环境已配置）

如果你想自动化测试，可以运行：

```bash
node scripts/run-performance-test.js
```

这个脚本会：
1. 检查环境变量
2. 启动开发服务器
3. 指导你发送测试请求
4. 自动解析metrics

---

## 注意事项

1. **需要认证**: 发送请求前需要登录
2. **需要API密钥**: 确保 GEMINI_API_KEY 或 OPENAI_API_KEY 已配置
3. **需要数据库**: MongoDB 连接必须正常
4. **需要Redis**: Upstash Redis 必须配置

如果环境未完全配置，脚本会生成基于架构分析的模拟数据。

---

## 最小测试（快速验证）

如果只想快速验证系统是否工作：

1. 发送5个相同消息 → 检查缓存是否工作
2. 发送5个不同消息 → 检查未缓存性能
3. 解析日志 → 获取基础指标

这样可以在几分钟内获得基本的性能数据。

