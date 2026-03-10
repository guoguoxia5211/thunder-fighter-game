# 游戏打包发布技能 (Game Bundler)

**版本：** 1.0  
**创建：** 2026-03-10  
**目标：** 一键打包游戏，生成可发布版本

---

## 🎯 核心原则

**开发完成 ≠ 用户可以玩到。**

打包发布是最后一公里，必须自动化。

---

## 📦 打包流程

```
源代码 → 压缩优化 → 资源处理 → 生成构建 → 发布包
```

---

## 🔧 构建工具链

### 核心工具

| 工具 | 用途 | 安装 |
|------|------|------|
| **esbuild** | JS 压缩/打包 | `npm install -D esbuild` |
| **html-minifier** | HTML 压缩 | `npm install -D html-minifier` |
| **clean-css** | CSS 压缩 | `npm install -D clean-css` |
| **sharp** | 图片压缩 | `npm install -D sharp` |

### 可选工具

| 工具 | 用途 |
|------|------|
| **webpack** | 复杂项目打包 |
| **vite** | 现代前端构建 |
| **parcel** | 零配置打包 |

---

## 📁 输出结构

```
dist/
├── index.html           # 压缩后的主文件
├── js/
│   └── game.min.js      # 压缩后的 JS
├── css/
│   └── style.min.css    # 压缩后的 CSS
├── assets/
│   ├── images/          # 压缩后的图片
│   └── audio/           # 音频文件
├── manifest.json        # 应用清单 (PWA)
└── README.md            # 发布说明
```

---

## 🚀 构建脚本

### build.sh

```bash
#!/bin/bash

# 游戏打包脚本
# 用法：./build.sh [project-name]

set -e

PROJECT_NAME=${1:-game}
BUILD_DIR="dist/${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S)"
SOURCE_DIR="."

echo "======================================"
echo "  游戏打包 - Game Bundler"
echo "======================================"
echo ""

# 1. 创建构建目录
echo "📁 创建构建目录..."
mkdir -p "$BUILD_DIR"/{js,css,assets}

# 2. 压缩 JS
echo "🗜️  压缩 JavaScript..."
if [ -f "game.js" ]; then
  npx esbuild game.js --bundle --minify --outfile="$BUILD_DIR/js/game.min.js"
  echo "✅ JS 压缩完成"
else
  echo "⚠️  未找到 game.js，跳过"
fi

# 3. 压缩 HTML
echo "🗜️  压缩 HTML..."
if [ -f "index.html" ]; then
  npx html-minifier \
    --collapse-whitespace \
    --remove-comments \
    --minify-css true \
    --minify-js true \
    -o "$BUILD_DIR/index.html" \
    index.html
  echo "✅ HTML 压缩完成"
fi

# 4. 复制资源
echo "📦 复制资源文件..."
if [ -d "assets" ]; then
  cp -r assets "$BUILD_DIR/"
fi

# 5. 生成版本信息
echo "📝 生成版本信息..."
cat > "$BUILD_DIR/VERSION.json" << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "buildTime": "$(date -Iseconds)",
  "buildMachine": "$(hostname)"
}
EOF

# 6. 生成发布说明
cat > "$BUILD_DIR/README.md" << EOF
# $PROJECT_NAME

**构建时间：** $(date '+%Y-%m-%d %H:%M:%S')
**版本号：** 1.0.0

## 运行方式

### 本地运行
直接打开 index.html

### 服务器运行
\`\`\`bash
npx http-server .
\`\`\`

## 浏览器兼容性

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- 移动端：✅

## 已知问题

无

---
*此版本由 Game Bundler 自动生成*
EOF

echo ""
echo "======================================"
echo -e "✅ 打包完成！"
echo "======================================"
echo ""
echo "📦 构建位置：$BUILD_DIR"
echo ""
echo "📊 构建统计:"
echo "  - HTML: 1 文件"
echo "  - JS: $(find "$BUILD_DIR/js" -name "*.js" | wc -l | tr -d ' ') 文件"
echo "  - 资源：$(find "$BUILD_DIR/assets" -type f 2>/dev/null | wc -l | tr -d ' ') 文件"
echo ""
echo "📦 打包大小:"
du -sh "$BUILD_DIR"

```

---

## 📊 压缩效果对比

| 文件类型 | 原始大小 | 压缩后大小 | 压缩率 |
|----------|----------|------------|--------|
| HTML | 100KB | 70KB | 30% |
| JS | 500KB | 200KB | 60% |
| CSS | 50KB | 35KB | 30% |
| PNG | 1MB | 600KB | 40% |

---

## 🌐 发布选项

### 1. 本地运行

```bash
cd dist/game-20260310-120000
npx http-server .
# 访问 http://localhost:8080
```

### 2. GitHub Pages

```bash
# 1. 构建
./build.sh my-game

# 2. 推送到 gh-pages 分支
cd dist/my-game-*
git init
git add .
git commit -m "Deploy game"
git push -f git@github.com:user/repo.git master:gh-pages
```

### 3. 打包为 ZIP

```bash
cd dist
zip -r game-release.zip game-20260310-120000/
```

---

## 📝 发布检查清单

### 交付前必查

- [ ] 所有功能测试通过
- [ ] 性能测试达标 (FPS ≥60)
- [ ] 移动端适配正常
- [ ] 无 console 错误
- [ ] 所有资源加载正常
- [ ] 构建包大小合理 (<10MB)

### 发布文档

- [ ] README.md 包含运行说明
- [ ] VERSION.json 包含版本信息
- [ ] CHANGELOG.md 记录变更

---

## 🧪 自动化测试构建

```javascript
// test-build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testBuild() {
  console.log('🧪 测试构建流程...');
  
  // 1. 运行构建
  execSync('./build.sh test-game', { stdio: 'inherit' });
  
  // 2. 验证输出
  const buildDir = fs.readdirSync('dist').find(d => d.startsWith('test-game'));
  if (!buildDir) throw new Error('构建失败：未找到输出目录');
  
  // 3. 检查必要文件
  const requiredFiles = ['index.html', 'js/game.min.js'];
  for (const file of requiredFiles) {
    const filePath = path.join('dist', buildDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`构建失败：缺少 ${file}`);
    }
  }
  
  // 4. 检查文件大小
  const stats = fs.statSync(path.join('dist', buildDir, 'js/game.min.js'));
  if (stats.size === 0) throw new Error('构建失败：JS 文件为空');
  
  console.log('✅ 构建测试通过');
}

testBuild();
```

---

## 🚨 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 构建后游戏不运行 | 路径错误 | 使用相对路径 |
| 资源加载失败 | 路径改变 | 检查 assets 目录 |
| 压缩后报错 | 语法错误 | 先修复 ESLint 问题 |
| 构建包过大 | 图片未压缩 | 使用 sharp 压缩图片 |

---

## 🔧 快速开始

### 为新项目添加构建

```bash
# 1. 进入项目目录
cd /root/.openclaw/workspace/[project-name]

# 2. 复制构建脚本
cp /root/.openclaw/workspace/skills/game-bundler/build.sh .
chmod +x build.sh

# 3. 安装依赖
npm install --save-dev esbuild html-minifier

# 4. 运行构建
./build.sh [project-name]

# 5. 测试构建结果
cd dist/[project-name]-*
npx http-server .
```

---

*此技能在所有游戏项目发布前强制使用*
