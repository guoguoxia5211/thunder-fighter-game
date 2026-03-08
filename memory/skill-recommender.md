# 技能推荐系统 - 测试记录

## 2026-03-08 创建

### 创建原因
用户要求：每次下达任务时，自动分析需要什么技能，然后推荐给用户选择。

### 核心逻辑
1. 收到任务 → 分析需求
2. 匹配技能库 → 找出最相关的技能
3. 输出推荐 → 说明理由
4. 等用户确认 → 激活技能

### 技能匹配表
| 任务类型 | 推荐技能 |
|---------|---------|
| 游戏开发 | game-dev-master, game-developer, game-engine |
| UI 设计 | frontend-design, happy-hues |
| 3D 建模 | 3d-modeler, blender |
| 动画 | animator, animations |
| 美术 | master-artist, character-designer |
| 调试 | bug-investigation |
| 性能优化 | game-optimization-master |
| 天气查询 | weather |
| 技能查找 | find-skills, clawhub |
| GitHub | github, gh-issues |
| 浏览器自动化 | openclaw-browser-quality |
| 钉钉提醒 | dingtalk-cron-job |
| 文件发送 | dingtalk-send-media |
| 深度思考 | deep-thinking |
| 第一性原理 | first-principles-decomposer |

### 推荐格式
```
🎯 **技能推荐**

**主要技能：**
- 🎮 game-dev-master - 游戏开发核心逻辑

**辅助技能：**
- 🎨 frontend-design - UI 界面美化

**推荐理由：**
简单说明为什么推荐这些技能

**是否启用？** 回复"是"或指定技能名称。
```

### 下一步
- 测试推荐准确性
- 根据用户反馈优化匹配规则
- 添加更多技能类型覆盖
