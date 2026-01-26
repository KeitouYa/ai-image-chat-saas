/**
 * 等待测试完成并自动解析日志
 * 
 * 这个脚本会：
 * 1. 监控 metrics.log 文件
 * 2. 检测到足够的 metrics 条目后
 * 3. 自动解析并生成报告
 * 
 * Usage: node scripts/wait-and-parse.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const logFile = path.join(__dirname, "..", "metrics.log");
const parseScript = path.join(__dirname, "parse-all-metrics.js");
const minMetrics = 300; // 最少需要300条metrics条目

function countMetricsInLog() {
  try {
    if (!fs.existsSync(logFile)) {
      return 0;
    }
    
    const content = fs.readFileSync(logFile, "utf-8");
    const chatMatches = (content.match(/\[metric\] chat\.request/g) || []).length;
    const imageMatches = (content.match(/\[metric\] image\.generation/g) || []).length;
    
    return {
      chat: chatMatches,
      image: imageMatches,
      total: chatMatches + imageMatches,
    };
  } catch (err) {
    return { chat: 0, image: 0, total: 0 };
  }
}

function waitForMetrics() {
  console.log("⏳ 等待测试完成...");
  console.log(`   目标: 至少 ${minMetrics} 条聊天 metrics\n`);
  
  let lastCount = 0;
  const checkInterval = 5000; // 每5秒检查一次
  
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const counts = countMetricsInLog();
      
      if (counts.total > lastCount) {
        console.log(`📊 当前进度: ${counts.chat} 条聊天, ${counts.image} 条图片 (总计: ${counts.total})`);
        lastCount = counts.total;
      }
      
      if (counts.chat >= minMetrics) {
        clearInterval(interval);
        console.log(`\n✅ 检测到足够的 metrics (${counts.chat} 条聊天, ${counts.image} 条图片)`);
        console.log("   开始解析...\n");
        resolve(counts);
      }
    }, checkInterval);
    
    // 也检查一次（立即）
    const initialCounts = countMetricsInLog();
    if (initialCounts.chat >= minMetrics) {
      clearInterval(interval);
      console.log(`✅ 已有足够的 metrics (${initialCounts.chat} 条)`);
      resolve(initialCounts);
    }
  });
}

function parseMetrics() {
  try {
    console.log("📊 解析 metrics 日志...\n");
    execSync(`node "${parseScript}" "${logFile}"`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    
    console.log("\n✅ 解析完成！");
    console.log("   查看结果: Get-Content all-performance-metrics.json\n");
    
    return true;
  } catch (err) {
    console.error("❌ 解析失败:", err.message);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("  自动解析 Metrics");
  console.log("=".repeat(60));
  console.log("\n这个脚本会:");
  console.log("  1. 监控 metrics.log 文件");
  console.log("  2. 等待足够的 metrics 条目");
  console.log("  3. 自动解析并生成报告\n");
  
  // 检查日志文件是否存在
  if (!fs.existsSync(logFile)) {
    console.log("⚠️  metrics.log 文件不存在");
    console.log("   请确保服务器正在运行并启用了 METRICS_ENABLED=true\n");
    console.log("   按 Ctrl+C 退出，或等待日志文件创建...\n");
  }
  
  try {
    // 等待足够的metrics
    await waitForMetrics();
    
    // 解析
    const success = parseMetrics();
    
    if (success) {
      console.log("=".repeat(60));
      console.log("  ✅ 完成！");
      console.log("=".repeat(60));
      console.log("\n📄 真实数据已保存在: all-performance-metrics.json");
      console.log("   可以用这些数据更新简历了！\n");
    }
  } catch (err) {
    console.error("\n❌ 错误:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { waitForMetrics, parseMetrics };

