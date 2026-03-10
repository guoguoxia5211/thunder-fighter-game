# 项目脚手架技能 (Project Scaffold)

**版本：** 1.0  
**创建：** 2026-03-10  
**目标：** 30 秒创建标准化游戏项目模板

---

## 🎯 核心原则

**不要重复造轮子。**

每个新项目都应该从最佳实践开始。

---

## 📁 项目模板结构

### 标准游戏项目

```
[project-name]/
├── index.html           # 主页面
├── js/
│   ├── game.js          # 游戏主逻辑
│   ├── player.js        # 玩家控制
│   ├── enemy.js         # 敌机系统
│   ├── bullet.js        # 子弹系统
│   ├── collision.js     # 碰撞检测
│   └── utils.js         # 工具函数
├── css/
│   └── style.css        # 样式
├── assets/
│   ├── images/          # 图片资源
│   └── audio/           # 音频资源
├── tests/
│   ├── unit/            # 单元测试
│   └── e2e/             # E2E 测试
├── .eslintrc.js         # ESLint 配置
├── .prettierrc          # Prettier 配置
├── package.json         # 项目配置
├── build.sh             # 构建脚本
├── README.md            # 项目说明
└── .gitignore           # Git 忽略
```

---

## 🔧 脚手架脚本

### create-game.sh

```bash
#!/bin/bash

# 游戏项目脚手架
# 用法：./create-game.sh [project-name]

set -e

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ 请提供项目名称"
  echo "用法：./create-game.sh [project-name]"
  exit 1
fi

PROJECT_DIR="/root/.openclaw/workspace/$PROJECT_NAME"

echo "======================================"
echo "  创建游戏项目：$PROJECT_NAME"
echo "======================================"
echo ""

# 1. 创建目录结构
echo "📁 创建目录结构..."
mkdir -p "$PROJECT_DIR"/{js,css,assets/{images,audio},tests/{unit,e2e}}

# 2. 创建基础文件
echo "📝 创建基础文件..."

# index.html
cat > "$PROJECT_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Title</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  <script src="js/utils.js"></script>
  <script src="js/player.js"></script>
  <script src="js/enemy.js"></script>
  <script src="js/bullet.js"></script>
  <script src="js/collision.js"></script>
  <script src="js/game.js"></script>
</body>
</html>
EOF

# game.js
cat > "$PROJECT_DIR/js/game.js" << 'EOF'
// 游戏主逻辑
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    this.player = new Player(this.canvas.width / 2, this.canvas.height - 50);
    this.enemies = [];
    this.bullets = [];
    
    this.lastTime = 0;
    this.enemySpawnTimer = 0;
    
    window.addEventListener('resize', () => this.resize());
    this.setupControls();
    
    this.start();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupControls() {
    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.player.moveLeft();
      if (e.key === 'ArrowRight') this.player.moveRight();
      if (e.key === ' ') this.player.shoot(this.bullets);
    });

    // 触摸控制 (移动端)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.player.moveTo(touch.clientX);
      this.player.shoot(this.bullets);
    });
  }

  spawnEnemy() {
    const x = Math.random() * (this.canvas.width - 50);
    this.enemies.push(new Enemy(x, -50));
  }

  update(deltaTime) {
    // 更新玩家
    this.player.update(deltaTime, this.canvas.width);

    // 生成敌机
    this.enemySpawnTimer += deltaTime;
    if (this.enemySpawnTimer > 1000) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }

    // 更新敌机
    this.enemies.forEach((enemy, index) => {
      enemy.update(deltaTime, this.canvas.height);
      if (enemy.y > this.canvas.height) {
        this.enemies.splice(index, 1);
      }
    });

    // 更新子弹
    this.bullets.forEach((bullet, index) => {
      bullet.update(deltaTime);
      if (bullet.y < 0) {
        this.bullets.splice(index, 1);
      }
    });

    // 碰撞检测
    this.checkCollisions();
  }

  checkCollisions() {
    // 子弹击中敌机
    this.bullets.forEach((bullet, bIndex) => {
      this.enemies.forEach((enemy, eIndex) => {
        if (checkCollision(bullet, enemy)) {
          this.bullets.splice(bIndex, 1);
          this.enemies.splice(eIndex, 1);
          // TODO: 增加分数
        }
      });
    });
  }

  draw() {
    // 清空画布
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制实体
    this.player.draw(this.ctx);
    this.enemies.forEach(enemy => enemy.draw(this.ctx));
    this.bullets.forEach(bullet => bullet.draw(this.ctx));
  }

  start() {
    const gameLoop = (timestamp) => {
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;

      this.update(deltaTime);
      this.draw();

      requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
  }
}

// 启动游戏
window.addEventListener('load', () => {
  new Game();
});
EOF

# player.js
cat > "$PROJECT_DIR/js/player.js" << 'EOF'
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.speed = 300; // 像素/秒
    this.moveDirection = 0; // -1: 左，0: 停止，1: 右
  }

  moveLeft() {
    this.moveDirection = -1;
  }

  moveRight() {
    this.moveDirection = 1;
  }

  moveTo(x) {
    this.x = x - this.width / 2;
  }

  shoot(bullets) {
    bullets.push(new Bullet(this.x + this.width / 2, this.y));
  }

  update(deltaTime, canvasWidth) {
    this.x += this.moveDirection * this.speed * (deltaTime / 1000);
    
    // 边界检查
    this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
  }

  draw(ctx) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
EOF

# enemy.js
cat > "$PROJECT_DIR/js/enemy.js" << 'EOF'
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 150; // 像素/秒
  }

  update(deltaTime, canvasHeight) {
    this.y += this.speed * (deltaTime / 1000);
  }

  draw(ctx) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
EOF

# bullet.js
cat > "$PROJECT_DIR/js/bullet.js" << 'EOF'
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 15;
    this.speed = 500; // 像素/秒
  }

  update(deltaTime) {
    this.y -= this.speed * (deltaTime / 1000);
  }

  draw(ctx) {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
  }
}
EOF

# collision.js
cat > "$PROJECT_DIR/js/collision.js" << 'EOF'
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
EOF

# utils.js
cat > "$PROJECT_DIR/js/utils.js" << 'EOF'
// 工具函数
function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(random(min, max));
}

function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
EOF

# style.css
cat > "$PROJECT_DIR/css/style.css" << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #000;
}

#gameCanvas {
  display: block;
  width: 100vw;
  height: 100vh;
}
EOF

# package.json
cat > "$PROJECT_DIR/package.json" << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "Game project created with scaffold",
  "scripts": {
    "start": "npx http-server .",
    "test": "jest",
    "build": "./build.sh $PROJECT_NAME",
    "lint": "eslint . --ext .js"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0",
    "http-server": "^14.0.0"
  }
}
EOF

# .gitignore
cat > "$PROJECT_DIR/.gitignore" << 'EOF'
node_modules/
dist/
.DS_Store
*.log
EOF

# README.md
cat > "$PROJECT_DIR/README.md" << EOF
# $PROJECT_NAME

## 运行

\`\`\`bash
npm install
npm start
\`\`\`

## 构建

\`\`\`bash
npm run build
\`\`\`

## 测试

\`\`\`bash
npm test
\`\`\`
EOF

# 复制配置文件
echo "📋 复制配置文件..."
cp /root/.openclaw/workspace/skills/code-review/.eslintrc.js "$PROJECT_DIR/"
cp /root/.openclaw/workspace/skills/code-review/.prettierrc "$PROJECT_DIR/"
cp /root/.openclaw/workspace/skills/game-bundler/build.sh "$PROJECT_DIR/"
chmod +x "$PROJECT_DIR/build.sh"

# 初始化 Git
echo "📦 初始化 Git..."
cd "$PROJECT_DIR"
git init
git add .
git commit -m "Initial commit: Project scaffold"

echo ""
echo "======================================"
echo -e "✅ 项目创建完成！"
echo "======================================"
echo ""
echo "📁 项目位置：$PROJECT_DIR"
echo ""
echo "🚀 快速开始:"
echo "  cd $PROJECT_DIR"
echo "  npm install"
echo "  npm start"
echo ""

```

---

## 📊 模板项目类型

| 类型 | 说明 | 命令 |
|------|------|------|
| shooter | 射击游戏 (雷霆战机) | `./create-game.sh thunder-fighter` |
| snake | 贪吃蛇 | `./create-game.sh snake` |
| puzzle | 益智游戏 | `./create-game.sh puzzle` |
| runner | 跑酷游戏 | `./create-game.sh runner` |

---

## 🧠 自主学习

每次创建项目后记录：
1. 模板是否满足需求？
2. 需要添加/修改什么？
3. 用户反馈如何？

---

*此技能在创建新项目时强制使用*
