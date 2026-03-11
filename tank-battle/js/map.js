// 地图模块
class GameMap {
    constructor() {
        this.tileSize = 40;
        this.cols = 20; // 800 / 40
        this.rows = 15; // 600 / 40
        this.walls = [];
        this.base = null;
        this.rivers = [];
    }

    // 加载关卡
    loadLevel(level = 1) {
        this.walls = [];
        this.rivers = [];
        
        // 关卡设计（1=砖块，2=钢板，3=河流，4=树林，9=基地）
        const levels = {
            1: [
                '....................',
                '.111.111.111.111.11.',
                '.111.111.111.111.11.',
                '.111.111.111.111.11.',
                '....................',
                '.11.222.11.222.11...',',
                '.11.222.11.222.11...',',
                '....................',
                '.111.111.111.111.11.',
                '.111.111.111.111.11.',
                '....................',
                '...11.11111.11......',
                '...11.11111.11......',
                '...11.11911.11......',
                '....................'
            ]
        };
        
        const mapData = levels[level] || levels[1];
        
        for (let row = 0; row < mapData.length; row++) {
            for (let col = 0; col < mapData[row].length; col++) {
                const tile = mapData[row][col];
                const x = col * this.tileSize;
                const y = row * this.tileSize;
                
                if (tile === '1') {
                    // 砖块
                    this.walls.push({
                        x, y,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: 'brick',
                        destroyable: true,
                        health: 1
                    });
                } else if (tile === '2') {
                    // 钢板
                    this.walls.push({
                        x, y,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: 'steel',
                        destroyable: false,
                        health: Infinity
                    });
                } else if (tile === '3') {
                    // 河流
                    this.rivers.push({
                        x, y,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: 'river'
                    });
                } else if (tile === '9') {
                    // 基地
                    this.base = {
                        x, y,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: 'base',
                        active: true
                    };
                }
            }
        }
    }

    // 绘制地图
    draw(ctx) {
        // 绘制墙
        for (const wall of this.walls) {
            if (wall.type === 'brick') {
                ctx.fillStyle = '#d35400';
                ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
                
                // 砖块纹理
                ctx.strokeStyle = '#a04000';
                ctx.lineWidth = 2;
                ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
            } else if (wall.type === 'steel') {
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
                
                // 钢板光泽
                ctx.fillStyle = '#bdc3c7';
                ctx.fillRect(wall.x + 5, wall.y + 5, wall.width - 10, wall.height - 10);
            }
        }
        
        // 绘制河流
        ctx.fillStyle = '#3498db';
        for (const river of this.rivers) {
            ctx.fillRect(river.x, river.y, river.width, river.height);
        }
        
        // 绘制基地
        if (this.base && this.base.active) {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.moveTo(this.base.x + this.base.width / 2, this.base.y);
            ctx.lineTo(this.base.x + this.base.width, this.base.y + this.base.height);
            ctx.lineTo(this.base.x, this.base.y + this.base.height);
            ctx.closePath();
            ctx.fill();
            
            // 基地标志
            ctx.fillStyle = '#e74c3c';
            ctx.font = '20px Arial';
            ctx.fillText('★', this.base.x + 10, this.base.y + 28);
        }
    }

    // 摧毁墙
    destroyWall(wall) {
        if (wall.destroyable) {
            wall.health -= 1;
            if (wall.health <= 0) {
                const index = this.walls.indexOf(wall);
                if (index > -1) {
                    this.walls.splice(index, 1);
                }
                return true;
            }
        }
        return false;
    }

    // 获取所有墙
    getWalls() {
        return this.walls;
    }

    // 获取基地
    getBase() {
        return this.base;
    }

    // 检查位置是否可通行
    isPassable(x, y, width, height) {
        const rect = { x, y, width, height };
        
        // 检查墙
        for (const wall of this.walls) {
            if (wall.type !== 'river') {
                if (this.rectIntersect(rect, wall)) {
                    return false;
                }
            }
        }
        
        // 检查边界
        if (x < 0 || x + width > 800 || y < 0 || y + height > 600) {
            return false;
        }
        
        return true;
    }

    // 矩形碰撞检测
    rectIntersect(rect1, rect2) {
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect1.x > rect2.x + rect2.width ||
            rect1.y + rect1.height < rect2.y ||
            rect1.y > rect2.y + rect2.height
        );
    }

    // 清空地图
    clear() {
        this.walls = [];
        this.rivers = [];
        this.base = null;
    }
}

// 全局地图实例
const gameMap = new GameMap();
