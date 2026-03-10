#!/bin/bash
# 记忆系统自动备份脚本
# 用法：./backup-memory.sh

WORKSPACE="/root/.openclaw/workspace"
BACKUP_DIR="$WORKSPACE/.memory-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p "$BACKUP_DIR"

echo "🛡️  开始备份记忆系统..."

# 备份关键文件
for file in MEMORY.md SESSION-STATE.md MEMORY-PROTECTION.md; do
    if [ -f "$WORKSPACE/$file" ]; then
        cp "$WORKSPACE/$file" "$BACKUP_DIR/${file%.md}_$TIMESTAMP.bak"
        echo "✅ 已备份：$file"
    fi
done

# 备份 memory/ 目录
if [ -d "$WORKSPACE/memory" ]; then
    tar -czf "$BACKUP_DIR/memory_$TIMESTAMP.tar.gz" -C "$WORKSPACE" memory/
    echo "✅ 已备份：memory/ 目录"
fi

# 清理旧备份（保留最近 10 个）
cd "$BACKUP_DIR"
ls -t *.bak 2>/dev/null | tail -n +11 | xargs -r rm
ls -t *.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm

echo "📦 备份完成！位置：$BACKUP_DIR"
echo "📊 保留策略：最近 10 个备份"
