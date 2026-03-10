# 自动化测试技能 (Auto Test)

**版本：** 1.0  
**创建：** 2026-03-10  
**目标：** 让 VBR 验证真正自动化，不依赖手动浏览器测试

---

## 🎯 核心原则

**代码写完 = 测试跑完 = 全部通过**

测试不是可选项，是交付的必要条件。

---

## 📦 技术栈

### 单元测试
- **Jest** - JavaScript 测试框架
- 覆盖：工具函数、游戏逻辑、算法

### E2E 测试
- **Playwright** - 浏览器自动化
- 覆盖：UI 交互、游戏流程、移动端适配

### 覆盖率
- **Istanbul/nyc** - 代码覆盖率
- 目标：核心逻辑 ≥80%

---

## 📁 项目结构

```
/project-root
├── tests/
│   ├── unit/              # 单元测试
│   │   ├── game.test.js
│   │   ├── player.test.js
│   │   └── utils.test.js
│   ├── e2e/               # E2E 测试
│   │   ├── game-flow.spec.js
│   │   └── mobile.spec.js
│   └── fixtures/          # 测试数据
├── jest.config.js         # Jest 配置
├── playwright.config.js   # Playwright 配置
└── package.json
```

---

## 🔧 测试流程

### 单元测试流程

```bash
# 1. 安装依赖
npm install --save-dev jest

# 2. 创建测试文件
tests/unit/game.test.js

# 3. 运行测试
npm test

# 4. 查看覆盖率
npm test -- --coverage
```

### E2E 测试流程

```bash
# 1. 安装依赖
npm install --save-dev @playwright/test

# 2. 创建测试文件
tests/e2e/game-flow.spec.js

# 3. 运行测试
npx playwright test

# 4. 生成报告
npx playwright test --reporter=html
```

---

## 📝 测试用例模板

### 单元测试模板

```javascript
// tests/unit/game.test.js

describe('游戏逻辑测试', () => {
  describe('玩家移动', () => {
    test('向右移动应该增加 x 坐标', () => {
      const player = new Player(100, 100);
      player.move('right');
      expect(player.x).toBeGreaterThan(100);
    });

    test('移动不应超出边界', () => {
      const player = new Player(800, 100);
      player.move('right');
      expect(player.x).toBeLessThanOrEqual(800);
    });
  });

  describe('碰撞检测', () => {
    test('子弹击中敌机应该触发爆炸', () => {
      const bullet = new Bullet(100, 100);
      const enemy = new Enemy(100, 100);
      const collision = checkCollision(bullet, enemy);
      expect(collision).toBe(true);
    });
  });
});
```

### E2E 测试模板

```javascript
// tests/e2e/game-flow.spec.js

import { test, expect } from '@playwright/test';

test('游戏完整流程', async ({ page }) => {
  // 1. 打开游戏
  await page.goto('file:///root/.openclaw/workspace/snake-ultimate/index.html');
  
  // 2. 检查主菜单加载
  await expect(page.locator('#start-btn')).toBeVisible();
  
  // 3. 点击开始游戏
  await page.click('#start-btn');
  
  // 4. 检查游戏开始
  await expect(page.locator('#game-canvas')).toBeVisible();
  
  // 5. 模拟操作
  await page.keyboard.press('ArrowRight');
  
  // 6. 检查分数变化
  const score = await page.locator('#score').textContent();
  expect(parseInt(score)).toBeGreaterThanOrEqual(0);
  
  // 7. 截图记录
  await page.screenshot({ 
    path: 'tests/screenshots/game-flow.png' 
  });
});

test('移动端适配', async ({ page }) => {
  // 模拟手机屏幕
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('file:///root/.openclaw/workspace/snake-ultimate/index.html');
  
  // 检查触摸按钮可见
  await expect(page.locator('.touch-controls')).toBeVisible();
});
```

---

## ✅ VBR 集成

### 代码交付前必须执行

```bash
# 1. 运行所有测试
npm test

# 2. 检查覆盖率
npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'

# 3. E2E 测试
npx playwright test

# 4. 生成测试报告
npx playwright test --reporter=html
```

### 验证汇报格式

```markdown
## ✅ VBR 自动化测试完成

**测试时间：** YYYY-MM-DD HH:mm
**测试范围：** [项目名称]

### 测试结果
- 单元测试：✅ 25/25 通过
- E2E 测试：✅ 8/8 通过
- 代码覆盖率：82%

### 测试截图
[DING:IMAGE path="/root/.openclaw/workspace/tests/screenshots/game-flow.png"]

### 发现的问题 (如有)
- 测试失败 1 → 已修复 → 重新测试通过
- 覆盖率不足 → 补充测试用例 → 达标

### 结论
所有测试通过，功能可用，可以交付。
```

---

## 🚨 禁止行为

- ❌ 只写代码不写测试
- ❌ 测试失败还交付
- ❌ 覆盖率 <80% 还说完成
- ❌ 手动测试代替自动化测试

---

## 🧠 自主学习

每次测试后记录：
1. 哪些测试失败了？为什么？
2. 是否漏测了某些场景？
3. 如何改进测试覆盖？

---

## 📦 快速开始

### 为新项目添加测试

```bash
# 1. 进入项目目录
cd /root/.openclaw/workspace/[project-name]

# 2. 初始化 npm (如果没有)
npm init -y

# 3. 安装测试依赖
npm install --save-dev jest @playwright/test

# 4. 创建测试目录
mkdir -p tests/unit tests/e2e tests/screenshots

# 5. 创建配置文件
# (使用技能提供的模板)

# 6. 编写第一个测试
# (参考上面的模板)

# 7. 运行测试
npm test
```

---

*此技能强制执行，所有代码交付前必须通过测试*
