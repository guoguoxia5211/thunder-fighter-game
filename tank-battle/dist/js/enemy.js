// 敌方坦克类
class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 36;
        this.type = type;
        this.direction = 2; // 初始向下
        this.speed = this.getSpeedByType(type);
        this.health = this.getHealthByType(type);
        this.damage = this.getDamageByType(type);
        this.shootCooldown = 0;
        this.shootDelay = this.getShootDelayByType(type);
        this.active = true;
        this.scoreValue = this.getScoreByType(type);
        
        // AI 组件
        this.stateMachine = new EnemyStateMachine(this);
        this.behaviorTree = new BehaviorTree(this);
        this.moveTime = 0;
    }

    // 根据类型获取属性
    getSpeedByType(type) {
        const speeds = { normal: 2, fast: 4, heavy: 1.5, special: 3 };
        return speeds[type] || 2;
    }

    getHealthByType(type) {
        const healths = { normal: 1, fast: 1, heavy: 3, special: 2 };
        return healths[type] || 1;
    }

    getDamageByType(type) {
        const damages = { normal: 1, fast: 1, heavy: 1, special: 2 };
        return damages[type] || 1;
    }

    getShootDelayByType(type) {
        const delays = { normal: 60, fast: 45, heavy: 90, special: 40 };
        return delays[type] || 60;
    }

    getScoreByType(type) {
        const scores = { normal: 100, fast: 200, heavy: 300, special: 400 };
        return scores[type] || 100;
    }

    // 更新 AI
    update(player, base, walls, bullets) {
        if (!this.active) return;
        
        // 使用行为树 AI（更智能）
        this.behaviorTree.update(player, base, bullets);
        
        // 射击冷却
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    // 移动
    move(direction) {
        if (direction !== undefined) {
            this.direction = direction;
        }
        
        let newX = this.x;
        let newY = this.y;
        
        switch(this.direction) {
            case 0: newY -= this.speed; break; // 上
            case 1: newX += this.speed; break; // 右
            case 2: newY += this.speed; break; // 下
            case 3: newX -= this.speed; break; // 左
        }
        
        // 碰撞检测
        if (this.canMoveTo(newX, this.y)) {
            this.x = newX;
        }
        if (this.canMoveTo(this.x, newY)) {
            this.y = newY;
        }
    }

    // 朝目标移动
    moveTowards(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 1 : 3;
        } else {
            this.direction = dy > 0 ? 2 : 0;
        }
        
        this.move();
    }

    // 瞄准目标
    aimAt(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 1 : 3;
        } else {
            this.direction = dy > 0 ? 2 : 0;
        }
    }

    // 检查是否可以移动
    canMoveTo(x, y) {
        const rect = { x, y, width: this.width, height: this.height };
        
        // 检查墙
        const walls = gameMap.getWalls();
        for (const wall of walls) {
            if (wall.type !== 'river' && this.rectIntersect(rect, wall)) {
                return false;
            }
        }
        
        // 检查基地
        const base = gameMap.getBase();
        if (base && this.rectIntersect(rect, base)) {
            return false;
        }
        
        // 检查其他敌人
        for (const enemy of game.enemies) {
            if (enemy !== this && enemy.active) {
                if (this.rectIntersect(rect, enemy.getBounds())) {
                    return false;
                }
            }
        }
        
        // 检查玩家
        if (player.active && this.rectIntersect(rect, player.getBounds())) {
            return false;
        }
        
        // 检查边界
        if (x < 0 || x + this.width > 800 || y < 0 || y + this.height > 600) {
            return false;
        }
        
        return true;
    }

    // 检查是否被阻挡
    isBlocked() {
        const testX = this.x;
        const testY = this.y;
        let newX = testX;
        let newY = testY;
        
        switch(this.direction) {
            case 0: newY -= this.speed; break;
            case 1: newX += this.speed; break;
            case 2: newY += this.speed; break;
            case 3: newX -= this.speed; break;
        }
        
        return !this.canMoveTo(newX, newY);
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

    // 是否有视线
    hasLineOfSight(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 简单实现：距离内无遮挡
        if (dist > 400) return false;
        
        // TODO: 射线检测
        return true;
    }

    // 是否可以射击
    canShoot() {
        return this.shootCooldown <= 0;
    }

    // 射击
    shoot() {
        if (!this.canShoot()) return;
        
        const centerX = this.x + this.width / 2 - 3;
        const centerY = this.y + this.height / 2 - 3;
        
        let bulletX = centerX;
        let bulletY = centerY;
        
        switch(this.direction) {
            case 0: bulletY = this.y - 6; break;
            case 1: bulletX = this.x + this.width; break;
            case 2: bulletY = this.y + this.height; break;
            case 3: bulletX = this.x - 6; break;
        }
        
        bulletPool.get(bulletX, bulletY, this.direction, 'enemy');
        this.shootCooldown = this.shootDelay;
    }

    // 绘制
    draw(ctx) {
        if (!this.active) return;
        
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.direction * 90 * Math.PI / 180);
        
        // 根据类型设置颜色
        const colors = {
            normal: '#e74c3c',
            fast: '#f39c12',
            heavy: '#8e44ad',
            special: '#e91e63'
        };
        const color = colors[this.type] || colors.normal;
        
        // 坦克车身
        ctx.fillStyle = color;
        ctx.fillRect(-15, -15, 30, 30);
        
        // 坦克炮塔
        ctx.fillStyle = this.shadeColor(color, -20);
        ctx.fillRect(-8, -8, 16, 16);
        
        // 坦克炮管
        ctx.fillStyle = this.shadeColor(color, -40);
        ctx.fillRect(-3, -20, 6, 20);
        
        // 坦克履带
        ctx.fillStyle = this.shadeColor(color, -60);
        ctx.fillRect(-18, -15, 6, 30);
        ctx.fillRect(12, -15, 6, 30);
        
        ctx.restore();
    }

    // 颜色变暗/变亮
    shadeColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // 被击中
    hit(damage = 1) {
        this.health -= damage;
        if (this.health <= 0) {
            this.active = false;
            return true; // 死亡
        }
        return false;
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

// 导出
window.Enemy = Enemy;
