/**
 * 浏览器测试脚本 - 在浏览器控制台运行
 * 
 * 使用方法:
 * 1. 打开 http://localhost:3000/chat
 * 2. 登录应用
 * 3. 按 F12 打开开发者工具
 * 4. 切换到 Console 标签
 * 5. 复制粘贴下面的代码并运行
 */

(function() {
  const messages = [
    "What is React?",
    "Explain TypeScript", 
    "What is Next.js?",
    "How does caching work?",
    "What is MongoDB?",
    "What is Redis?",
    "Explain async programming",
    "What are React hooks?",
    "What is TypeScript?",
    "How does Next.js work?"
  ];
  
  const total = 300; // 总请求数
  const warmup = 50; // Warmup数量
  
  let currentCount = 0;
  let warmupDone = false;
  
  async function sendMessage(msg) {
    // 查找输入框和表单
    const input = document.querySelector('input[type="text"]') || 
                  document.querySelector('textarea') ||
                  document.querySelector('input[placeholder*="message" i]') ||
                  document.querySelector('input[placeholder*="chat" i]');
    
    const form = input?.closest('form') || 
                 document.querySelector('form');
    
    if (!input || !form) {
      console.error('❌ 找不到输入框或表单，请确保在聊天页面');
      return false;
    }
    
    try {
      // 设置消息
      input.value = msg;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      // 提交表单
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
      
      // 等待响应
      await new Promise(r => setTimeout(r, 1500));
      return true;
    } catch (err) {
      console.error('发送消息失败:', err);
      return false;
    }
  }
  
  async function runTest() {
    console.log('🚀 开始性能测试');
    console.log(`📊 配置: Warmup ${warmup}次, 测试 ${total}次, 总计 ${warmup + total}次\n`);
    
    // Warmup阶段
    console.log('🔥 Warmup阶段...');
    for (let i = 0; i < warmup; i++) {
      const msg = messages[i % messages.length];
      await sendMessage(msg);
      currentCount++;
      
      if ((i + 1) % 10 === 0) {
        console.log(`  Warmup: ${i + 1}/${warmup}`);
      }
    }
    
    console.log('✅ Warmup完成\n');
    warmupDone = true;
    currentCount = 0;
    
    // 实际测试阶段
    console.log('📊 开始实际测试...');
    const startTime = Date.now();
    
    for (let i = 0; i < total; i++) {
      const msg = messages[i % messages.length];
      const success = await sendMessage(msg);
      currentCount++;
      
      if ((i + 1) % 50 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = ((i + 1) / elapsed).toFixed(1);
        console.log(`  进度: ${i + 1}/${total} (${rate} req/s)`);
      }
    }
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ 测试完成！`);
    console.log(`   总时间: ${totalTime}秒`);
    console.log(`   平均速度: ${(total / totalTime).toFixed(1)} req/s`);
    console.log(`\n📝 现在可以停止服务器并解析日志了`);
  }
  
  // 开始测试
  runTest().catch(err => {
    console.error('❌ 测试失败:', err);
  });
  
  // 返回控制函数（可选）
  return {
    stop: () => {
      console.log('⏹️  测试已停止');
      currentCount = total + warmup; // 强制停止
    },
    status: () => {
      return {
        warmupDone,
        currentCount,
        total: warmup + total
      };
    }
  };
})();

