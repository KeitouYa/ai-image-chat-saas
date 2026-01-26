# 如何获取真实的性能 Metrics 数据

## ⚠️ 重要说明

**当前简历中使用的 metrics 数据（45% cache hit rate, <85ms p95 cached, <2.4s p95 uncached）是基于架构分析的估算值，不是真实测试数据。**

要获取真实数据，请按照以下步骤操作：

---

## 📋 步骤 1: 启用 Metrics 收集

在 `.env` 文件中添加或设置：

```bash
METRICS_ENABLED=true
```

或者运行时设置：

```bash
METRICS_ENABLED=true npm run dev
```

---

## 📋 步骤 2: 发送测试请求

### 方法 A: 使用浏览器/Postman

1. 启动应用：`METRICS_ENABLED=true npm run dev`
2. 登录应用
3. 在聊天界面发送多个消息（建议 20-50 个）
   - 发送一些重复的消息（会触发缓存）
   - 发送一些新的消息（不会命中缓存）

### 方法 B: 使用 curl 脚本

创建 `test-requests.sh`:

```bash
#!/bin/bash
BASE_URL="http://localhost:3000"
TOKEN="your-clerk-token-here"  # 需要从浏览器获取

# 发送多个请求
for i in {1..20}; do
  curl -X POST "$BASE_URL/api/chat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"message\": \"What is React?\", \"provider\": \"gemini\"}"
  sleep 1
done
```

---

## 📋 步骤 3: 收集日志

### 方法 A: 从控制台输出收集

运行应用时，日志会输出到控制台。查找包含 `[metric] chat.request` 的行，例如：

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

将包含这些 metrics 的日志保存到文件，例如 `metrics.log`

### 方法 B: 重定向日志到文件

```bash
METRICS_ENABLED=true npm run dev 2>&1 | tee metrics.log
```

---

## 📋 步骤 4: 解析 Metrics

使用提供的脚本解析日志：

```bash
node scripts/parse-metrics-from-logs.js metrics.log
```

或者直接从标准输入读取：

```bash
METRICS_ENABLED=true npm run dev 2>&1 | node scripts/parse-metrics-from-logs.js -
```

脚本会输出：
- Cache Hit Rate
- P95 Latency (Cached/Uncached)
- Fallback Rate
- Error Rate
- 其他统计信息

结果会保存到 `real-performance-metrics.json`

---

## 📋 步骤 5: 更新简历数据

解析完成后，用真实数据替换简历中的估算值：

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

## 🔍 Metrics 日志格式

当 `METRICS_ENABLED=true` 时，每个请求会输出如下格式的日志：

```json
{
  "[metric] chat.request": {
    "requestId": "req_abc123",
    "userId": "user_xyz",
    "status": "success",
    "errorName": null,
    "providerRequested": "gemini",
    "providerUsed": "gemini",
    "fallbackUsed": false,
    "cached": false,
    "messageLength": 50,
    "messageHash": "abc123...",
    "totalMs": 2345,
    "dbMs": 45,
    "cacheReadMs": 12,
    "creditMs": 23,
    "aiMs": 2100,
    "cacheWriteMs": 34
  }
}
```

关键字段：
- `cached`: true/false - 是否命中缓存
- `fallbackUsed`: true/false - 是否使用了降级
- `status`: "success"/"fail" - 请求状态
- `totalMs`: 数字 - 总响应时间（毫秒）

---

## 📊 示例：运行测试

```bash
# 1. 启用 metrics
export METRICS_ENABLED=true

# 2. 启动应用
npm run dev

# 3. 在另一个终端，发送测试请求
# (使用 Postman 或浏览器发送 20-50 个请求)

# 4. 停止应用，保存日志到文件
# (从控制台复制包含 [metric] 的日志)

# 5. 解析日志
node scripts/parse-metrics-from-logs.js metrics.log

# 6. 查看结果
cat real-performance-metrics.json
```

---

## ✅ 验证数据质量

获取真实数据后，检查：

1. **样本数量**: 建议至少 20-50 个请求
2. **缓存命中**: 应该有部分请求 `cached: true`
3. **响应时间**: 
   - Cached 应该 < 200ms
   - Uncached 应该 < 5s
4. **错误率**: 应该 < 5%
5. **降级率**: 应该 < 10%

如果数据不合理，可能需要：
- 增加测试请求数量
- 检查应用配置
- 验证 metrics 收集是否正常工作

---

## 🎯 快速测试（最小样本）

如果只需要快速验证，可以：

1. 发送 10 个相同消息（测试缓存）
2. 发送 10 个不同消息（测试未缓存）
3. 解析日志获取基础指标

虽然样本较小，但可以验证系统是否正常工作。

---

## 📝 注意事项

1. **环境差异**: 本地测试的数据可能与生产环境不同
2. **网络延迟**: AI API 调用受网络影响
3. **缓存预热**: 首次请求不会命中缓存
4. **样本大小**: 样本越大，数据越可靠

---

## 🔗 相关文件

- `scripts/parse-metrics-from-logs.js` - 日志解析脚本
- `src/services/chat.service.ts` - Metrics 收集代码
- `real-performance-metrics.json` - 解析结果（运行脚本后生成）

---

**建议**: 在提交简历前，至少运行一次真实测试，用实际数据替换估算值，这样会让简历更加可信！

