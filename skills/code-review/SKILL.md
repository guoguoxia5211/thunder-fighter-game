# 代码审查技能 (Code Review)

**版本：** 1.0  
**创建：** 2026-03-10  
**目标：** 在写代码时就发现问题，防止低级错误

---

## 🎯 核心原则

**问题发现得越早，修复成本越低。**

审查不是事后诸葛亮，是编码过程的一部分。

---

## 📦 技术栈

### 静态分析
- **ESLint** - JavaScript 代码检查
- **Prettier** - 代码格式化
- **Stylelint** - CSS 检查（如有）

### 安全扫描
- **npm audit** - 依赖漏洞检查
- **SonarQube** - 代码质量平台（可选）
- **Semgrep** - 安全模式扫描

### 代码质量
- **Complexity** - 圈复杂度检查
- **Duplication** - 重复代码检测
- **TODO/FIXME** - 技术债务追踪

---

## 📁 项目结构

```
/project-root
├── .eslintrc.js         # ESLint 配置
├── .prettierrc          # Prettier 配置
├── .eslintignore        # 忽略文件
├── package.json
└── scripts/
    └── code-review.sh   # 审查脚本
```

---

## 🔧 审查流程

### 编码中审查 (实时)

```bash
# ESLint 实时检查
npx eslint src/**/*.js --fix

# Prettier 格式化
npx prettier --write src/**/*.js
```

### 提交前审查 (Pre-commit)

```bash
# 1. 语法检查
npm run lint

# 2. 格式化检查
npm run format:check

# 3. 安全扫描
npm audit

# 4. 复杂度检查
npx eslint --rule 'complexity: [error, {max: 10}]'
```

### 交付前审查 (完整)

```bash
# 完整审查流程
./scripts/code-review.sh

# 输出审查报告
# 修复所有问题
# 再次审查确认
```

---

## 📋 审查清单

### 必查项 (Blocker)

| 检查项 | 工具 | 标准 |
|--------|------|------|
| 语法错误 | ESLint | 0 错误 |
| 未定义变量 | ESLint | 0 |
| 未使用变量 | ESLint | 0 |
| console.log 残留 | ESLint | 0 (调试用除外) |
| 安全漏洞 | npm audit | 0 高危 |
| 无限循环风险 | 人工 + ESLint | 0 |

### 应查项 (Warning)

| 检查项 | 工具 | 标准 |
|--------|------|------|
| 代码格式 | Prettier | 100% 一致 |
| 函数复杂度 | ESLint | <10 |
| 文件长度 | ESLint | <500 行 |
| 重复代码 | 人工/工具 | <5% |
| TODO/FIXME | grep | 有记录 |

### 游戏开发专项

| 检查项 | 为什么 | 工具 |
|--------|--------|------|
| 魔法数字 | 游戏参数应配置化 | 人工 |
| 帧率敏感代码 | requestAnimationFrame 使用 | 人工 |
| 内存泄漏风险 | 事件监听器清理 | ESLint + 人工 |
| 碰撞检测优化 | 空间分区/四叉树 | 人工 |
| 资源加载 | 预加载/懒加载 | 人工 |

---

## 📝 审查报告格式

```markdown
## 🔍 代码审查报告

**审查时间：** YYYY-MM-DD HH:mm
**审查范围：** [文件/目录]
**审查者：** [AI/工具]

### 📊 总览
- 文件数：N
- 代码行数：N
- 问题总数：N

### 🚨 Blocker (必须修复)
| 文件 | 行号 | 问题 | 建议 |
|------|------|------|------|
| game.js | 45 | 未定义变量 `playerScore` | 声明变量或检查拼写 |
| utils.js | 23 | 安全漏洞：依赖 X 有 CVE | 升级到 v2.0.1 |

### ⚠️ Warnings (建议修复)
| 文件 | 行号 | 问题 | 建议 |
|------|------|------|------|
| player.js | 78 | 函数复杂度 12 > 10 | 拆分为多个函数 |
| enemy.js | 156 | 重复代码块 | 提取为公共函数 |

### ✅ Passed
- 语法检查：通过
- 格式检查：通过
- 安全扫描：通过

### 📈 质量评分
- 代码风格：95/100
- 可维护性：88/100
- 安全性：92/100
- **总分：92/100**

### 🔧 已自动修复
- [x] 格式问题 5 处 → Prettier 修复
- [x] 简单 ESLint 问题 3 处 → --fix 修复

### ❗ 待手动修复
- [ ] Blocker 问题 2 处（见上表）
- [ ] Warning 问题 5 处（见上表）

### 📋 结论
- [ ] 通过，可以交付
- [x] 需修复 Blocker 问题后重新审查
```

---

## 🚨 游戏规则 (游戏开发专项)

### 禁止模式

```javascript
// ❌ 坏：魔法数字
function movePlayer() {
  player.x += 5;  // 为什么是 5?
}

// ✅ 好：配置化
const CONFIG = {
  PLAYER_SPEED: 5
};
function movePlayer() {
  player.x += CONFIG.PLAYER_SPEED;
}
```

```javascript
// ❌ 坏：每帧创建对象
function gameLoop() {
  const temp = {};  // 垃圾收集压力
  // ...
  requestAnimationFrame(gameLoop);
}

// ✅ 好：对象池/复用
const temp = {};
function gameLoop() {
  // 复用 temp
  requestAnimationFrame(gameLoop);
}
```

```javascript
// ❌ 坏：未清理事件监听器
function init() {
  window.addEventListener('resize', handleResize);
  // 从未移除！
}

// ✅ 好：成对清理
function init() {
  window.addEventListener('resize', handleResize);
}
function cleanup() {
  window.removeEventListener('resize', handleResize);
}
```

---

## 🔧 快速开始

### 为新项目添加审查

```bash
# 1. 进入项目目录
cd /root/.openclaw/workspace/[project-name]

# 2. 安装依赖
npm install --save-dev eslint prettier

# 3. 初始化配置
npx eslint --init
npx prettier --write .

# 4. 使用技能提供的模板
# (复制 .eslintrc.js 和 .prettierrc)

# 5. 运行审查
npm run lint
npm run format

# 6. 修复问题
npm run lint -- --fix
```

---

## 🧠 自主学习

每次审查后记录：
1. 最常见的问题类型是什么？
2. 哪些问题可以自动化修复？
3. 如何预防这类问题再次出现？

---

*此技能在每次代码提交和交付前强制执行*
