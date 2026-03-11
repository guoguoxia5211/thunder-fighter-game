// 敌方坦克 AI - 行为树
class BehaviorTree {
    constructor(enemy) {
        this.enemy = enemy;
        this.root = this.createTree();
    }

    // 创建行为树
    createTree() {
        // 选择器：选择第一个成功的子节点
        return new Selector([
            // 1. 保卫基地（最高优先级）
            new Sequence([
                new Condition(() => this.shouldDefendBase()),
                new DefendBaseNode(this.enemy)
            ]),
            
            // 2. 躲避子弹
            new Sequence([
                new Condition(() => this.isInDanger()),
                new DodgeNode(this.enemy)
            ]),
            
            // 3. 攻击玩家
            new Sequence([
                new Condition(() => this.canAttackPlayer()),
                new AttackPlayerNode(this.enemy)
            ]),
            
            // 4. 巡逻（默认行为）
            new PatrolNode(this.enemy)
        ]);
    }

    // 执行行为树
    update(player, base, bullets) {
        this.root.execute(player, base, bullets);
    }

    // 条件判断
    shouldDefendBase() {
        return gameMap.base && gameMap.base.active && 
               this.getDistanceTo(gameMap.base) < 150;
    }

    isInDanger() {
        const bullets = bulletPool.getActive();
        for (const bullet of bullets) {
            if (bullet.owner !== 'enemy') {
                const dist = this.getDistanceTo(bullet);
                if (dist < 100) return true;
            }
        }
        return false;
    }

    canAttackPlayer() {
        const dist = this.getDistanceTo(player);
        return dist < 300 && this.enemy.hasLineOfSight(player);
    }

    getDistanceTo(target) {
        const dx = target.x - this.enemy.x;
        const dy = target.y - this.enemy.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// 行为树节点基类
class BTNode {
    execute(player, base, bullets) {
        throw new Error('execute must be implemented');
    }
}

// 选择器：返回第一个成功的子节点
class Selector extends BTNode {
    constructor(children) {
        super();
        this.children = children;
    }

    execute(player, base, bullets) {
        for (const child of this.children) {
            const result = child.execute(player, base, bullets);
            if (result === 'SUCCESS') {
                return 'SUCCESS';
            }
        }
        return 'FAILURE';
    }
}

// 序列：所有子节点都成功才成功
class Sequence extends BTNode {
    constructor(children) {
        super();
        this.children = children;
    }

    execute(player, base, bullets) {
        for (const child of this.children) {
            const result = child.execute(player, base, bullets);
            if (result !== 'SUCCESS') {
                return result;
            }
        }
        return 'SUCCESS';
    }
}

// 条件节点
class Condition extends BTNode {
    constructor(conditionFn) {
        super();
        this.conditionFn = conditionFn;
    }

    execute() {
        return this.conditionFn() ? 'SUCCESS' : 'FAILURE';
    }
}

// 保卫基地节点
class DefendBaseNode extends BTNode {
    constructor(enemy) {
        super();
        this.enemy = enemy;
    }

    execute(player, base) {
        if (!base) return 'FAILURE';
        
        // 移动到基地和玩家之间
        this.enemy.moveTowards({
            x: base.x + (base.x - player.x) * 0.3,
            y: base.y + (base.y - player.y) * 0.3
        });
        
        // 射击玩家
        if (this.enemy.canShoot()) {
            this.enemy.aimAt(player);
            this.enemy.shoot();
        }
        
        return 'SUCCESS';
    }
}

// 躲避节点
class DodgeNode extends BTNode {
    constructor(enemy) {
        super();
        this.enemy = enemy;
    }

    execute(player, base, bullets) {
        const threat = this.findThreat(bullets);
        if (!threat) return 'FAILURE';
        
        // 垂直躲避
        const dodgeDir = threat.direction === 0 || threat.direction === 2 ? 1 : 0;
        this.enemy.direction = dodgeDir;
        this.enemy.move(dodgeDir);
        
        return 'SUCCESS';
    }

    findThreat(bullets) {
        for (const bullet of bullets) {
            if (bullet.owner !== 'enemy') {
                const dx = bullet.x - this.enemy.x;
                const dy = bullet.y - this.enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) return bullet;
            }
        }
        return null;
    }
}

// 攻击玩家节点
class AttackPlayerNode extends BTNode {
    constructor(enemy) {
        super();
        this.enemy = enemy;
    }

    execute(player) {
        // 朝向玩家
        this.enemy.aimAt(player);
        
        // 接近
        const dist = this.getDistanceTo(player);
        if (dist > 150) {
            this.enemy.moveTowards(player);
        }
        
        // 射击
        if (this.enemy.canShoot()) {
            this.enemy.shoot();
        }
        
        return 'SUCCESS';
    }

    getDistanceTo(target) {
        const dx = target.x - this.enemy.x;
        const dy = target.y - this.enemy.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// 巡逻节点
class PatrolNode extends BTNode {
    constructor(enemy) {
        super();
        this.enemy = enemy;
        this.moveTime = 0;
    }

    execute(player, base, bullets) {
        this.moveTime++;
        
        // 继续当前方向
        this.enemy.move(this.enemy.direction);
        
        // 随机转向
        if (this.moveTime > 60 || this.enemy.isBlocked()) {
            this.changeDirection();
            this.moveTime = 0;
        }
        
        // 随机射击
        if (Math.random() < 0.02) {
            this.enemy.shoot();
        }
        
        return 'SUCCESS';
    }

    changeDirection() {
        const dirs = [0, 1, 2, 3];
        this.enemy.direction = dirs[Math.floor(Math.random() * 4)];
    }
}

// 导出
window.BehaviorTree = BehaviorTree;
