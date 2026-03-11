/**
 * 坦克大战 - 数值配置系统
 * 所有游戏数值集中管理，支持实时调整
 */

// 游戏数值配置（V1.0.0）
window.TANK_CONFIG = {
  // 玩家配置
  player: {
    speed: 4,               // 移动速度（格/帧）
    lives: 3,               // 生命数
    bulletSpeed: 8,         // 子弹速度
    bulletCooldown: 18,     // 子弹冷却（帧数）
    damage: 1,              // 攻击力
    width: 36,              // 宽度
    height: 36              // 高度
  },
  
  // 敌方坦克配置
  enemies: {
    normal: {
      speed: 2,             // 移动速度
      hp: 1,                // 血量
      score: 100,           // 分数
      damage: 1,            // 攻击力
      shootDelay: 60,       // 射击冷却（帧数）
      width: 36,
      height: 36
    },
    fast: {
      speed: 4,
      hp: 1,
      score: 200,
      damage: 1,
      shootDelay: 45,
      width: 36,
      height: 36
    },
    heavy: {
      speed: 1.5,
      hp: 3,
      score: 300,
      damage: 1,
      shootDelay: 90,
      width: 36,
      height: 36
    },
    special: {
      speed: 3,
      hp: 2,
      score: 400,
      damage: 2,
      shootDelay: 40,
      width: 36,
      height: 36
    }
  },
  
  // 子弹配置
  bullets: {
    player: {
      speed: 8,
      width: 6,
      height: 6,
      damage: 1
    },
    enemy: {
      speed: 6,
      width: 6,
      height: 6,
      damage: 1
    }
  },
  
  // 地图配置
  map: {
    tileSize: 40,           // 格子大小
    cols: 20,               // 列数
    rows: 15                // 行数
  },
  
  // 基地配置
  base: {
    width: 40,
    height: 40,
    position: { x: 360, y: 560 }
  },
  
  // 敌人生成配置
  spawn: {
    interval: 180,          // 生成间隔（帧数）
    maxEnemies: 4,          // 最大敌人数
    totalToSpawn: 20        // 总敌人数
  },
  
  // 性能配置
  performance: {
    targetFPS: 60,
    maxBullets: 100,
    memoryLimit: 100        // MB
  }
};

// 保存配置到 localStorage
function saveConfig() {
  localStorage.setItem('tank_config', JSON.stringify(window.TANK_CONFIG));
  console.log('✅ 配置已保存');
}

// 从 localStorage 加载配置
function loadConfig() {
  const saved = localStorage.getItem('tank_config');
  if (saved) {
    try {
      const config = JSON.parse(saved);
      // 合并配置（保留新增字段）
      window.TANK_CONFIG = mergeConfig(window.TANK_CONFIG, config);
      console.log('✅ 配置已加载');
    } catch (e) {
      console.error('❌ 配置加载失败:', e);
    }
  }
}

// 合并配置（递归）
function mergeConfig(defaultConfig, savedConfig) {
  const result = { ...defaultConfig };
  
  for (const key in savedConfig) {
    if (savedConfig[key] && typeof savedConfig[key] === 'object' && !Array.isArray(savedConfig[key])) {
      result[key] = mergeConfig(defaultConfig[key] || {}, savedConfig[key]);
    } else {
      result[key] = savedConfig[key];
    }
  }
  
  return result;
}

// 重置为默认配置
function resetConfig() {
  localStorage.removeItem('tank_config');
  location.reload();
}

// 自动加载配置
loadConfig();
