#!/bin/bash

# 版本号升级脚本
# 用法：./version-bump.sh [major|minor|patch]

set -e

BUMP_TYPE=${1:-patch}
VERSION_FILE="VERSION.json"

if [ ! -f "$VERSION_FILE" ]; then
  echo "❌ 未找到 VERSION.json，请确认在项目根目录执行"
  exit 1
fi

# 读取当前版本
CURRENT_VERSION=$(cat "$VERSION_FILE" | jq -r '.version')
echo "📋 当前版本：$CURRENT_VERSION"

# 解析版本号
MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1 | sed 's/V//')
MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
PATCH=$(echo $CURRENT_VERSION | cut -d. -f3)

# 升级版本号
case $BUMP_TYPE in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    echo "🔥 大版本升级：V$MAJOR.$MINOR.$PATCH"
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    echo "✨ 功能版本升级：V$MAJOR.$MINOR.$PATCH"
    ;;
  patch)
    PATCH=$((PATCH + 1))
    echo "🐛 BUG 版本升级：V$MAJOR.$MINOR.$PATCH"
    ;;
  *)
    echo "❌ 未知升级类型：$BUMP_TYPE"
    echo "用法：./version-bump.sh [major|minor|patch]"
    exit 1
    ;;
esac

NEW_VERSION="V${MAJOR}.${MINOR}.${PATCH}"

# 更新 VERSION.json
jq --arg version "$NEW_VERSION" --arg time "$(date -Iseconds)" \
  '.version = $version | .buildTime = $time' "$VERSION_FILE" > "$VERSION_FILE.tmp"
mv "$VERSION_FILE.tmp" "$VERSION_FILE"

# 更新 package.json (如果存在)
if [ -f "package.json" ]; then
  jq --arg version "${MAJOR}.${MINOR}.${PATCH}" '.version = $version' package.json > package.json.tmp
  mv package.json.tmp package.json
fi

echo ""
echo "✅ 版本升级完成！"
echo "🏷️  新版本：$NEW_VERSION"
echo ""
echo "下一步:"
echo "  1. git add VERSION.json"
echo "  2. git commit -m 'chore: bump version to $NEW_VERSION'"
echo "  3. git tag -a '$NEW_VERSION' -m 'Release $NEW_VERSION'"
echo "  4. git push origin main && git push origin $NEW_VERSION"
