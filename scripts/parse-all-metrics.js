/**
 * Parse All Metrics from Logs (Chat + Image)
 * 
 * Parses both chat and image generation metrics from application logs
 * 
 * Usage: node scripts/parse-all-metrics.js <log-file>
 */

const fs = require("fs");
const path = require("path");

function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

function parseChatMetrics(logContent) {
  const metricPattern = /\[metric\] chat\.request\s+({[\s\S]*?})/g;
  const metrics = [];
  
  let match;
  while ((match = metricPattern.exec(logContent)) !== null) {
    try {
      const metricStr = match[1];
      const cleaned = metricStr
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      
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
        type: "chat",
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
      // Skip invalid entries
    }
  }
  
  return metrics;
}

function parseImageMetrics(logContent) {
  const metricPattern = /\[metric\] image\.generation\s+({[\s\S]*?})/g;
  const metrics = [];
  
  let match;
  while ((match = metricPattern.exec(logContent)) !== null) {
    try {
      const metricStr = match[1];
      const cleaned = metricStr
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      
      const extractNumber = (field) => {
        const regex = new RegExp(`"${field}":\\s*(\\d+)`, "i");
        const match = cleaned.match(regex);
        return match ? parseInt(match[1]) : null;
      };
      
      const extractField = (field) => {
        const regex = new RegExp(`"${field}":\\s*([^,}\\s]+)`, "i");
        const match = cleaned.match(regex);
        return match ? match[1].replace(/"/g, "").trim() : null;
      };
      
      const metric = {
        type: "image",
        status: extractField("status"),
        totalMs: extractNumber("totalMs"),
        replicateMs: extractNumber("replicateMs"),
        downloadMs: extractNumber("downloadMs"),
        uploadMs: extractNumber("uploadMs"),
        dbMs: extractNumber("dbMs"),
        creditMs: extractNumber("creditMs"),
        saveMs: extractNumber("saveMs"),
      };
      
      if (metric.totalMs !== null) {
        metrics.push(metric);
      }
    } catch (err) {
      // Skip invalid entries
    }
  }
  
  return metrics;
}

function calculateChatMetrics(metrics) {
  if (metrics.length === 0) return null;
  
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

function calculateImageMetrics(metrics) {
  if (metrics.length === 0) return null;
  
  const successful = metrics.filter(m => m.status === "success");
  const failed = metrics.filter(m => m.status === "fail");
  
  const allLatencies = metrics.map(m => m.totalMs).filter(m => m !== null).sort((a, b) => a - b);
  const replicateLatencies = metrics.map(m => m.replicateMs).filter(m => m !== null).sort((a, b) => a - b);
  const downloadLatencies = metrics.map(m => m.downloadMs).filter(m => m !== null).sort((a, b) => a - b);
  const uploadLatencies = metrics.map(m => m.uploadMs).filter(m => m !== null).sort((a, b) => a - b);
  
  return {
    totalRequests: metrics.length,
    successRate: (successful.length / metrics.length) * 100,
    errorRate: (failed.length / metrics.length) * 100,
    p95Latency: calculatePercentile(allLatencies, 95),
    p95ReplicateLatency: replicateLatencies.length > 0 ? calculatePercentile(replicateLatencies, 95) : 0,
    p95DownloadLatency: downloadLatencies.length > 0 ? calculatePercentile(downloadLatencies, 95) : 0,
    p95UploadLatency: uploadLatencies.length > 0 ? calculatePercentile(uploadLatencies, 95) : 0,
    avgLatency: allLatencies.length > 0 ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length : 0,
    avgReplicateLatency: replicateLatencies.length > 0 ? replicateLatencies.reduce((a, b) => a + b, 0) / replicateLatencies.length : 0,
    minLatency: allLatencies.length > 0 ? allLatencies[0] : 0,
    maxLatency: allLatencies.length > 0 ? allLatencies[allLatencies.length - 1] : 0,
  };
}

function main() {
  const logFile = process.argv[2];
  
  if (!logFile) {
    console.log(`
使用方法:
node scripts/parse-all-metrics.js <log-file>

或者从标准输入读取:
cat metrics.log | node scripts/parse-all-metrics.js -
    `);
    process.exit(1);
  }
  
  let logContent;
  
  if (logFile === "-") {
    logContent = fs.readFileSync(0, "utf-8");
  } else {
    logContent = fs.readFileSync(logFile, "utf-8");
  }
  
  console.log("📊 解析所有 metrics 日志...\n");
  
  const chatMetrics = parseChatMetrics(logContent);
  const imageMetrics = parseImageMetrics(logContent);
  
  console.log(`✅ 找到 ${chatMetrics.length} 条聊天 metrics`);
  console.log(`✅ 找到 ${imageMetrics.length} 条图片生成 metrics\n`);
  
  const chatResults = calculateChatMetrics(chatMetrics);
  const imageResults = calculateImageMetrics(imageMetrics);
  
  console.log("=".repeat(60));
  console.log("  聊天性能指标 (Chat Metrics)");
  console.log("=".repeat(60));
  
  if (chatResults) {
    console.log(`\n📊 Cache Hit Rate:     ${chatResults.cacheHitRate.toFixed(1)}%`);
    console.log(`📊 Fallback Rate:      ${chatResults.fallbackRate.toFixed(1)}%`);
    console.log(`📊 Error Rate:         ${chatResults.errorRate.toFixed(1)}%`);
    console.log(`\n⏱️  P95 Latency:         ${chatResults.p95Latency.toFixed(0)}ms`);
    console.log(`⏱️  P95 Cached:           ${chatResults.p95CachedLatency.toFixed(0)}ms`);
    console.log(`⏱️  P95 Uncached:         ${chatResults.p95UncachedLatency.toFixed(0)}ms`);
    console.log(`⏱️  Average Latency:     ${chatResults.avgLatency.toFixed(0)}ms`);
    console.log(`⏱️  Min Latency:         ${chatResults.minLatency.toFixed(0)}ms`);
    console.log(`⏱️  Max Latency:         ${chatResults.maxLatency.toFixed(0)}ms`);
  } else {
    console.log("\n⚠️  未找到聊天 metrics 数据");
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("  图片生成性能指标 (Image Generation Metrics)");
  console.log("=".repeat(60));
  
  if (imageResults) {
    console.log(`\n📊 Success Rate:        ${imageResults.successRate.toFixed(1)}%`);
    console.log(`📊 Error Rate:          ${imageResults.errorRate.toFixed(1)}%`);
    console.log(`\n⏱️  P95 Total Latency:    ${imageResults.p95Latency.toFixed(0)}ms`);
    console.log(`⏱️  P95 Replicate:        ${imageResults.p95ReplicateLatency.toFixed(0)}ms`);
    console.log(`⏱️  P95 Download:         ${imageResults.p95DownloadLatency.toFixed(0)}ms`);
    console.log(`⏱️  P95 Upload:           ${imageResults.p95UploadLatency.toFixed(0)}ms`);
    console.log(`⏱️  Average Latency:     ${imageResults.avgLatency.toFixed(0)}ms`);
    console.log(`⏱️  Avg Replicate:       ${imageResults.avgReplicateLatency.toFixed(0)}ms`);
    console.log(`⏱️  Min Latency:         ${imageResults.minLatency.toFixed(0)}ms`);
    console.log(`⏱️  Max Latency:         ${imageResults.maxLatency.toFixed(0)}ms`);
  } else {
    console.log("\n⚠️  未找到图片生成 metrics 数据");
  }
  
  // Save to file
  const reportPath = path.join(__dirname, "..", "all-performance-metrics.json");
  const report = {
    timestamp: new Date().toISOString(),
    note: "Real metrics from actual application logs",
    chat: {
      sampleSize: chatMetrics.length,
      metrics: chatResults,
    },
    image: {
      sampleSize: imageMetrics.length,
      metrics: imageResults,
    },
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 完整报告已保存到: all-performance-metrics.json`);
  
  // Resume-friendly summary
  console.log("\n" + "=".repeat(60));
  console.log("  简历可用指标总结");
  console.log("=".repeat(60));
  
  if (chatResults) {
    console.log(`\n💬 聊天 (Chat):`);
    console.log(`   • Cache Hit Rate: ${chatResults.cacheHitRate.toFixed(1)}%`);
    console.log(`   • P95 Latency (Cached): ${chatResults.p95CachedLatency.toFixed(0)}ms`);
    console.log(`   • P95 Latency (Uncached): ${chatResults.p95UncachedLatency.toFixed(0)}ms`);
    console.log(`   • Fallback Rate: ${chatResults.fallbackRate.toFixed(1)}%`);
    console.log(`   • Error Rate: ${chatResults.errorRate.toFixed(1)}%`);
  }
  
  if (imageResults) {
    console.log(`\n🖼️  图片生成 (Image Generation):`);
    console.log(`   • Success Rate: ${imageResults.successRate.toFixed(1)}%`);
    console.log(`   • P95 Latency: ${imageResults.p95Latency.toFixed(0)}ms`);
    console.log(`   • P95 Replicate: ${imageResults.p95ReplicateLatency.toFixed(0)}ms`);
    console.log(`   • Error Rate: ${imageResults.errorRate.toFixed(1)}%`);
  }
}

main();

