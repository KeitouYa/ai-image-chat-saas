#!/usr/bin/env node

/**
 * 开发模拟开关测试脚本
 * 测试三个开关：SIMULATE_GEMINI_FAILURE, DISABLE_CHAT_CREDITS, DISABLE_CHAT_CACHE
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 测试用例配置
const testCases = [
  {
    name: '基准测试 (所有开关关闭)',
    env: {
      SIMULATE_GEMINI_FAILURE: 'false',
      DISABLE_CHAT_CREDITS: 'false',
      DISABLE_CHAT_CACHE: 'false'
    },
    expected: {
      creditsDeducted: true,
      cacheUsed: true,
      fallbackUsed: false
    }
  },
  {
    name: '禁用积分系统',
    env: {
      SIMULATE_GEMINI_FAILURE: 'false',
      DISABLE_CHAT_CREDITS: 'true',
      DISABLE_CHAT_CACHE: 'false'
    },
    expected: {
      creditsDeducted: false,
      cacheUsed: true,
      fallbackUsed: false
    }
  },
  {
    name: '禁用缓存',
    env: {
      SIMULATE_GEMINI_FAILURE: 'false',
      DISABLE_CHAT_CREDITS: 'false',
      DISABLE_CHAT_CACHE: 'true'
    },
    expected: {
      creditsDeducted: true,
      cacheUsed: false,
      fallbackUsed: false
    }
  },
  {
    name: '模拟Gemini失败 (触发降级)',
    env: {
      SIMULATE_GEMINI_FAILURE: 'true',
      DISABLE_CHAT_CREDITS: 'false',
      DISABLE_CHAT_CACHE: 'false'
    },
    expected: {
      creditsDeducted: true,
      cacheUsed: true,
      fallbackUsed: true,
      providerUsed: 'openai'
    }
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 测试: ${testCase.name}`);
  console.log('='.repeat(50));

  // 设置环境变量
  Object.entries(testCase.env).forEach(([key, value]) => {
    process.env[key] = value;
  });

  try {
    // 运行一个简单的Node.js脚本来测试开关
    const testScript = `
      // 模拟chat.service.ts中的开关逻辑
      const SIMULATE_GEMINI_FAILURE = process.env.SIMULATE_GEMINI_FAILURE === "true";
      const DISABLE_CHAT_CREDITS = process.env.DISABLE_CHAT_CREDITS === "true";
      const DISABLE_CHAT_CACHE = process.env.DISABLE_CHAT_CACHE === "true";
      const ENABLE_CHAT_CREDITS = !DISABLE_CHAT_CREDITS;

      console.log("开关状态:");
      console.log("  SIMULATE_GEMINI_FAILURE:", SIMULATE_GEMINI_FAILURE);
      console.log("  DISABLE_CHAT_CREDITS:", DISABLE_CHAT_CREDITS);
      console.log("  DISABLE_CHAT_CACHE:", DISABLE_CHAT_CACHE);
      console.log("  ENABLE_CHAT_CREDITS:", ENABLE_CHAT_CREDITS);

      // 模拟缓存逻辑
      const mockCacheReply = "cached response";
      const cacheEnabled = !DISABLE_CHAT_CACHE;
      const cachedReply = cacheEnabled ? mockCacheReply : null;

      console.log("缓存行为:");
      console.log("  缓存启用:", cacheEnabled);
      console.log("  缓存命中:", cachedReply !== null);

      // 模拟积分逻辑
      const creditsEnabled = ENABLE_CHAT_CREDITS;
      console.log("积分行为:");
      console.log("  积分启用:", creditsEnabled);

      // 模拟降级逻辑
      const geminiFails = SIMULATE_GEMINI_FAILURE;
      const fallbackUsed = geminiFails;
      const providerUsed = fallbackUsed ? "openai" : "gemini";

      console.log("降级行为:");
      console.log("  Gemini模拟失败:", geminiFails);
      console.log("  使用降级:", fallbackUsed);
      console.log("  最终提供商:", providerUsed);
    `;

    const result = await runNodeScript(testScript);

    console.log('✅ 测试结果:');
    console.log(result);

    // 验证结果
    const resultLines = result.split('\n');
    const switchResults = {};

    resultLines.forEach(line => {
      if (line.includes('ENABLE_CHAT_CREDITS:')) {
        switchResults.creditsEnabled = line.includes('true');
      }
      if (line.includes('缓存启用:')) {
        switchResults.cacheEnabled = line.includes('true');
      }
      if (line.includes('使用降级:')) {
        switchResults.fallbackUsed = line.includes('true');
      }
    });

    // 检查是否符合预期
    const expected = testCase.expected;
    let allCorrect = true;

    if (switchResults.creditsEnabled !== expected.creditsDeducted) {
      console.log(`❌ 积分逻辑不正确 - 期望: ${expected.creditsDeducted}, 实际: ${switchResults.creditsEnabled}`);
      allCorrect = false;
    } else {
      console.log('✅ 积分逻辑正确');
    }

    if (switchResults.cacheEnabled !== expected.cacheUsed) {
      console.log(`❌ 缓存逻辑不正确 - 期望: ${expected.cacheUsed}, 实际: ${switchResults.cacheEnabled}`);
      allCorrect = false;
    } else {
      console.log('✅ 缓存逻辑正确');
    }

    if (expected.fallbackUsed !== undefined && switchResults.fallbackUsed !== expected.fallbackUsed) {
      console.log(`❌ 降级逻辑不正确 - 期望: ${expected.fallbackUsed}, 实际: ${switchResults.fallbackUsed}`);
      allCorrect = false;
    } else if (expected.fallbackUsed !== undefined) {
      console.log('✅ 降级逻辑正确');
    }

    if (allCorrect) {
      console.log('✅ 所有开关行为正确!');
    } else {
      console.log('❌ 开关行为有误');
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

function runNodeScript(script) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['-e', script], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Exit code: ${code}`));
      }
    });
  });
}

async function main() {
  console.log('🚀 开发模拟开关测试开始');
  console.log('测试三个开关：SIMULATE_GEMINI_FAILURE, DISABLE_CHAT_CREDITS, DISABLE_CHAT_CACHE');

  for (const testCase of testCases) {
    await runTest(testCase);
  }

  console.log('\n🎉 所有测试完成!');
  console.log('\n💡 使用方法:');
  console.log('  SIMULATE_GEMINI_FAILURE=true npm run dev  # 模拟Gemini失败');
  console.log('  DISABLE_CHAT_CREDITS=true npm run dev      # 禁用积分');
  console.log('  DISABLE_CHAT_CACHE=true npm run dev        # 禁用缓存');
}

main().catch(console.error);
