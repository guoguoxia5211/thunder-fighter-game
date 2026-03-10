#!/bin/bash

# 代码审查脚本
# 用法：./scripts/code-review.sh [project-path]

set -e

PROJECT_PATH=${1:-.}
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "  代码审查 - Code Review"
echo "======================================"
echo ""

cd "$PROJECT_PATH"

# 1. 检查依赖
echo "📦 检查依赖..."
if [ ! -f "package.json" ]; then
  echo -e "${YELLOW}⚠️  未找到 package.json，跳过依赖检查${NC}"
else
  npm install --silent
  echo -e "${GREEN}✅ 依赖安装完成${NC}"
fi
echo ""

# 2. ESLint 检查
echo "🔍 ESLint 静态分析..."
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
  npx eslint . --ext .js,.jsx 2>&1 || {
    echo -e "${RED}❌ ESLint 检查失败${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ ESLint 检查通过${NC}"
else
  echo -e "${YELLOW}⚠️  未找到 ESLint 配置，跳过${NC}"
fi
echo ""

# 3. Prettier 格式化检查
echo "🎨 Prettier 格式检查..."
if [ -f ".prettierrc" ] || [ -f ".prettierrc.js" ]; then
  npx prettier --check . 2>&1 || {
    echo -e "${YELLOW}⚠️  格式问题，尝试自动修复...${NC}"
    npx prettier --write .
    echo -e "${GREEN}✅ 格式已自动修复${NC}"
  }
else
  echo -e "${YELLOW}⚠️  未找到 Prettier 配置，跳过${NC}"
fi
echo ""

# 4. 安全扫描
echo "🔒 安全漏洞扫描..."
if [ -f "package.json" ]; then
  npm audit --audit-level=high || {
    echo -e "${RED}❌ 发现高危安全漏洞${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ 安全扫描通过${NC}"
fi
echo ""

# 5. 测试运行
echo "🧪 运行测试..."
if [ -f "package.json" ] && grep -q '"test"' package.json; then
  npm test || {
    echo -e "${RED}❌ 测试失败${NC}"
    exit 1
  }
  echo -e "${GREEN}✅ 所有测试通过${NC}"
else
  echo -e "${YELLOW}⚠️  未找到测试配置，跳过${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}✅ 代码审查完成！${NC}"
echo "======================================"
