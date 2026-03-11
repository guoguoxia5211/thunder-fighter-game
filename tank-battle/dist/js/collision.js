// 碰撞检测模块
class CollisionDetector {
    constructor() {
        this.colliders = [];
    }

    // 检测两个矩形是否碰撞
    rectIntersect(rect1, rect2) {
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect1.x > rect2.x + rect2.width ||
            rect1.y + rect1.height < rect2.y ||
            rect1.y > rect2.y + rect2.height
        );
    }

    // 检测子弹与坦克碰撞
    checkBulletTank(bullet, tank) {
        const bulletRect = {
            x: bullet.x,
            y: bullet.y,
            width: bullet.width,
            height: bullet.height
        };
        
        const tankRect = {
            x: tank.x,
            y: tank.y,
            width: tank.width,
            height: tank.height
        };
        
        return this.rectIntersect(bulletRect, tankRect);
    }

    // 检测子弹与墙碰撞
    checkBulletWall(bullet, walls) {
        for (const wall of walls) {
            if (wall.destroyable || wall.type === 'steel') {
                const wallRect = {
                    x: wall.x,
                    y: wall.y,
                    width: wall.width,
                    height: wall.height
                };
                
                const bulletRect = {
                    x: bullet.x,
                    y: bullet.y,
                    width: bullet.width,
                    height: bullet.height
                };
                
                if (this.rectIntersect(bulletRect, wallRect)) {
                    return wall;
                }
            }
        }
        return null;
    }

    // 检测坦克与墙碰撞
    checkTankWall(tank, walls) {
        const tankRect = {
            x: tank.x,
            y: tank.y,
            width: tank.width,
            height: tank.height
        };
        
        for (const wall of walls) {
            if (wall.type === 'river') continue; // 河流不碰撞
            
            const wallRect = {
                x: wall.x,
                y: wall.y,
                width: wall.width,
                height: wall.height
            };
            
            if (this.rectIntersect(tankRect, wallRect)) {
                return wall;
            }
        }
        return null;
    }

    // 检测坦克与坦克碰撞
    checkTankTank(tank1, tank2) {
        const rect1 = {
            x: tank1.x,
            y: tank1.y,
            width: tank1.width,
            height: tank1.height
        };
        
        const rect2 = {
            x: tank2.x,
            y: tank2.y,
            width: tank2.width,
            height: tank2.height
        };
        
        return this.rectIntersect(rect1, rect2);
    }

    // 检测子弹与子弹碰撞
    checkBulletBullet(bullet1, bullet2) {
        const rect1 = {
            x: bullet1.x,
            y: bullet1.y,
            width: bullet1.width,
            height: bullet1.height
        };
        
        const rect2 = {
            x: bullet2.x,
            y: bullet2.y,
            width: bullet2.width,
            height: bullet2.height
        };
        
        return this.rectIntersect(rect1, rect2);
    }

    // 检测坦克与基地碰撞
    checkTankBase(tank, base) {
        if (!base) return false;
        
        const tankRect = {
            x: tank.x,
            y: tank.y,
            width: tank.width,
            height: tank.height
        };
        
        const baseRect = {
            x: base.x,
            y: base.y,
            width: base.width,
            height: base.height
        };
        
        return this.rectIntersect(tankRect, baseRect);
    }
}

// 全局实例
const collisionDetector = new CollisionDetector();
