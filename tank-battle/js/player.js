// 玩家坦克类
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 36;
        this.speed = 4;
        this.direction = 0; // 0:上，1:右，2:下，3:左
        this.shootCooldown = 0;
        this.shootDelay = 18; // 帧数，约 0.3 秒
        this.lives = 3;
        this.score = 0;
        this.active = true;
        this.invincible = false;
        this.invincibleTime = 0;
    }

    // 更新状态
    update(keys, walls, base) {
        if (!this.active) return;
        
        let moving = false;
        let newX = this.x;
        let newY = this.y;
        
        // 方向控制
        if (keys['ArrowUp']) {
            this.direction = 0;
            newY -= this.speed;
            moving = true;
        } else if (keys['ArrowRight']) {
            this.direction = 1;
            newX += this.speed;
            moving = true;
        } else if (keys['ArrowDown']) {
            this.direction = 2;
            newY += this.speed;
            moving = true;
        } else if (keys['ArrowLeft']) {
            this.direction = 3;
            newX -= this.speed;
            moving = true;
        }
        
        // 移动碰撞检测
        if (moving) {
            if (this.canMoveTo(newX, this.y, walls, base)) {
                this.x = newX;
            }
            if (this.canMoveTo(this.x, newY, walls, base)) {
                this.y = newY;
            }
        }
        
        // 射击
        if (keys[' '] && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.shootDelay;
        }
        
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
        
        // 无敌时间
        if (this.invincible) {
            this.invincibleTime--;
            if (this.invincibleTime <= 0) {
                this.invincible = false;
            }
        }
    }

    // 检查是否可以移动
    canMoveTo(x, y, walls, base) {
        const rect = { x, y, width: this.width, height: this.height };
        
        // 检查墙
        for (const wall of walls) {
            if (wall.type !== 'river' && this.rectIntersect(rect, wall)) {
                return false;
            }
        }
        
        // 检查基地
        if (base && this.rectIntersect(rect, base)) {
            return false;
        }
        
        // 检查边界
        if (x < 0 || x + this.width > 800 || y < 0 || y + this.height > 600) {
            return false;
        }
        
        return true;
    }

    // 矩形碰撞
    rectIntersect(rect1, rect2) {
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect1.x > rect2.x + rect2.width ||
            rect1.y + rect1.height < rect2.y ||
            rect1.y > rect2.y + rect2.height
        );
    }

    // 射击
    shoot() {
        const centerX = this.x + this.width / 2 - 3;
        const centerY = this.y + this.height / 2 - 3;
        
        let bulletX = centerX;
        let bulletY = centerY;
        
        // 子弹从坦克前方发射
        switch(this.direction) {
            case 0: bulletY = this.y - 6; break;
            case 1: bulletX = this.x + this.width; break;
            case 2: bulletY = this.y + this.height; break;
            case 3: bulletX = this.x - 6; break;
        }
        
        bulletPool.get(bulletX, bulletY, this.direction, 'player');
    }

    // 绘制
    draw(ctx) {
        if (!this.active) return;
        
        // 无敌闪烁
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            return;
        }
        
        ctx.save();
        
        // 平移旋转到坦克中心
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.direction * 90 * Math.PI / 180);
        
        // 坦克车身
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(-15, -15, 30, 30);
        
        // 坦克炮塔
        ctx.fillStyle = '#26a69a';
        ctx.fillRect(-8, -8, 16, 16);
        
        // 坦克炮管
        ctx.fillStyle = '#1a7a6e';
        ctx.fillRect(-3, -20, 6, 20);
        
        // 坦克履带
        ctx.fillStyle = '#145a50';
        ctx.fillRect(-18, -15, 6, 30);
        ctx.fillRect(12, -15, 6, 30);
        
        ctx.restore();
    }

    // 被击中
    hit() {
        if (this.invincible) return false;
        
        this.lives--;
        if (this.lives <= 0) {
            this.active = false;
            return true; // 死亡
        } else {
            this.invincible = true;
            this.invincibleTime = 120; // 2 秒无敌
            return false;
        }
    }

    // 重置位置
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.direction = 0;
        this.invincible = true;
        this.invincibleTime = 120;
    }

    // 添加分数
    addScore(points) {
        this.score += points;
        this.updateUI();
    }

    // 更新 UI
    updateUI() {
        const scoreEl = document.getElementById('score');
        const livesEl = document.getElementById('lives');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (livesEl) livesEl.textContent = this.lives;
    }

    // 获取碰撞盒
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// 全局玩家实例
const player = new Player(400, 500);
