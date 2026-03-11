// 游戏主循环
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.running = false;
        this.paused = false;
        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 180; // 3 秒生成一个
        this.maxEnemies = 4;
        this.level = 1;
        this.enemiesToSpawn = 20;
        this.wave = 1;
    }

    // 初始化
    init() {
        this.bindEvents();
        this.loadLevel(1);
        this.showStartScreen();
    }

    // 绑定事件
    bindEvents() {
        // 键盘
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ') e.preventDefault(); // 防止滚动
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // 按钮
        document.getElementById('start-btn').addEventListener('click', () => {
            this.start();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    // 加载关卡
    loadLevel(level) {
        this.level = level;
        gameMap.loadLevel(level);
        
        // 重置玩家位置
        player.reset(382, 520);
        player.updateUI();
        
        // 清空敌人
        this.enemies = [];
        this.enemiesToSpawn = 10 + level * 5;
        this.wave = 1;
    }

    // 显示开始界面
    showStartScreen() {
        document.getElementById('start-screen').style.display = 'flex';
        document.getElementById('game-over-screen').style.display = 'none';
    }

    // 开始游戏
    start() {
        document.getElementById('start-screen').style.display = 'none';
        this.running = true;
        this.paused = false;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    // 重新开始
    restart() {
        document.getElementById('game-over-screen').style.display = 'none';
        player.lives = 3;
        player.score = 0;
        player.active = true;
        this.loadLevel(1);
        this.start();
    }

    // 游戏结束
    gameOver(win = false) {
        this.running = false;
        
        const screen = document.getElementById('game-over-screen');
        const title = document.getElementById('game-over-title');
        const finalScore = document.getElementById('final-score');
        
        title.textContent = win ? '🎉 胜利！' : '💀 游戏结束';
        title.style.color = win ? '#f1c40f' : '#e74c3c';
        finalScore.textContent = player.score;
        
        screen.style.display = 'flex';
    }

    // 生成敌人
    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;
        if (this.enemiesToSpawn <= 0) return;
        
        const spawnPoints = [
            { x: 40, y: 40 },
            { x: 382, y: 40 },
            { x: 724, y: 40 }
        ];
        
        const point = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        
        // 根据关卡选择类型
        const types = ['normal', 'fast', 'heavy', 'special'];
        const type = types[Math.min(Math.floor(this.level - 1 + Math.random() * 2), 3)];
        
        const enemy = new Enemy(point.x, point.y, type);
        this.enemies.push(enemy);
        this.enemiesToSpawn--;
        
        perfMonitor.setEntityCount('enemies', this.enemies.length);
    }

    // 更新游戏状态
    update() {
        if (!this.running || this.paused) return;
        
        // 更新玩家
        player.update(this.keys, gameMap.getWalls(), gameMap.getBase());
        
        // 更新子弹
        bulletPool.update();
        
        // 生成敌人
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // 更新敌人
        const bullets = bulletPool.getActive();
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.update(player, gameMap.getBase(), gameMap.getWalls(), bullets);
            }
        }
        
        // 碰撞检测
        this.checkCollisions();
        
        // 检查游戏结束
        this.checkGameState();
        
        // 更新性能监控
        perfMonitor.update();
        perfMonitor.setEntityCount('enemies', this.enemies.filter(e => e.active).length);
        perfMonitor.updateHUD();
    }

    // 碰撞检测
    checkCollisions() {
        const bullets = bulletPool.getActive();
        const walls = gameMap.getWalls();
        const base = gameMap.getBase();
        
        // 子弹碰撞
        for (const bullet of bullets) {
            if (!bullet.active) continue;
            
            // 子弹 - 墙
            const hitWall = collisionDetector.checkBulletWall(bullet, walls);
            if (hitWall) {
                bullet.active = false;
                if (hitWall.type === 'brick') {
                    gameMap.destroyWall(hitWall);
                }
                continue;
            }
            
            // 子弹 - 基地
            if (base && collisionDetector.checkBulletTank(bullet, base)) {
                bullet.active = false;
                base.active = false;
                continue;
            }
            
            // 玩家子弹 - 敌人
            if (bullet.owner === 'player') {
                for (const enemy of this.enemies) {
                    if (enemy.active && collisionDetector.checkBulletTank(bullet, enemy)) {
                        bullet.active = false;
                        if (enemy.hit(bullet.damage)) {
                            player.addScore(enemy.scoreValue);
                        }
                        break;
                    }
                }
            }
            
            // 敌人子弹 - 玩家
            if (bullet.owner === 'enemy') {
                if (player.active && collisionDetector.checkBulletTank(bullet, player)) {
                    bullet.active = false;
                    if (player.hit()) {
                        this.gameOver(false);
                    }
                }
            }
        }
        
        // 子弹 - 子弹
        for (let i = 0; i < bullets.length; i++) {
            for (let j = i + 1; j < bullets.length; j++) {
                if (bullets[i].active && bullets[j].active &&
                    bullets[i].owner !== bullets[j].owner) {
                    if (collisionDetector.checkBulletBullet(bullets[i], bullets[j])) {
                        bullets[i].active = false;
                        bullets[j].active = false;
                    }
                }
            }
        }
        
        // 敌人 - 基地
        for (const enemy of this.enemies) {
            if (enemy.active && base && collisionDetector.checkTankBase(enemy, base)) {
                base.active = false;
                this.gameOver(false);
            }
        }
    }

    // 检查游戏状态
    checkGameState() {
        const base = gameMap.getBase();
        
        // 基地被毁
        if (!base || !base.active) {
            this.gameOver(false);
            return;
        }
        
        // 玩家死亡
        if (!player.active) {
            this.gameOver(false);
            return;
        }
        
        // 胜利条件：消灭所有敌人
        const activeEnemies = this.enemies.filter(e => e.active).length;
        if (activeEnemies === 0 && this.enemiesToSpawn === 0) {
            // 下一关
            this.loadLevel(this.level + 1);
        }
    }

    // 渲染
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 800, 600);
        
        // 绘制地图
        gameMap.draw(this.ctx);
        
        // 绘制玩家
        player.draw(this.ctx);
        
        // 绘制敌人
        for (const enemy of this.enemies) {
            if (enemy.active) {
                enemy.draw(this.ctx);
            }
        }
        
        // 绘制子弹
        bulletPool.draw(this.ctx);
    }

    // 游戏循环
    gameLoop() {
        if (!this.running) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 创建游戏实例
const game = new Game();

// 启动
window.onload = () => {
    game.init();
};
