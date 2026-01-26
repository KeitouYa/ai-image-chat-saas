# 🚀 立即运行测试 - 当前步骤

## ✅ 步骤1: 服务器已启动

服务器正在新窗口中运行，日志保存到 `metrics.log`

**检查服务器状态**:
- 打开浏览器访问: http://localhost:3000
- 如果能看到应用界面，说明服务器正常运行 ✅

---

## 📋 步骤2: 在浏览器中运行测试脚本

### 2.1 打开聊天页面
访问: **http://localhost:3000/chat**

### 2.2 登录应用
使用 Clerk 认证登录

### 2.3 打开浏览器控制台
- 按 **F12** 或右键 → "检查"
- 切换到 **Console** 标签

### 2.4 运行测试脚本

**方法A: 复制文件内容**
1. 打开项目中的 `browser-test-script.js` 文件
2. 复制全部内容
3. 粘贴到浏览器控制台
4. 按 Enter 运行

**方法B: 直接复制下面的代码**

```javascript
(function() {
  const messages = ["What is React?", "Explain TypeScript", "What is Next.js?", "How does caching work?", "What is MongoDB?", "What is Redis?", "Explain async programming", "What are React hooks?", "What is TypeScript?", "How does Next.js work?"];
  const total = 300;
  const warmup = 50;
  let currentCount = 0;
  let warmupDone = false;
  
  async function sendMessage(msg) {
    const input = document.querySelector('input[type="text"]') || document.querySelector('textarea') || document.querySelector('input[placeholder*="message" i]');
    const form = input?.closest('form') || document.querySelector('form');
    if (!input || !form) {
      console.error('❌ 找不到输入框或表单');
      return false;
    }
    try {
      input.value = msg;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 1500));
      return true;
    } catch (err) {
      console.error('发送失败:', err);
      return false;
    }
  }
  
  async function runTest() {
    console.log('🚀 开始性能测试');
    console.log(`📊 Warmup ${warmup}次, 测试 ${total}次\n`);
    
    console.log('🔥 Warmup阶段...');
    for (let i = 0; i < warmup; i++) {
      await sendMessage(messages[i % messages.length]);
      if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${warmup}`);
    }
    
    console.log('✅ Warmup完成\n📊 开始实际测试...');
    const startTime = Date.now();
    
    for (let i = 0; i < total; i++) {
      await sendMessage(messages[i % messages.length]);
      if ((i + 1) % 50 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`  进度: ${i + 1}/${total} (${(i + 1) / elapsed).toFixed(1)} req/s)`);
      }
    }
    
    console.log(`\n✅ 测试完成！总时间: ${((Date.now() - startTime) / 1000).toFixed(1)}秒`);
    console.log('📝 现在可以停止服务器并解析日志了');
  }
  
  runTest().catch(err => console.error('❌ 测试失败:', err));
})();
```

### 2.5 观察进度

控制台会显示：
- Warmup进度
- 测试进度（每50次显示一次）
- 完成提示

**预计时间**: 约 5-10 分钟（取决于响应速度）

---

## 📋 步骤3: 停止服务器并解析日志

### 3.1 测试完成后，停止服务器

在运行服务器的 PowerShell 窗口中按 **Ctrl+C**

### 3.2 解析日志

在当前终端运行：

```powershell
node scripts/parse-all-metrics.js metrics.log
```

### 3.3 查看真实数据

```powershell
Get-Content all-performance-metrics.json
```

---

## 🎯 当前状态

- [x] **步骤1**: 服务器已启动（在新窗口）
- [ ] **步骤2**: 等待你在浏览器中运行脚本
- [ ] **步骤3**: 等待测试完成后解析

---

## 💡 提示

1. **如果找不到输入框**: 确保在 `/chat` 页面，并且已登录
2. **如果脚本报错**: 检查页面元素，可能需要调整选择器
3. **测试时间**: 约 5-10 分钟，请耐心等待
4. **观察日志**: 在服务器窗口中可以看到 `[metric]` 日志输出

---

## 🆘 如果遇到问题

### 问题: 服务器未启动
**解决**: 手动启动
```powershell
$env:METRICS_ENABLED="true"
npm run dev *> metrics.log
```

### 问题: 脚本找不到元素
**解决**: 
1. 确保在聊天页面
2. 检查页面是否完全加载
3. 尝试手动发送一条消息，确认页面正常工作

### 问题: 测试中断
**解决**: 可以重新运行脚本，会继续发送请求

---

**现在去浏览器运行脚本吧！** 🚀

完成后告诉我，我帮你解析数据！

