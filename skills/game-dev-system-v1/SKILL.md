# 游戏开发系统 1.1 (Game Development System V1.1)

**版本：** 1.1.0  
**创建日期：** 2026-03-11  
**制定者：** 雷雷  
**优先级：** 🔥 P0 (所有游戏项目强制执行)

---

## 🎯 核心理念

**三套系统一体，版本号优先，自动同步。**

1. **🎮 游戏逻辑系统** - 核心玩法
2. **🎨 美术替换系统** - 实时换皮
3. **⚙️ 数值配置系统** - 实时调值

---

## 📋 三大系统架构

### 1. 游戏逻辑系统 (game.js)

**职责：** 实现游戏核心玩法

**关键特性：**
- ✅ 使用图片渲染（支持美术替换）
- ✅ 所有数值从 GAME_CONFIG 读取
- ✅ 支持全屏自由拖动
- ✅ 追踪导弹曲线系统
- ✅ 背景流动效果

**文件结构：**
```
js/game.js
├── class ThunderFighter
├── loadImages()      - 加载图片资源
├── setupEvents()     - 事件监听
├── update()          - 逻辑更新
├── draw()            - 渲染绘制
└── applyConfig()     - 应用配置
```

---

### 2. 美术替换系统 (editor.js)

**职责：** 实时替换游戏美术资源

**关键特性：**
- ✅ 密码保护（默认：admin123）
- ✅ 资源列表自动识别
- ✅ 上传后自动重命名
- ✅ 替换后实时预览
- ✅ 一键部署到 GitHub

**文件结构：**
```
js/editor.js
├── RESOURCES[]       - 资源列表（友好名称）
├── getAssetPath()    - 路径映射
├── openEditor()      - 打开编辑器
├── handleFile()      - 处理上传
├── replace()         - 替换资源
└── deploy()          - 一键部署
```

**资源列表格式：**
```javascript
const RESOURCES = [
  { id: 'player', name: '✈️ 我方战机', category: '战机', color: '#4ECDC4' },
  { id: 'enemy1', name: '👾 敌机 Type-1', category: '敌机', color: '#FF6B6B' },
  { id: 'laser', name: '🔫 激光武器', category: '武器', color: '#00FF00' },
  // 新功能自动添加到这里
];
```

---

### 3. 数值配置系统 (config.js + config-editor.js)

**职责：** 集中管理所有游戏数值

**关键特性：**
- ✅ 所有数值集中管理
- ✅ 每种敌机独立配置
- ✅ 实时调整即时生效
- ✅ 配置保存到本地
- ✅ 密码保护（默认：admin123）

**文件结构：**
```
js/config.js          - 数值配置定义
js/config-editor.js   - 配置编辑器 UI
```

**配置格式：**
```javascript
window.GAME_CONFIG = {
  player: {
    speed: 300,
    lives: 3,
    bulletSpeed: 500
  },
  enemies: {
    enemy1: { speed: 150, hp: 1, score: 100 },
    enemy2: { speed: 100, hp: 3, score: 300 },
    enemy3: { speed: 80, hp: 5, score: 500 }
  },
  bullets: {
    normal: { speed: 500, damage: 1 },
    missile: { speed: 300, damage: 2 }
  }
  // 新功能自动添加到这里
};
```

---

## 🔄 新功能自动同步规则

**每次添加新功能（如"激光"），必须同步到三套系统：**

| 系统 | 同步内容 | 完成标志 |
|------|----------|----------|
| **🎮 游戏逻辑** | game.js 实现功能 | 功能可运行 |
| **🎨 美术替换** | editor.js 添加资源 | 可替换美术 |
| **⚙️ 数值配置** | config.js 添加配置 | 可调整数值 |

---

### 同步检查清单

```markdown
### 添加新功能时（如"激光武器"）

#### 1. 先升级版本号
- [ ] VERSION.json 第二位 +1（新功能）
- [ ] 填写变更日志

#### 2. 游戏逻辑 (game.js)
- [ ] 实现激光发射逻辑
- [ ] 使用 GAME_CONFIG.laser 读取数值
- [ ] 测试通过

#### 3. 美术替换 (editor.js)
- [ ] RESOURCES 添加：
  ```javascript
  { id: 'laser', name: '🔫 激光武器', category: '武器', color: '#00FF00' }
  ```
- [ ] getAssetPath 添加：
  ```javascript
  laser: 'weapons/laser.png'
  ```
- [ ] 创建资源目录 assets/weapons/

#### 4. 数值配置 (config.js)
- [ ] GAME_CONFIG 添加：
  ```javascript
  laser: {
    speed: 600,
    damage: 3,
    cooldown: 500,
    width: 15,
    height: 30
  }
  ```

#### 5. 提交
- [ ] Git 提交带版本号
- [ ] 创建 Git 标签
- [ ] 推送 GitHub
```

---

## 📊 版本号规范（铁律）

### 第一前置条件

**无论做什么修改，必须先升级版本号！**

```
❌ 错误：先修改代码 → 再升级版本号
✅ 正确：先升级版本号 → 再修改代码
```

### 升级规则

| 修改类型 | 升级位置 | 示例 |
|----------|----------|------|
| **新功能** | 第二位 | V1.0.2 → V1.1.0 |
| **BUG 修复** | 第三位 | V1.0.2 → V1.0.3 |
| **重大更新** | 第一位 | V1.0.2 → V2.0.0 |

### 提交流程

```bash
# 1. 先升级 VERSION.json
{
  "version": "V1.1.0",
  "changes": ["新增：激光武器系统"]
}

# 2. 然后修改代码
# 修改 game.js / editor.js / config.js

# 3. 提交
git add .
git commit -m "V1.1.0 新增：激光武器系统"
git tag -a "V1.1.0" -m "V1.1.0"
git push origin master
git push origin V1.1.0
```

---

## 🎮 游戏开发流程 1.0

### 阶段 1：需求确认
```
用户下达任务 → 创建 PRD → 用户确认
```

### 阶段 2：开发实现
```
开发前检查 → 执行开发 → 中期汇报 (50%)
```

### 阶段 3：QA 测试（交叉测试）
```
1. test-master (BUG 扫描)
2. afrexai-qa-testing-engine (QA 验证)
3. workflow-enhancements (证据包)
```

### 阶段 4：美术替换集成
```
每个游戏自动包含：
- 🎨 美术替换按钮（右下角）
- 🔐 密码保护（admin123）
- 📱 移动端友好弹窗
- 🔄 实时游戏预览
- 🚀 一键部署
```

### 阶段 5：版本管理
```
版本号规则：V[大版本].[功能版本].[BUG 版本]
每次修改必须升级版本号
```

### 阶段 6：部署同步
```
三致原则：GitHub = 服务器 = 测试链接
```

---

## 🚨 死规则（违反必究）

### 🔴 第一死规则：版本号优先

**无论做什么修改，必须先升级版本号！**

```
❌ 错误：先修改代码 → 再升级版本号
✅ 正确：先升级 VERSION.json → 再修改代码
```

| 修改类型 | 升级位置 | 示例 |
|----------|----------|------|
| **新功能** | 第二位 | V1.0.2 → V1.1.0 |
| **BUG 修复** | 第三位 | V1.0.2 → V1.0.3 |
| **重大更新** | 第一位 | V1.0.0 → V2.0.0 |

**违反后果：** 不允许提交代码

---

### 🔴 第二死规则：禁止擅自简化功能

**不允许擅自减少或简化正在开发的游戏功能！**

```
❌ 错误：用户要求做 10 个功能，只做 8 个
❌ 错误：用户要求做完整功能，只做简化版
✅ 正确：功能做不完 → 请示用户 → 用户同意后再简化
```

**例外：** 只有用户明确说"这个功能不要了"或"简化这个功能"

**违反后果：** 立即回滚 + 重新完成

---

### 🔴 第三死规则：禁止重置已替换的美术资源

**修改代码时，绝对不允许重置用户已替换的美术资源！**

```
❌ 错误：修改代码后，用户替换的美术全变回默认图
❌ 错误：重新部署后，assets 目录被覆盖
✅ 正确：修改代码前 → 备份 assets → 修改后恢复用户替换的资源
```

**原因：** 用户可能花了很多时间替换美术，重置是致命错误

**违反后果：** 立即恢复用户资源 + 记录到教训

---

## 🚨 其他禁止行为

### 需求阶段
- ❌ PRD 未确认就开工
- ❌ 需求理解不完整就开发

### 开发阶段
- ❌ 不做开发前检查
- ❌ 进度 50% 时不汇报
- ❌ 新功能不同步三套系统

### 测试阶段
- ❌ 让用户当测试员
- ❌ 跳过任何一轮测试

### 版本管理
- ❌ 版本号不一致
- ❌ 更新后不做版本管理
- ❌ 不写变更日志

### 部署
- ❌ 用 Python HTTP 服务（必须用 Nginx）
- ❌ 不提供在线测试链接

---

## 📁 标准项目结构

```
/project-name/
├── index.html              # 主页面
├── js/
│   ├── game.js             # 游戏逻辑
│   ├── editor.js           # 美术替换
│   ├── config.js           # 数值配置
│   └── config-editor.js    # 配置编辑器
├── css/
│   └── style.css           # 样式
├── assets/
│   ├── player/             # 玩家资源
│   ├── enemies/            # 敌机资源
│   ├── bullets/            # 子弹资源
│   ├── items/              # 道具资源
│   ├── explosions/         # 爆炸效果
│   └── bg/                 # 背景资源
├── VERSION.json            # 版本文件
└── CHANGELOG.md            # 变更日志
```

---

## 🎯 核心文件说明

### index.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>游戏名称</title>
</head>
<body>
  <div class="game-container">
    <!-- 游戏 UI -->
    <div class="game-ui">
      <div class="version-panel">
        <div class="label">版本</div>
        <div class="value" id="version">加载中...</div>
      </div>
    </div>
    
    <!-- 游戏画布 -->
    <canvas id="gameCanvas"></canvas>
    
    <!-- 功能按钮 -->
    <button class="editor-btn" onclick="openEditor()">🎨 美术替换</button>
  </div>
  
  <!-- 脚本加载顺序（重要） -->
  <script src="js/config.js"></script>           <!-- 1. 先加载配置 -->
  <script src="js/game.js"></script>             <!-- 2. 游戏逻辑 -->
  <script src="js/editor.js"></script>           <!-- 3. 美术替换 -->
  <script src="js/config-editor.js"></script>    <!-- 4. 配置编辑器 -->
</body>
</html>
```

### VERSION.json
```json
{
  "name": "project-name",
  "version": "V1.1.0",
  "buildTime": "2026-03-11T04:00:00+08:00",
  "gitCommit": "",
  "changes": [
    "新增：激光武器系统",
    "优化：三套系统自动同步"
  ]
}
```

---

## 🧠 经验教训（持续更新）

### 2026-03-11 教训

1. **Canvas 绘制顺序**
   - 问题：先绘制图片后绘制背景，导致黑屏
   - 解决：先绘制渐变背景，再叠加图片
   - 教训：绘制顺序很重要

2. **版本号缓存**
   - 问题：浏览器缓存 VERSION.json
   - 解决：添加时间戳 `VERSION.json?t=${Date.now()}`
   - 教训：版本号必须强制刷新

3. **物体可见性**
   - 问题：物体颜色与背景相近，看不见
   - 解决：所有物体添加白色边框
   - 教训：可见性要保证

---

## 📋 死规则检查清单

**每次修改前必须确认：**

```markdown
### 修改前检查
- [ ] 已升级 VERSION.json（第三位 +1）
- [ ] 已填写变更日志
- [ ] 已备份用户替换的美术资源（assets 目录）

### 修改后检查
- [ ] 功能完整性（未擅自简化）
- [ ] 用户替换的美术资源已恢复
- [ ] 版本号显示正确
- [ ] Git 提交带版本号
- [ ] Git 标签已创建
```

**每次开发新功能前必须确认：**

```markdown
### 新功能同步检查
- [ ] game.js 实现功能
- [ ] editor.js 添加资源列表
- [ ] config.js 添加数值配置
- [ ] assets/ 创建资源目录
- [ ] VERSION.json 第二位 +1
- [ ] 测试通过
```

---

## 📖 快速参考

### 添加新功能流程
```
1. 升级 VERSION.json（第二位 +1）
2. 实现游戏逻辑（game.js）
3. 添加美术资源（editor.js + assets/）
4. 添加数值配置（config.js）
5. 测试通过
6. Git 提交 + 标签
```

### 修复 BUG 流程
```
1. 升级 VERSION.json（第三位 +1）
2. 修复代码
3. 测试通过
4. Git 提交 + 标签
```

### 调整数值流程
```
1. 打开游戏 → 点击【⚙️ 数值配置】
2. 输入密码 admin123
3. 调整数值
4. 点击【⚡ 立即生效】
5. 点击【💾 保存配置】
```

### 替换美术流程
```
1. 打开游戏 → 点击【🎨 美术替换】
2. 输入密码 admin123
3. 选择资源 → 上传图片
4. 点击【🔄 替换】
5. 点击【🚀 一键部署】
```

---

## 📚 相关技能

| 技能 | 用途 |
|------|------|
| `game-prd` | PRD 需求文档化 |
| `workflow-enhancements` | 工作流增强 |
| `afrexai-qa-testing-engine` | QA 测试引擎 |
| `test-master` | 测试大师 |
| `auto-test` | 自动化测试 |
| `code-review` | 代码审查 |

---

*此技能为游戏开发标准流程，所有游戏项目必须遵守*
*版本号优先是第一铁律，新功能同步三套系统是核心要求*
