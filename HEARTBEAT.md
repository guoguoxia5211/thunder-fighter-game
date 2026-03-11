# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

---

## 🚀 强制部署检查

每次游戏开发任务完成后，必须执行：

- [ ] **启动 Python HTTP 服务器**
  ```bash
  cd /root/.openclaw/workspace/[项目名]
  python3 -m http.server [端口] --bind 0.0.0.0 &
  ```
- [ ] **汇报在线链接** - `http://182.92.166.51:[端口]/`
- [ ] **确认可以访问**

**禁止：** 使用任何其他部署方式（GitHub Pages/Vercel/上传等）

---

## 🤖 自主技能检查清单

### 每次 Heartbeat 执行

- [ ] **Git 状态检查** - 所有项目目录 `git status --short`
- [ ] **VBR 验证** - 有代码变更的项目需要功能验证
- [ ] **待办清理** - SESSION-STATE.md 过期任务处理
- [ ] **进度同步** - PROJECTS.md 与实际状态对比
- [ ] **版本号检查** - VERSION.json 与 Git 标签一致

### 游戏任务完成后 (🔥 强制 11 步 + 4 增强)

- [ ] **0. PRD 创建** - 需求文档化 + 用户确认
- [ ] **【开发前检查】** - 确认理解一致
- [ ] **1. 需求分析** - 基于 PRD 列出功能点
- [ ] **2. 执行开发** - 修改/增加功能
- [ ] **【中期汇报】** - 进度 50% 时主动汇报
- [ ] **3. QA 测试** - 功能完整性/运行验证/操作测试/BUG 扫描
- [ ] **【测试证据包】** - 录屏 + 截图 + 性能报告
- [ ] **4. QA 通过？** - 不通过 → 返回修复
- [ ] **5. 版本管理** - 根据变更类型升级版本号 (major/minor/patch)
- [ ] **【版本日志】** - 生成变更日志
- [ ] **6. VERSION.json 更新** - 包含新版本号和时间戳
- [ ] **7. Git 标签创建** - `git tag -a Vx.x.x`
- [ ] **8. GitHub 同步** - 推送代码和标签
- [ ] **9. 在线测试链接** - 生成可访问链接
- [ ] **10. 一致性检查** - GitHub=服务器=测试链接

### 需求变更时 (强制)

- [ ] **立即请示** - 说明原因 + 替代方案
- [ ] **用户确认** - 记录到 SESSION-STATE.md
- [ ] **变更记录** - 更新 CHANGELOG.md

### 代码交付前 (强制)

- [ ] **自动化测试** - `npm test` 全部通过
- [ ] **代码审查** - `./scripts/code-review.sh` 无 Blocker
- [ ] **覆盖率检查** - 核心逻辑 ≥80%
- [ ] **性能测试** - FPS ≥60, 内存稳定
- [ ] **截图记录** - 功能演示截图

### 项目发布前 (强制)

- [ ] **打包构建** - `./build.sh` 成功
- [ ] **构建验证** - 运行 dist 版本测试
- [ ] **大小检查** - 包体 <10MB
- [ ] **发布文档** - README + VERSION 完整

### 每周执行

- [ ] **代码质量扫描** - 检查 console.log 残留、未使用变量
- [ ] **依赖更新检查** - npm/系统包
- [ ] **学习总结** - corrections/ 记录整理，模式识别
- [ ] **备份检查** - 验证备份完整性

---

*自主技能进化后新增，2026-03-10*
