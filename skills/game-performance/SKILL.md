# 游戏性能分析技能 (Game Performance)

**版本：** 1.0  
**创建：** 2026-03-10  
**目标：** 实时监控游戏帧率、内存、性能瓶颈

---

## 🎯 核心原则

**没有数据，就没有优化。**

游戏卡不卡，内存漏不漏，用数据说话。

---

## 📦 监控指标

### 核心指标 (必监控)

| 指标 | 健康值 | 警告值 | 危险值 |
|------|--------|--------|--------|
| FPS (帧率) | ≥60 | 30-60 | <30 |
| 帧时间 | ≤16ms | 16-33ms | >33ms |
| 内存使用 | <100MB | 100-200MB | >200MB |
| 内存增长 | 稳定 | 缓慢增长 | 持续增长 (泄漏) |

### 游戏专项指标

| 指标 | 说明 | 监控方式 |
|------|------|----------|
| 实体数量 | 敌机/子弹/粒子数 | 计数器 |
| 碰撞检测次数 | 每帧碰撞计算次数 | 计数器 |
| 绘制调用 | Canvas draw 调用次数 | 计数器 |
| 事件监听器 | 未清理的监听器数量 | 定期扫描 |

---

## 🔧 监控工具

### 内置监控面板

```javascript
// performance-monitor.js
class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameTime = 0;
    this.memory = 0;
    this.entities = { bullets: 0, enemies: 0, particles: 0 };
    this.lastTime = performance.now();
    this.frameCount = 0;
  }

  update() {
    const now = performance.now();
    this.frameTime = now - this.lastTime;
    this.frameCount++;
    
    // 每秒计算一次 FPS
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
      
      // 内存使用 (仅 Chrome/Edge 支持)
      if (performance.memory) {
        this.memory = performance.memory.usedJSHeapSize / 1048576; // MB
      }
    }
  }

  getReport() {
    return {
      fps: this.fps,
      frameTime: this.frameTime.toFixed(2) + 'ms',
      memory: this.memory.toFixed(2) + 'MB',
      entities: { ...this.entities }
    };
  }

  // 性能警告
  checkPerformance() {
    const warnings = [];
    if (this.fps < 30) warnings.push('⚠️ 帧率过低：' + this.fps);
    if (this.memory > 200) warnings.push('⚠️ 内存过高：' + this.memory.toFixed(1) + 'MB');
    if (this.entities.bullets > 100) warnings.push('⚠️ 子弹过多：' + this.entities.bullets);
    return warnings;
  }
}
```

### HUD 显示

```javascript
// performance-hud.js
class PerformanceHUD {
  constructor(monitor) {
    this.monitor = monitor;
    this.createHUD();
  }

  createHUD() {
    const hud = document.createElement('div');
    hud.id = 'perf-hud';
    hud.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      color: #0f0;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      border-radius: 5px;
    `;
    document.body.appendChild(hud);
    this.hud = hud;
  }

  update() {
    const report = this.monitor.getReport();
    const warnings = this.monitor.checkPerformance();
    
    this.hud.innerHTML = `
      <div>FPS: ${report.fps}</div>
      <div>Frame: ${report.frameTime}</div>
      <div>Memory: ${report.memory}</div>
      <div>Entities: ${report.entities.bullets}+${report.entities.enemies}</div>
      ${warnings.map(w => `<div style="color:yellow">${w}</div>`).join('')}
    `;
  }
}
```

---

## 📋 性能测试流程

### 基准测试

```javascript
// performance-benchmark.js
async function runBenchmark() {
  const results = {
    fps: [],
    memory: [],
    frameTime: []
  };

  // 运行 60 秒
  for (let i = 0; i < 60; i++) {
    // 模拟游戏负载
    spawnEnemies(10);
    spawnBullets(20);
    
    // 收集数据
    results.fps.push(monitor.fps);
    results.memory.push(monitor.memory);
    results.frameTime.push(monitor.frameTime);
    
    await sleep(1000);
  }

  // 生成报告
  return {
    avgFps: average(results.fps),
    minFps: Math.min(...results.fps),
    maxFps: Math.max(...results.fps),
    avgMemory: average(results.memory),
    memoryGrowth: results.memory[results.memory.length - 1] - results.memory[0]
  };
}
```

### 压力测试

```javascript
// 压力测试：大量实体
function stressTest() {
  console.log('开始压力测试...');
  
  // 生成 100 个敌机
  for (let i = 0; i < 100; i++) {
    spawnEnemy();
  }
  
  // 生成 200 发子弹
  for (let i = 0; i < 200; i++) {
    spawnBullet();
  }
  
  // 监控性能
  setTimeout(() => {
    const report = monitor.getReport();
    console.log('压力测试结果:', report);
  }, 5000);
}
```

---

## 📊 性能报告格式

```markdown
## 📊 性能测试报告

**测试时间：** YYYY-MM-DD HH:mm
**测试项目：** [游戏名称]
**测试时长：** 60 秒

### 📈 核心指标
| 指标 | 平均值 | 最低值 | 最高值 | 健康度 |
|------|--------|--------|--------|--------|
| FPS | 58 | 45 | 60 | ✅ 良好 |
| 帧时间 | 17ms | 16ms | 22ms | ✅ 良好 |
| 内存 | 85MB | 80MB | 92MB | ✅ 良好 |
| 内存增长 | +2MB | - | - | ✅ 稳定 |

### 🎮 游戏负载
- 敌机数量：10-20
- 子弹数量：5-50
- 粒子数量：0-100
- 碰撞检测：~500 次/帧

### ⚠️ 性能警告
- 无

### 🔍 瓶颈分析
- 主要消耗：碰撞检测 (40%)
- 次要消耗：粒子渲染 (25%)
- 建议：使用空间分区优化碰撞

### 📋 结论
- [x] 性能达标，可以发布
- [ ] 需要优化 (见建议)
```

---

## 🚨 性能优化建议库

### 常见问题及解决方案

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| FPS <30 | 碰撞检测过多 | 使用四叉树/空间分区 |
| FPS <30 | 绘制调用过多 | 合并绘制/使用雪碧图 |
| FPS <30 | 粒子过多 | 限制最大数量/对象池 |
| 内存增长 | 事件监听器未清理 | 确保 removeEventListener |
| 内存增长 | 数组只增不减 | 定期清理/对象池 |
| 内存增长 | 闭包引用 | 避免在循环中创建闭包 |

---

## 🔧 快速集成

### 为现有游戏添加监控

```javascript
// 1. 引入监控脚本
<script src="performance-monitor.js"></script>

// 2. 初始化和启动
const monitor = new PerformanceMonitor();
const hud = new PerformanceHUD(monitor);

// 3. 在游戏循环中更新
function gameLoop() {
  monitor.update();
  hud.update();
  
  // 原有游戏逻辑...
  
  requestAnimationFrame(gameLoop);
}
```

---

## 🧠 自主学习

每次性能测试后记录：
1. 发现了什么性能问题？
2. 如何优化的？
3. 优化效果如何？

---

*此技能在所有游戏项目交付前强制使用*
