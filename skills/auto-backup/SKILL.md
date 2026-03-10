# 自动备份技能 (Auto Backup)

**版本：** 1.0  
**创建：** 2026-03-10  
**目标：** 自动备份项目，防止数据丢失

---

## 🎯 核心原则

**备份不是可选项，是保险。**

手动备份会忘记，自动备份才可靠。

---

## 📋 备份策略

### 备份类型

| 类型 | 频率 | 保留 | 说明 |
|------|------|------|------|
| **Git 提交** | 每次变更 | 永久 | 代码版本管理 |
| **每日备份** | 每天 23:00 | 7 天 | 防止误操作 |
| **每周备份** | 每周日 | 4 周 | 长期归档 |
| **里程碑备份** | 手动触发 | 永久 | 重要版本 |

---

## 🔧 备份脚本

### daily-backup.sh

```bash
#!/bin/bash

# 每日自动备份脚本
# 用法：./daily-backup.sh [project-dir]

set -e

PROJECT_DIR=${1:-/root/.openclaw/workspace}
BACKUP_BASE="/root/.openclaw/backups"
DATE=$(date +%Y%m%d)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "======================================"
echo "  每日备份 - Daily Backup"
echo "======================================"
echo ""

# 1. 创建备份目录
BACKUP_DIR="$BACKUP_BASE/daily/$DATE"
mkdir -p "$BACKUP_DIR"

# 2. 备份项目
echo "📦 备份项目..."

# 列出所有项目目录
PROJECTS="snake-ultimate thunder-fighter"

for project in $PROJECTS; do
  if [ -d "$PROJECT_DIR/$project" ]; then
    echo "  - $project"
    
    # 检查 Git 状态
    cd "$PROJECT_DIR/$project"
    git status --short > "$BACKUP_DIR/${project}-status.txt" || true
    
    # 创建 tar 备份
    tar -czf "$BACKUP_DIR/${project}-${TIMESTAMP}.tar.gz" \
      --exclude='node_modules' \
      --exclude='.git' \
      --exclude='dist' \
      -C "$PROJECT_DIR" \
      "$project"
    
    echo "    ✅ 备份完成"
  fi
done

# 3. 备份重要文件
echo "📄 备份重要文件..."
IMPORTANT_FILES="MEMORY.md SESSION-STATE.md PROJECTS.md AUTONOMOUS-EVOLUTION.md"

for file in $IMPORTANT_FILES; do
  if [ -f "$PROJECT_DIR/$file" ]; then
    cp "$PROJECT_DIR/$file" "$BACKUP_DIR/${file}.${TIMESTAMP}"
    echo "  - $file ✅"
  fi
done

# 4. 清理旧备份 (保留 7 天)
echo "🧹 清理旧备份..."
find "$BACKUP_BASE/daily" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

# 5. 生成备份报告
cat > "$BACKUP_DIR/backup-report.md" << EOF
# 备份报告

**日期：** $(date '+%Y-%m-%d %H:%M:%S')
**备份位置：** $BACKUP_DIR

## 备份内容

### 项目备份
$(ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "无")

### 文件备份
$(ls -la "$BACKUP_DIR"/*.md 2>/dev/null || echo "无")

## Git 状态

$(cat "$BACKUP_DIR"/*-status.txt 2>/dev/null || echo "无 Git 状态")

## 备份大小

$(du -sh "$BACKUP_DIR")
EOF

echo ""
echo "======================================"
echo -e "✅ 备份完成！"
echo "======================================"
echo ""
echo "📦 备份位置：$BACKUP_DIR"
echo "📊 备份大小：$(du -sh "$BACKUP_DIR" | cut -f1)"
echo ""

```

### milestone-backup.sh

```bash
#!/bin/bash

# 里程碑备份脚本
# 用法：./milestone-backup.sh [project-name] [version]

set -e

PROJECT_NAME=$1
VERSION=$2

if [ -z "$PROJECT_NAME" ] || [ -z "$VERSION" ]; then
  echo "❌ 请提供项目名称和版本号"
  echo "用法：./milestone-backup.sh [project-name] [version]"
  exit 1
fi

PROJECT_DIR="/root/.openclaw/workspace/$PROJECT_NAME"
BACKUP_DIR="/root/.openclaw/backups/milestones/${PROJECT_NAME}-${VERSION}"

echo "======================================"
echo "  里程碑备份 - $PROJECT_NAME v$VERSION"
echo "======================================"
echo ""

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 创建完整备份
echo "📦 创建完整备份..."
tar -czf "$BACKUP_DIR/backup.tar.gz" \
  --exclude='node_modules' \
  --exclude='dist' \
  -C "/root/.openclaw/workspace" \
  "$PROJECT_NAME"

# 生成版本说明
cat > "$BACKUP_DIR/VERSION.md" << EOF
# $PROJECT_NAME v$VERSION

**备份时间：** $(date '+%Y-%m-%d %H:%M:%S')

## 变更内容

- 

## 测试结果

- [ ] 功能测试通过
- [ ] 性能测试通过
- [ ] 代码审查通过

## 备注


EOF

# Git 标签
cd "$PROJECT_DIR"
git tag -a "v$VERSION" -m "Milestone backup: $VERSION"
git push origin "v$VERSION" || echo "⚠️  无法推送标签 (可能无远程仓库)"

echo ""
echo "======================================"
echo -e "✅ 里程碑备份完成！"
echo "======================================"
echo ""
echo "📦 备份位置：$BACKUP_DIR"
echo "🏷️  Git 标签：v$VERSION"
echo ""

```

---

## 📅 Cron 配置

### 添加到 crontab

```bash
# 每天 23:00 执行备份
0 23 * * * /root/.openclaw/workspace/skills/auto-backup/daily-backup.sh

# 每周日 23:30 执行周备份
30 23 * * 0 /root/.openclaw/workspace/skills/auto-backup/weekly-backup.sh
```

---

## 📊 备份监控

### backup-status.json

```json
{
  "lastDailyBackup": "2026-03-10T23:00:00+08:00",
  "lastWeeklyBackup": "2026-03-09T23:30:00+08:00",
  "lastMilestoneBackup": {
    "project": "snake-ultimate",
    "version": "1.0.0",
    "time": "2026-03-05T12:00:00+08:00"
  },
  "totalBackups": 45,
  "storageUsed": "1.2GB"
}
```

---

## 🚨 恢复流程

### 从备份恢复

```bash
# 1. 找到备份文件
ls -la /root/.openclaw/backups/daily/

# 2. 解压备份
tar -xzf /root/.openclaw/backups/daily/20260310/snake-ultimate-20260310-230000.tar.gz \
  -C /root/.openclaw/workspace/

# 3. 验证恢复
cd /root/.openclaw/workspace/snake-ultimate
git status
```

---

## 🧠 自主学习

每次备份后记录：
1. 备份是否成功？
2. 备份大小是否异常？
3. 是否需要调整备份策略？

---

*此技能通过 Cron 自动执行，也可手动触发*
