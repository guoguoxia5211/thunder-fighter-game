# 🎮 游戏开发流程 1.0

**发布日期：** 2026-03-10  
**制定者：** 雷雷  
**状态：** ✅ 正式使用

---

## 📋 核心理念

**每个游戏都内置美术替换系统，密码保护，实时预览。**

---

## 🔄 完整流程

### 阶段 1：需求确认
```
用户下达任务 → 创建 PRD → 用户确认
```

**产出：** PRD 文档（功能清单 + 验收标准）

---

### 阶段 2：开发实现
```
开发前检查 → 执行开发 → 中期汇报 (50%)
```

**产出：** 可玩游戏

---

### 阶段 3：QA 测试
```
交叉测试：
1. test-master (BUG 扫描)
2. afrexai-qa-testing-engine (QA 验证)
3. workflow-enhancements (证据包)
```

**产出：** 测试报告 + 证据包

---

### 阶段 4：美术替换集成
```
每个游戏自动包含：
- 🎨 美术替换按钮（右下角）
- 🔐 密码保护（默认：admin123）
- 📱 移动端友好弹窗
- 🔄 实时游戏预览
- 🚀 一键部署
```

**产出：** 内置美术编辑器的游戏

---

### 阶段 5：版本管理
```
版本规则：V[大版本].[功能版本].[BUG 版本]
- V1.x.x - 重大更新
- Vx.1.x - 功能增加
- Vx.x.1 - BUG 修复
```

**产出：** VERSION.json + Git 标签

---

### 阶段 6：部署同步
```
一键部署 → 本地保存 → GitHub 推送 → 服务器部署
```

**产出：** 在线测试链接

---

## 📦 标准项目结构

```
/project-name/
├── index.html              # 游戏主页面
├── editor.html             # 美术编辑页面 (可选)
├── js/
│   ├── game.js             # 游戏逻辑
│   └── editor.js           # 美术替换逻辑 (标准组件)
├── css/
│   └── style.css           # 样式
├── assets/
│   ├── gems/               # 宝石资源
│   ├── ui/                 # UI 资源
│   ├── effects/            # 特效资源
│   └── bg/                 # 背景资源
├── VERSION.json            # 版本文件
└── CHANGELOG.md            # 变更日志
```

---

## 🎨 美术替换系统（标准组件）

### 功能清单
- [x] 密码保护（默认：admin123）
- [x] 资源列表（自动识别）
- [x] 上传替换（真正覆盖文件）
- [x] 实时预览（替换后立即生效）
- [x] 一键部署（Git+ 推送）
- [x] 移动端友好

### 集成方式
```html
<!-- 在游戏页面添加 -->
<button class="editor-btn" onclick="openEditor()">🎨 美术替换</button>
<script src="js/editor.js"></script>
```

### 配置文件
```javascript
// editor.js 顶部配置
const EDITOR_CONFIG = {
  PASSWORD: 'admin123',  // 可自定义
  API_URL: 'http://182.92.166.51:8000/api',
  GAME_URL: '/match-3/'
};
```

---

## 🛠️ 后端服务

### FastAPI API (端口 8000)
```
POST /api/upload      - 上传图片
POST /api/replace     - 替换资源
POST /api/undo        - 撤销替换
POST /api/deploy      - 一键部署
GET  /api/status      - 系统状态
GET  /api/history     - 替换历史
```

### 系统服务
```bash
# Nginx (80 端口)
systemctl status nginx

# FastAPI (8000 端口)
systemctl status art-replacer-api
```

---

## 📊 质量保障

### 交叉测试
1. **test-master** - 单元测试 + BUG 扫描
2. **afrexai-qa-testing-engine** - QA 验证
3. **workflow-enhancements** - 证据包生成

### 交付标准
- [ ] 游戏可正常运行
- [ ] 所有功能通过测试
- [ ] FPS ≥60
- [ ] 控制台无报错
- [ ] 美术替换系统可用
- [ ] 版本号一致（本地=GitHub= 服务器）

---

## 🚀 新项目模板

### 创建流程
```bash
# 1. 复制标准模板
cp -r /root/.openclaw/workspace/template-game /root/.openclaw/workspace/new-game

# 2. 修改配置
cd new-game
# 修改 index.html 标题
# 修改 editor.js 的 GAME_URL

# 3. 完成！
```

### 标准模板包含
- ✅ 游戏框架（Canvas/DOM）
- ✅ 美术替换系统
- ✅ 版本管理
- ✅ 部署脚本

---

## 📝 文档清单

| 文档 | 位置 | 用途 |
|------|------|------|
| GAME-DEV-FLOW-V1.0.md | 根目录 | 本文件 |
| GAME-DEV-WORKFLOW-README.md | 根目录 | 快速参考 |
| WORKFLOW-RULES.md | 根目录 | 规范细节 |
| skills/game-dev-complete-workflow/SKILL.md | skills | 技能文档 |

---

## 🎯 核心原则

### 三致原则
**GitHub 仓库版本号 = 服务器版本号 = 在线测试链接版本号**

### 功能完整性
- ✅ 游戏必须可正常运行才交付
- ✅ 不擅自简化/删减任何功能
- ✅ 需求变更必须先请示用户

### QA 测试
- ✅ 所有功能必须通过 QA 测试
- ✅ 测试不通过 → 返回修复

### PRD 原则
- ✅ 需求不明确不开工
- ✅ PRD 文档必须用户确认

### 美术替换
- ✅ 每个游戏必须内置
- ✅ 密码保护
- ✅ 实时预览
- ✅ 一键部署

---

## 📈 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| V1.0 | 2026-03-10 | 初始发布 |

---

## ✅ 检查清单

### 开发前
- [ ] PRD 已创建
- [ ] PRD 已用户确认
- [ ] 功能清单明确
- [ ] 验收标准明确

### 开发中
- [ ] 开发前检查完成
- [ ] 中期汇报 (50% 进度)
- [ ] 代码审查通过

### 交付前
- [ ] QA 测试通过
- [ ] 测试证据包完整
- [ ] 版本号正确
- [ ] GitHub 已同步
- [ ] 服务器已部署
- [ ] 美术替换系统可用
- [ ] 在线测试链接可用

---

*此流程为正式标准，所有游戏项目必须遵守*
