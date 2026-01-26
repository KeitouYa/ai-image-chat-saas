# ⚡ 快速开始测试 - 复制粘贴命令

## 🎯 最简单的3步

### 步骤1: 启动服务器（启用Metrics）

**Windows PowerShell:**
```powershell
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
$env:METRICS_ENABLED="true"
npm run dev
```

**Windows CMD:**
```cmd
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
set METRICS_ENABLED=true
npm run dev
```

**Git Bash:**
```bash
cd D:/workspace/files/webdevelopment/04React/udemy/ai_image_chatbot/myapp/improvedV2/ai_img_chat
export METRICS_ENABLED=true
npm run dev
```

---

### 步骤2: 在浏览器中测试

1. 打开浏览器: http://localhost:3000
2. 登录应用
3. 发送20-30条消息（见下方测试消息）

**测试消息**（复制粘贴）:
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

---

### 步骤3: 解析Metrics

**停止服务器** (在运行npm run dev的终端按 Ctrl+C)

**然后在新终端运行:**

```bash
cd D:\workspace\files\webdevelopment\04React\udemy\ai_image_chatbot\myapp\improvedV2\ai_img_chat
node scripts/parse-metrics-from-logs.js metrics.log
```

**如果没有metrics.log文件，需要:**
1. 从服务器终端复制包含 `[metric]` 的日志
2. 保存到 `metrics.log`
3. 再运行解析脚本

---

## 📊 查看结果

```bash
# Windows PowerShell
Get-Content real-performance-metrics.json

# Windows CMD  
type real-performance-metrics.json
```

---

## ✅ 完成！

现在你有了真实的性能metrics数据！

查看 `real-performance-metrics.json` 获取：
- Cache Hit Rate
- P95 Latency (Cached/Uncached)
- Fallback Rate
- Error Rate

---

**就这么简单！开始吧！** 🚀

