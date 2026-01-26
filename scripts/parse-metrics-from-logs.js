/**
 * Parse Real Metrics from Logs
 * 
 * This script helps extract real performance metrics from application logs
 * when METRICS_ENABLED=true
 * 
 * Usage:
 * 1. Enable metrics: METRICS_ENABLED=true npm run dev
 * 2. Make some requests to /api/chat
 * 3. Copy logs containing [metric] chat.request
 * 4. Save to a file or pipe to this script
 */

const fs = require("fs");
const path = require("path");

function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

function parseMetricsFromLogs(logContent) {
  // Extract all [metric] chat.request entries
  const metricPattern = /\[metric\] chat\.request\s+({[\s\S]*?})/g;
  const metrics = [];
  
  let match;
  while ((match = metricPattern.exec(logContent)) !== null) {
    try {
      // Try to parse the JSON object
      const metricStr = match[1];
      // Clean up the string (remove newlines, fix JSON if needed)
      const cleaned = metricStr
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      
      // Try to extract key fields using regex if JSON parsing fails
      const extractField = (field) => {
        const regex = new RegExp(`"${field}":\\s*([^,}\\s]+)`, "i");
        const match = cleaned.match(regex);
        return match ? match[1].replace(/"/g, "").trim() : null;
      };
      
      const extractNumber = (field) => {
        const regex = new RegExp(`"${field}":\\s*(\\d+)`, "i");
        const match = cleaned.match(regex);
        return match ? parseInt(match[1]) : null;
      };
      
      const extractBoolean = (field) => {
        const regex = new RegExp(`"${field}":\\s*(true|false)`, "i");
        const match = cleaned.match(regex);
        return match ? match[1] === "true" : null;
      };
      
      const metric = {
        cached: extractBoolean("cached"),
        fallbackUsed: extractBoolean("fallbackUsed"),
        status: extractField("status"),
        totalMs: extractNumber("totalMs"),
        providerUsed: extractField("providerUsed"),
      };
      
      if (metric.totalMs !== null) {
        metrics.push(metric);
      }
    } catch (err) {
      console.warn("Failed to parse metric entry:", err.message);
    }
  }
  
  return metrics;
}

function calculateMetrics(metrics) {
  if (metrics.length === 0) {
    return null;
  }
  
  const cached = metrics.filter(m => m.cached === true);
  const uncached = metrics.filter(m => m.cached === false);
  const failed = metrics.filter(m => m.status === "fail");
  const fallback = metrics.filter(m => m.fallbackUsed === true);
  
  const allLatencies = metrics.map(m => m.totalMs).filter(m => m !== null).sort((a, b) => a - b);
  const cachedLatencies = cached.map(m => m.totalMs).filter(m => m !== null).sort((a, b) => a - b);
  const uncachedLatencies = uncached.map(m => m.totalMs).filter(m => m !== null).sort((a, b) => a - b);
  
  return {
    totalRequests: metrics.length,
    cacheHitRate: (cached.length / metrics.length) * 100,
    errorRate: (failed.length / metrics.length) * 100,
    fallbackRate: (fallback.length / metrics.length) * 100,
    p95Latency: calculatePercentile(allLatencies, 95),
    p95CachedLatency: cachedLatencies.length > 0 ? calculatePercentile(cachedLatencies, 95) : 0,
    p95UncachedLatency: uncachedLatencies.length > 0 ? calculatePercentile(uncachedLatencies, 95) : 0,
    avgLatency: allLatencies.length > 0 ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length : 0,
    minLatency: allLatencies.length > 0 ? allLatencies[0] : 0,
    maxLatency: allLatencies.length > 0 ? allLatencies[allLatencies.length - 1] : 0,
  };
}

function main() {
  const logFile = process.argv[2];
  
  if (!logFile) {
    console.log(`
使用方法:
1. 启用 metrics: METRICS_ENABLED=true npm run dev
2. 发送一些请求到 /api/chat
3. 将包含 [metric] chat.request 的日志保存到文件
4. 运行: node scripts/parse-metrics-from-logs.js <log-file>

或者从标准输入读取:
METRICS_ENABLED=true npm run dev 2>&1 | node scripts/parse-metrics-from-logs.js -
    `);
    process.exit(1);
  }
  
  let logContent;
  
  if (logFile === "-") {
    // Read from stdin
    logContent = fs.readFileSync(0, "utf-8");
  } else {
    logContent = fs.readFileSync(logFile, "utf-8");
  }
  
  console.log("📊 解析 metrics 日志...\n");
  
  const metrics = parseMetricsFromLogs(logContent);
  
  if (metrics.length === 0) {
    console.log("❌ 未找到 [metric] chat.request 条目");
    console.log("请确保:");
    console.log("  1. METRICS_ENABLED=true");
    console.log("  2. 已经发送了一些请求");
    console.log("  3. 日志中包含 [metric] chat.request");
    process.exit(1);
  }
  
  console.log(`✅ 找到 ${metrics.length} 个 metrics 条目\n`);
  
  const results = calculateMetrics(metrics);
  
  console.log("=".repeat(60));
  console.log("  真实性能指标");
  console.log("=".repeat(60));
  console.log(`\n📊 Cache Hit Rate:     ${results.cacheHitRate.toFixed(1)}%`);
  console.log(`📊 Fallback Rate:      ${results.fallbackRate.toFixed(1)}%`);
  console.log(`📊 Error Rate:         ${results.errorRate.toFixed(1)}%`);
  console.log(`\n⏱️  P95 Latency:         ${results.p95Latency.toFixed(0)}ms`);
  console.log(`⏱️  P95 Cached:           ${results.p95CachedLatency.toFixed(0)}ms`);
  console.log(`⏱️  P95 Uncached:         ${results.p95UncachedLatency.toFixed(0)}ms`);
  console.log(`⏱️  Average Latency:     ${results.avgLatency.toFixed(0)}ms`);
  console.log(`⏱️  Min Latency:         ${results.minLatency.toFixed(0)}ms`);
  console.log(`⏱️  Max Latency:         ${results.maxLatency.toFixed(0)}ms`);
  
  // Save to file
  const reportPath = path.join(__dirname, "..", "real-performance-metrics.json");
  const report = {
    timestamp: new Date().toISOString(),
    note: "Real metrics from actual application logs",
    sampleSize: metrics.length,
    metrics: results,
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 报告已保存到: real-performance-metrics.json`);
  
  // Resume-friendly summary
  console.log("\n" + "=".repeat(60));
  console.log("  简历可用指标");
  console.log("=".repeat(60));
  console.log(`\n✅ Cache Hit Rate: ${results.cacheHitRate.toFixed(1)}%`);
  console.log(`✅ P95 Latency (Cached): ${results.p95CachedLatency.toFixed(0)}ms`);
  console.log(`✅ P95 Latency (Uncached): ${results.p95UncachedLatency.toFixed(0)}ms`);
  console.log(`✅ Fallback Rate: ${results.fallbackRate.toFixed(1)}%`);
  console.log(`✅ Error Rate: ${results.errorRate.toFixed(1)}%`);
}

main();

