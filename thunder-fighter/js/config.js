/**
 * 雷霆战机 - 数值配置系统
 * 所有游戏数值集中管理，支持实时调整
 */

// 游戏数值配置（V1.0.2）
window.GAME_CONFIG = {
  // 玩家配置
  player: {
    speed: 300,           // 移动速度（像素/秒）
    lives: 3,             // 生命数
    bulletSpeed: 500,     // 子弹速度
    bulletCooldown: 300,  // 子弹冷却（毫秒）
    power: 1,             // 初始火力等级
    maxPower: 3,          // 最大火力等级
    width: 50,            // 宽度
    height: 50            // 高度
  },
  
  // 敌机配置（每种独立配置）
  enemies: {
    enemy1: {
      speed: 150,         // 移动速度
      hp: 1,              // 血量
      score: 100,         // 分数
      width: 40,          // 宽度
      height: 40,         // 高度
      spawnRate: 1.5      // 生成频率（秒）
    },
    enemy2: {
      speed: 100,
      hp: 3,
      score: 300,
      width: 50,
      height: 50,
      spawnRate: 2.0
    },
    enemy3: {
      speed: 80,
      hp: 5,
      score: 500,
      width: 60,
      height: 60,
      spawnRate: 2.5
    }
  },
  
  // BOSS 配置
  boss: {
    hp: 50,
    score: 5000,
    width: 150,
    height: 150,
    speed: 100,
    shootInterval: 1.0,   // 射击间隔（秒）
    spawnScore: 1000      // 出现分数阈值
  },
  
  // 子弹配置
  bullets: {
    normal: {
      speed: 500,
      width: 10,
      height: 20,
      damage: 1
    },
    missile: {
      speed: 300,
      width: 12,
      height: 25,
      damage: 2,
      turnRate: 0.12,
      curveAmplitude: 3,
      curveFrequency: 0.15,
      launchInterval: 3   // 每 3 发普通子弹发射 1 枚导弹
    },
    enemy: {
      speed: 300,
      width: 10,
      height: 20,
      damage: 1
    }
  },
  
  // 道具配置
  items: {
    dropRate: 0.3,        // 掉落率（30%）
    speed: 100,           // 下落速度
    width: 30,
    height: 30,
    double: { duration: 0, power: 1 },    // 双发道具
    shield: { duration: 5000 },           // 护盾持续时间（毫秒）
    bomb: { score: 50 }                   // 炸弹加分
  },
  
  // 背景配置
  background: {
    speed: 50,            // 流动速度
    alpha: 0.3            // 透明度
  },
  
  // 游戏配置
  game: {
    bossInterval: 2000,   // BOSS 分数间隔
    starCount: 100,       // 星星数量
    starSpeed: 100        // 星星速度
  }
};

// 保存配置到 localStorage
function saveConfig() {
  localStorage.setItem('thunder-fighter-config', JSON.stringify(window.GAME_CONFIG));
  console.log('✅ 配置已保存');
}

// 从 localStorage 加载配置
function loadConfig() {
  const saved = localStorage.getItem('thunder-fighter-config');
  if (saved) {
    try {
      const loaded = JSON.parse(saved);
      // 合并配置（保留新增字段）
      window.GAME_CONFIG = deepMerge(window.GAME_CONFIG, loaded);
      console.log('✅ 配置已加载');
    } catch (e) {
      console.error('❌ 配置加载失败:', e);
    }
  }
}

// 深度合并对象
function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// 重置为默认配置
function resetConfig() {
  localStorage.removeItem('thunder-fighter-config');
  location.reload();
}

// 自动加载配置
loadConfig();
