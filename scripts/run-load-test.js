/**
 * Load Test Script - 自动化性能测试
 * 
 * 最短路径获取真实数据：
 * 1. 固定测试条件（本机）
 * 2. 跑固定数量请求（含warmup）
 * 3. 从日志计算p95、cache hit、fallback、error
 * 
 * Usage: node scripts/run-load-test.js [options]
 * 
 * Options:
 *   --chat-requests=300   聊天请求数量（默认300）
 *   --image-requests=50   图片生成请求数量（默认50）
 *   --warmup=50           Warmup请求数量（默认50）
 *   --base-url=...        测试URL（默认http://localhost:3000）
 */

const http = require("http");
const https = require("https");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

// 配置
const config = {
  chatRequests: 300,
  imageRequests: 50,
  warmupRequests: 50,
  baseUrl: "http://localhost:3000",
  delayBetweenRequests: 100, // ms
  timeout: 60000, // 60s
};

// 解析命令行参数
process.argv.forEach(arg => {
  if (arg.startsWith("--chat-requests=")) {
    config.chatRequests = parseInt(arg.split("=")[1]);
  } else if (arg.startsWith("--image-requests=")) {
    config.imageRequests = parseInt(arg.split("=")[1]);
  } else if (arg.startsWith("--warmup=")) {
    config.warmupRequests = parseInt(arg.split("=")[1]);
  } else if (arg.startsWith("--base-url=")) {
    config.baseUrl = arg.split("=")[1];
  }
});

// 测试消息池
const CHAT_MESSAGES = [
  "What is React?",
  "Explain TypeScript",
  "What is Next.js?",
  "How does caching work?",
  "What is MongoDB?",
  "What is Redis?",
  "Explain async programming",
  "What are React hooks?",
  "What is TypeScript?",
  "How does Next.js work?",
  "What is caching?",
  "Explain MongoDB",
  "What is Redis?",
  "How does async work?",
  "What are hooks?",
];

const IMAGE_PROMPTS = [
  "A beautiful sunset over mountains",
  "A futuristic cityscape at night",
  "A serene forest with sunlight",
  "A cute cat playing with yarn",
  "A modern minimalist office",
  "A vibrant flower garden",
  "A peaceful beach at sunset",
  "A cozy coffee shop interior",
  "A majestic mountain range",
  "A starry night sky over a lake",
];

// 统计
const stats = {
  chat: {
    total: 0,
    success: 0,
    failed: 0,
    latencies: [],
  },
  image: {
    total: 0,
    success: 0,
    failed: 0,
    latencies: [],
  },
};

// 发送HTTP请求
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const httpModule = isHttps ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      timeout: config.timeout,
    };
    
    const req = httpModule.request(reqOptions, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: parsed,
            latency: Date.now() - startTime,
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            data: body,
            latency: Date.now() - startTime,
          });
        }
      });
    });
    
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
    
    const startTime = Date.now();
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 发送聊天请求
async function sendChatRequest(message, authToken) {
  try {
    const result = await makeRequest(
      `${config.baseUrl}/api/chat`,
      {
        method: "POST",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      },
      { message, provider: "gemini" }
    );
    
    stats.chat.total++;
    if (result.status === 200 && result.data.success) {
      stats.chat.success++;
      stats.chat.latencies.push(result.latency);
      return { success: true, cached: result.data.data?.cached || false };
    } else {
      stats.chat.failed++;
      return { success: false };
    }
  } catch (err) {
    stats.chat.total++;
    stats.chat.failed++;
    return { success: false, error: err.message };
  }
}

// 发送图片生成请求（需要认证，这里只是示例）
async function sendImageRequest(prompt, authToken) {
  // 注意：图片生成通常通过Server Action，这里需要根据实际API调整
  // 如果通过API路由，可以类似处理
  console.log(`[Image] Would generate: ${prompt}`);
  stats.image.total++;
  // 实际实现需要根据你的API调整
  return { success: true };
}

// Warmup阶段
async function warmup(authToken) {
  console.log(`\n🔥 Warmup阶段: ${config.warmupRequests} 个请求...\n`);
  
  for (let i = 0; i < config.warmupRequests; i++) {
    const message = CHAT_MESSAGES[i % CHAT_MESSAGES.length];
    await sendChatRequest(message, authToken);
    
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`  ${i + 1}/${config.warmupRequests}...\r`);
    }
    
    await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
  }
  
  console.log(`\n✅ Warmup完成\n`);
}

// 主测试
async function runLoadTest(authToken) {
  console.log("=".repeat(60));
  console.log("  自动化性能测试");
  console.log("=".repeat(60));
  console.log(`\n测试条件:`);
  console.log(`  - 环境: 本机 (${config.baseUrl})`);
  console.log(`  - Warmup: ${config.warmupRequests} 请求`);
  console.log(`  - 聊天测试: ${config.chatRequests} 请求`);
  console.log(`  - 图片测试: ${config.imageRequests} 请求`);
  console.log(`  - 总请求数: ${config.warmupRequests + config.chatRequests + config.imageRequests}\n`);
  
  // 重置统计
  stats.chat = { total: 0, success: 0, failed: 0, latencies: [] };
  stats.image = { total: 0, success: 0, failed: 0, latencies: [] };
  
  // 1. Warmup
  await warmup(authToken);
  
  // 重置warmup后的统计（只统计实际测试）
  stats.chat = { total: 0, success: 0, failed: 0, latencies: [] };
  
  // 2. 聊天测试
  console.log(`\n💬 聊天测试: ${config.chatRequests} 个请求...\n`);
  
  for (let i = 0; i < config.chatRequests; i++) {
    const message = CHAT_MESSAGES[i % CHAT_MESSAGES.length];
    const result = await sendChatRequest(message, authToken);
    
    if ((i + 1) % 50 === 0) {
      const successRate = ((stats.chat.success / stats.chat.total) * 100).toFixed(1);
      process.stdout.write(`  ${i + 1}/${config.chatRequests} (${successRate}% success)\r`);
    }
    
    await new Promise(resolve => setTimeout(resolve, config.delayBetweenRequests));
  }
  
  console.log(`\n✅ 聊天测试完成\n`);
  
  // 3. 图片测试（如果需要）
  if (config.imageRequests > 0) {
    console.log(`\n🖼️  图片生成测试: ${config.imageRequests} 个请求...\n`);
    console.log("⚠️  注意: 图片生成需要手动测试（通过浏览器），因为需要认证和Server Action\n");
  }
  
  // 输出初步统计
  console.log("\n" + "=".repeat(60));
  console.log("  初步统计");
  console.log("=".repeat(60));
  
  if (stats.chat.total > 0) {
    const sorted = [...stats.chat.latencies].sort((a, b) => a - b);
    const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    
    console.log(`\n💬 聊天:`);
    console.log(`  总请求: ${stats.chat.total}`);
    console.log(`  成功: ${stats.chat.success} (${((stats.chat.success / stats.chat.total) * 100).toFixed(1)}%)`);
    console.log(`  失败: ${stats.chat.failed} (${((stats.chat.failed / stats.chat.total) * 100).toFixed(1)}%)`);
    console.log(`  平均延迟: ${avg.toFixed(0)}ms`);
    console.log(`  P95延迟: ${p95}ms`);
    console.log(`  最小: ${sorted[0]}ms`);
    console.log(`  最大: ${sorted[sorted.length - 1]}ms`);
  }
  
  console.log(`\n📝 注意: 完整metrics需要从应用日志中解析`);
  console.log(`   运行: node scripts/parse-all-metrics.js metrics.log\n`);
}

// 主函数
async function main() {
  const authToken = process.env.AUTH_TOKEN || null;
  
  if (!authToken) {
    console.log(`
⚠️  未提供认证token

选项1: 设置环境变量
  set AUTH_TOKEN=your_token
  node scripts/run-load-test.js

选项2: 手动测试（推荐）
  1. 启动服务器: METRICS_ENABLED=true npm run dev
  2. 在浏览器中发送请求
  3. 解析日志: node scripts/parse-all-metrics.js metrics.log

选项3: 使用无认证测试（可能失败）
  node scripts/run-load-test.js
    `);
    
    const proceed = process.argv.includes("--no-auth");
    if (!proceed) {
      process.exit(1);
    }
  }
  
  try {
    await runLoadTest(authToken);
  } catch (error) {
    console.error("\n❌ 测试失败:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runLoadTest };

