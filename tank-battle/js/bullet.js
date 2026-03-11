// 子弹类
class Bullet {
    constructor(x, y, direction, owner) {
        this.x = x;
        this.y = y;
        this.width = 6;
        this.height = 6;
        this.direction = direction; // 0:上，1:右，2:下，3:左
        this.speed = 8;
        this.owner = owner; // 'player' 或 'enemy'
        this.active = true;
        this.damage = 1;
    }

    // 更新位置
    update() {
        switch(this.direction) {
            case 0: this.y -= this.speed; break; // 上
            case 1: this.x += this.speed; break; // 右
            case 2: this.y += this.speed; break; // 下
            case 3: this.x -= this.speed; break; // 左
        }
        
        // 边界检测
        if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600) {
            this.active = false;
        }
    }

    // 绘制
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.owner === 'player' ? '#f39c12' : '#e74c3c';
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // 发光效果
        ctx.shadowColor = this.owner === 'player' ? '#f39c12' : '#e74c3c';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
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

// 子弹池（对象池优化）
class BulletPool {
    constructor(maxSize = 100) {
        this.pool = [];
        this.active = [];
        this.maxSize = maxSize;
        
        // 预创建对象
        for (let i = 0; i < maxSize; i++) {
            this.pool.push(new Bullet(0, 0, 0, 'player'));
        }
    }

    // 获取子弹
    get(x, y, direction, owner) {
        let bullet;
        
        if (this.pool.length > 0) {
            bullet = this.pool.pop();
        } else {
            // 池为空，创建新对象
            bullet = new Bullet(x, y, direction, owner);
        }
        
        // 重置状态
        bullet.x = x;
        bullet.y = y;
        bullet.direction = direction;
        bullet.owner = owner;
        bullet.active = true;
        
        this.active.push(bullet);
        
        // 更新性能监控
        perfMonitor.updateEntityCount('bullets', 1);
        
        return bullet;
    }

    // 回收子弹
    recycle(bullet) {
        const index = this.active.indexOf(bullet);
        if (index > -1) {
            this.active.splice(index, 1);
            this.pool.push(bullet);
            
            // 更新性能监控
            perfMonitor.updateEntityCount('bullets', -1);
        }
    }

    // 更新所有活跃子弹
    update() {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const bullet = this.active[i];
            if (bullet.active) {
                bullet.update();
            } else {
                this.recycle(bullet);
            }
        }
    }

    // 绘制所有活跃子弹
    draw(ctx) {
        for (const bullet of this.active) {
            if (bullet.active) {
                bullet.draw(ctx);
            }
        }
    }

    // 获取所有活跃子弹
    getActive() {
        return this.active.filter(b => b.active);
    }

    // 清空
    clear() {
        while (this.active.length > 0) {
            this.recycle(this.active[0]);
        }
    }
}

// 全局子弹池
const bulletPool = new BulletPool(100);
