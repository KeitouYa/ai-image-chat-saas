# 🎯 最短路径获取真实数据 - 3步法

## 目标
把估算变成真实数据，需要做3件事：

1. ✅ **固定测试条件** - 选择测试环境
2. ✅ **跑固定数量请求** - 300-1000次（含warmup）
3. ✅ **从日志计算指标** - p95、cache hit、fallback、error

---

## 步骤1: 固定测试条件

### 选择测试环境（三选一）

**选项A: 本机测试** ⭐ 推荐（最简单）
```bash
# 环境: 本地开发环境
# URL: http://localhost:3000
# 优点: 快速、可控、免费
# 缺点: 网络条件可能不同
```

**选项B: Vercel Preview**
```bash
# 环境: Vercel预览部署
# URL: https://your-app-xxx.vercel.app
# 优点: 接近生产环境
# 缺点: 需要部署
```

**选项C: Staging环境**
```bash
# 环境: 预发布环境
# URL: https://staging.yourdomain.com
# 优点: 最接近生产
# 缺点: 需要额外配置
```

**推荐**: 使用**本机测试**，因为：
- 快速开始
- 完全可控
- 不需要额外部署
- 数据足够真实

---

## 步骤2: 跑固定数量请求

### 2.1 启动服务器（启用Metrics）

```powershell
# Windows PowerShell
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
$env:METRICS_ENABLED="true"
npm run dev
```

### 2.2 发送固定数量请求

**方案A: 手动发送（推荐用于图片生成）**

#### 聊天测试（300-500次）
1. 打开浏览器: http://localhost:3000/chat
2. 登录应用
3. 使用以下脚本快速发送：

**快速发送脚本**（在浏览器控制台运行）:
```javascript
// 在浏览器控制台运行（需要先登录）
const messages = [
  "What is React?", "Explain TypeScript", "What is Next.js?",
  "How does caching work?", "What is MongoDB?", "What is Redis?",
  "Explain async programming", "What are React hooks?",
  "What is TypeScript?", "How does Next.js work?"
];

let count = 0;
const total = 300; // 总请求数
const warmup = 50; // Warmup数量

async function sendMessage(msg) {
  const input = document.querySelector('input[type="text"]');
  const form = document.querySelector('form');
  if (!input || !form) return;
  
  input.value = msg;
  form.dispatchEvent(new Event('submit', { bubbles: true }));
  await new Promise(r => setTimeout(r, 1000));
}

async function runTest() {
  // Warmup
  console.log('🔥 Warmup阶段...');
  for (let i = 0; i < warmup; i++) {
    await sendMessage(messages[i % messages.length]);
  }
  
  // 实际测试
  console.log('📊 开始测试...');
  for (let i = 0; i < total; i++) {
    await sendMessage(messages[i % messages.length]);
    if ((i + 1) % 50 === 0) {
      console.log(`进度: ${i + 1}/${total}`);
    }
  }
  console.log('✅ 测试完成！');
}

runTest();
```

#### 图片生成测试（50-100次）
1. 打开: http://localhost:3000
2. 手动生成图片（每张需要10-30秒）
3. 使用以下提示词：

```
A beautiful sunset over mountains
A futuristic cityscape at night
A serene forest with sunlight
A cute cat playing with yarn
A modern minimalist office
A vibrant flower garden
A peaceful beach at sunset
A cozy coffee shop interior
A majestic mountain range
A starry night sky over a lake
```

**方案B: 自动化脚本**（需要认证token）

```bash
# 设置认证token（从浏览器获取）
set AUTH_TOKEN=your_token_here

# 运行测试
node scripts/run-load-test.js --chat-requests=300 --warmup=50
```

---

## 步骤3: 从日志计算指标

### 3.1 停止服务器
按 Ctrl+C 停止服务器

### 3.2 解析日志

```bash
node scripts/parse-all-metrics.js metrics.log
```

### 3.3 查看结果

```powershell
Get-Content all-performance-metrics.json
```

### 3.4 提取关键指标

从 `all-performance-metrics.json` 中提取：

**聊天指标**:
- `cacheHitRate` - 缓存命中率
- `p95CachedLatency` - P95缓存延迟
- `p95UncachedLatency` - P95未缓存延迟
- `fallbackRate` - 降级率
- `errorRate` - 错误率

**图片生成指标**:
- `successRate` - 成功率
- `p95Latency` - P95总延迟
- `p95ReplicateLatency` - P95 AI生成时间
- `errorRate` - 错误率

---

## 📊 完整测试流程（最短路径）

### 一次性脚本

```powershell
# 1. 启动服务器（保存日志）
$env:METRICS_ENABLED="true"
npm run dev *> metrics.log

# 2. 在浏览器中：
#    - 打开 http://localhost:3000/chat
#    - 登录
#    - 在控制台运行上面的JavaScript脚本（发送300次请求）

# 3. 停止服务器 (Ctrl+C)

# 4. 解析metrics
node scripts/parse-all-metrics.js metrics.log

# 5. 查看结果
Get-Content all-performance-metrics.json
```

---

## ✅ 验证清单

- [ ] **测试条件固定**: 选择了测试环境（本机/Vercel/Staging）
- [ ] **请求数量固定**: 
  - [ ] Warmup: 50次
  - [ ] 聊天测试: 300-500次
  - [ ] 图片测试: 50-100次
- [ ] **从日志计算**: 运行了解析脚本
- [ ] **获得真实数据**: 有p95、cache hit、fallback、error数据

---

## 🎯 最短路径总结

**3步完成**:
1. 固定环境: 本机 `http://localhost:3000`
2. 固定请求: 300次聊天 + 50次图片（含50次warmup）
3. 解析日志: `node scripts/parse-all-metrics.js metrics.log`

**结果**: 获得真实p95、cache hit、fallback、error数据 ✅

---

## 📝 更新简历

获得真实数据后，更新简历：

**之前（估算）**:
```
Achieved 45% cache hit rate and <85ms p95 latency...
```

**之后（真实）**:
```
Achieved [真实值]% cache hit rate and <[真实值]ms p95 latency...
```

所有数据都来自实际测试，可以验证！✅

