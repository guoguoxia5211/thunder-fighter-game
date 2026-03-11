// 敌方坦克 AI - 状态机
class EnemyStateMachine {
    constructor(enemy) {
        this.enemy = enemy;
        this.state = 'PATROL'; // PATROL, ATTACK, DODGE, DEFEND_BASE
        this.stateTime = 0;
        this.changeStateInterval = 60; // 60 帧换一次状态
    }

    // 更新状态
    update(player, base, walls, bullets) {
        this.stateTime++;
        
        // 状态转换逻辑
        this.checkStateTransitions(player, base, bullets);
        
        // 执行当前状态行为
        switch(this.state) {
            case 'PATROL':
                this.patrolState();
                break;
            case 'ATTACK':
                this.attackState(player);
                break;
            case 'DODGE':
                this.dodgeState(bullets);
                break;
            case 'DEFEND_BASE':
                this.defendBaseState(base);
                break;
        }
        
        // 定期换状态
        if (this.stateTime >= this.changeStateInterval) {
            this.stateTime = 0;
            if (this.state === 'PATROL') {
                this.changeDirection();
            }
        }
    }

    // 检查状态转换
    checkStateTransitions(player, base, bullets) {
        const distToPlayer = this.getDistanceTo(player);
        const distToBase = base ? this.getDistanceTo(base) : Infinity;
        
        // 优先级判断
        if (base && distToBase < 150 && base.active) {
            // 基地危险，回防
            this.state = 'DEFEND_BASE';
        } else if (this.isBeingAimed(bullets)) {
            // 被子弹瞄准，躲避
            this.state = 'DODGE';
        } else if (distToPlayer < 300 && this.canSeePlayer(player)) {
            // 看到玩家，攻击
            this.state = 'ATTACK';
        } else {
            // 默认巡逻
            this.state = 'PATROL';
        }
    }

    // 巡逻状态
    patrolState() {
        // 继续当前方向移动
        this.enemy.move(this.enemy.direction);
        
        // 随机射击
        if (Math.random() < 0.02) {
            this.enemy.shoot();
        }
    }

    // 攻击状态
    attackState(player) {
        // 朝向玩家
        this.enemy.aimAt(player);
        
        // 接近玩家
        const dist = this.getDistanceTo(player);
        if (dist > 200) {
            this.enemy.moveTowards(player);
        }
        
        // 射击
        if (this.enemy.canShoot()) {
            this.enemy.shoot();
        }
    }

    // 躲避状态
    dodgeState(bullets) {
        // 找到威胁子弹
        const threat = this.findThreateningBullet(bullets);
        if (threat) {
            // 垂直于子弹方向移动
            const dodgeDirection = threat.direction === 0 || threat.direction === 2 ? 1 : 0;
            this.enemy.direction = dodgeDirection;
            this.enemy.move(dodgeDirection);
        }
    }

    // 保卫基地状态
    defendBaseState(base) {
        if (!base) return;
        
        // 移动到基地和玩家之间
        const defendPos = {
            x: base.x + (base.x - player.x) * 0.5,
            y: base.y + (base.y - player.y) * 0.5
        };
        
        this.enemy.moveTowards(defendPos);
        
        // 射击玩家
        if (this.enemy.canShoot()) {
            this.enemy.aimAt(player);
            this.enemy.shoot();
        }
    }

    // 改变方向
    changeDirection() {
        const directions = [0, 1, 2, 3];
        this.enemy.direction = directions[Math.floor(Math.random() * 4)];
    }

    // 获取到目标的距离
    getDistanceTo(target) {
        const dx = target.x - this.enemy.x;
        const dy = target.y - this.enemy.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 是否能看到玩家
    canSeePlayer(player) {
        // 简单实现：直线无遮挡
        const dx = player.x - this.enemy.x;
        const dy = player.y - this.enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 400) return false;
        
        // TODO: 射线检测遮挡
        return true;
    }

    // 是否被子弹瞄准
    isBeingAimed(bullets) {
        for (const bullet of bullets) {
            if (bullet.owner !== 'enemy') {
                const dist = this.getDistanceTo(bullet);
                if (dist < 100) {
                    return true;
                }
            }
        }
        return false;
    }

    // 找到威胁子弹
    findThreateningBullet(bullets) {
        for (const bullet of bullets) {
            if (bullet.owner !== 'enemy') {
                const dist = this.getDistanceTo(bullet);
                if (dist < 100) {
                    return bullet;
                }
            }
        }
        return null;
    }
}

// 导出
window.EnemyStateMachine = EnemyStateMachine;
