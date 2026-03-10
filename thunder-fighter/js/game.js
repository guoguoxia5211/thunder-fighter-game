/**
 * 雷霆战机 V1.0.1
 * 使用图片渲染，支持美术替换
 */

class ThunderFighter {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // 设置画布大小
    this.canvas.width = Math.min(480, window.innerWidth - 20);
    this.canvas.height = Math.min(720, window.innerHeight - 100);
    
    // 加载数值配置
    this.loadConfig();
    
    // 游戏配置
    this.playerLives = window.GAME_CONFIG.player.lives;
    this.score = 0;
    this.bossScore = window.GAME_CONFIG.game.bossInterval;
    this.isBossMode = false;
    
    // 背景流动
    this.bgY = 0;
    this.bgSpeed = window.GAME_CONFIG.background.speed;
    
    // 游戏对象
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.items = [];
    this.explosions = [];
    this.boss = null;
    
    // 游戏状态
    this.isGameOver = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.enemySpawnTimer = 0;
    this.missileTimer = 0;
    
    // 图片资源
    this.images = {};
    this.stars = [];
    
    // 注册全局实例
    window.gameInstance = this;
    
    this.init();
  }

  async init() {
    await this.loadImages();
    this.setupEvents();
    this.resetGame();
    this.gameLoop(0);
  }

  async loadImages() {
    const imageList = {
      player: 'assets/player/player.png',
      enemy1: 'assets/enemies/enemy1.png',
      enemy2: 'assets/enemies/enemy2.png',
      enemy3: 'assets/enemies/enemy3.png',
      boss: 'assets/enemies/boss.png',
      bullet: 'assets/bullets/bullet.png',
      itemDouble: 'assets/items/double.png',
      itemShield: 'assets/items/shield.png',
      itemBomb: 'assets/items/bomb.png',
      explosion: 'assets/explosions/explosion.png',
      bg: 'assets/bg/bg.png'
    };

    for (const [key, src] of Object.entries(imageList)) {
      this.images[key] = await this.loadImage(src);
    }
  }

  loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        resolve(this.createPlaceholder(src));
      };
      img.src = src + '?t=' + Date.now();
    });
  }

  createPlaceholder(src) {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    if (src.includes('player')) ctx.fillStyle = '#4ECDC4';
    else if (src.includes('enemy') || src.includes('boss')) ctx.fillStyle = '#FF6B6B';
    else if (src.includes('bullet')) ctx.fillStyle = '#FFEAA7';
    else if (src.includes('item')) ctx.fillStyle = '#2ECC71';
    else if (src.includes('explosion')) ctx.fillStyle = '#FF9F43';
    else ctx.fillStyle = '#95A5A6';
    
    ctx.fillRect(0, 0, 50, 50);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, 47, 47);
    return canvas.toDataURL();
  }

  resetGame() {
    const cfg = window.GAME_CONFIG;
    this.player = {
      x: this.canvas.width / 2 - cfg.player.width / 2,
      y: this.canvas.height - 100,
      width: cfg.player.width,
      height: cfg.player.height,
      speed: cfg.player.speed,
      isDead: false,
      power: cfg.player.power,
      hasShield: false
    };
    
    this.enemies = [];
    this.bullets = [];
    this.enemyBullets = [];
    this.items = [];
    this.explosions = [];
    this.boss = null;
    this.isGameOver = false;
    this.isBossMode = false;
    this.score = 0;
    this.playerLives = 3;
    this.updateUI();
    this.hideGameOver();
  }

  setupEvents() {
    let isDragging = false;
    
    const handleMove = (x, y) => {
      if (this.player && !this.player.isDead) {
        this.player.x = x - this.player.width / 2;
        this.player.y = y - this.player.height / 2;
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = this.canvas.getBoundingClientRect();
      handleMove(e.clientX - rect.left, e.clientY - rect.top);
    });
    this.canvas.addEventListener('mouseup', () => isDragging = false);
    this.canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const rect = this.canvas.getBoundingClientRect();
        handleMove(e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isDragging = true;
      const rect = this.canvas.getBoundingClientRect();
      handleMove(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (isDragging) {
        const rect = this.canvas.getBoundingClientRect();
        handleMove(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      }
    });
    
    this.canvas.addEventListener('touchend', () => isDragging = false);

    setInterval(() => {
      if (this.player && !this.player.isDead && !this.isGameOver) {
        this.shoot();
      }
    }, 300);

    document.getElementById('restartBtn').addEventListener('click', () => {
      this.resetGame();
    });
  }

  shoot() {
    const cfg = window.GAME_CONFIG;
    const bulletCount = this.player.power;
    for (let i = 0; i < bulletCount; i++) {
      const offset = bulletCount > 1 ? (i - (bulletCount - 1) / 2) * 15 : 0;
      this.bullets.push({
        x: this.player.x + this.player.width / 2 + offset - cfg.bullets.normal.width/2,
        y: this.player.y,
        width: cfg.bullets.normal.width,
        height: cfg.bullets.normal.height,
        speed: cfg.bullets.normal.speed,
        type: 'normal',
        target: null
      });
    }
    
    this.missileTimer++;
    if (this.missileTimer >= cfg.bullets.missile.launchInterval) {
      this.missileTimer = 0;
      this.shootMissile();
    }
  }

  shootMissile() {
    const cfg = window.GAME_CONFIG;
    let target = null;
    let minDist = Infinity;
    
    [...this.enemies, this.boss].forEach(enemy => {
      if (enemy) {
        const dist = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
        if (dist < minDist) {
          minDist = dist;
          target = enemy;
        }
      }
    });
    
    this.bullets.push({
      x: this.player.x + this.player.width / 2 - cfg.bullets.missile.width/2,
      y: this.player.y,
      width: cfg.bullets.missile.width,
      height: cfg.bullets.missile.height,
      speed: cfg.bullets.missile.speed,
      type: 'missile',
      target: target,
      angle: -Math.PI / 2,
      turnRate: cfg.bullets.missile.turnRate,
      curvePhase: 0,
      curveAmplitude: cfg.bullets.missile.curveAmplitude,
      curveFrequency: cfg.bullets.missile.curveFrequency
    });
  }

  spawnEnemy() {
    const cfg = window.GAME_CONFIG;
    const types = ['enemy1', 'enemy2', 'enemy3'];
    const type = types[Math.floor(Math.random() * types.length)];
    const config = cfg.enemies[type];
    
    const x = Math.random() * (this.canvas.width - config.width);
    
    this.enemies.push({
      type,
      x,
      y: -config.height,
      width: config.width,
      height: config.height,
      hp: config.hp,
      maxHp: config.hp,
      speed: config.speed,
      score: config.score
    });
  }

  spawnBoss() {
    const cfg = window.GAME_CONFIG;
    this.isBossMode = true;
    this.boss = {
      x: this.canvas.width / 2 - cfg.boss.width / 2,
      y: -cfg.boss.height,
      width: cfg.boss.width,
      height: cfg.boss.height,
      hp: cfg.boss.hp,
      maxHp: cfg.boss.hp,
      speed: cfg.boss.speed,
      state: 'entering',
      shootTimer: 0,
      moveDir: 1
    };
  }

  spawnItem(x, y) {
    const cfg = window.GAME_CONFIG;
    if (Math.random() > cfg.items.dropRate) return;
    
    const types = ['double', 'shield', 'bomb'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    this.items.push({
      x,
      y,
      width: cfg.items.width,
      height: cfg.items.height,
      type,
      speed: cfg.items.speed
    });
  }

  createExplosion(x, y, size = 50, color = null) {
    this.explosions.push({
      x,
      y,
      size,
      timer: 0,
      maxTime: 500,
      color
    });
  }

  update(deltaTime) {
    if (this.isGameOver || this.isPaused) return;

    if (this.player.isDead) {
      this.playerLives--;
      this.updateUI();
      
      if (this.playerLives <= 0) {
        this.gameOver();
      } else {
        setTimeout(() => {
          this.player.isDead = false;
          this.player.x = this.canvas.width / 2 - this.player.width / 2;
          this.player.y = this.canvas.height - 100;
        }, 1500);
      }
    }

    // 更新子弹
    this.bullets.forEach((bullet, index) => {
      if (bullet.type === 'missile' && bullet.target) {
        const targetX = bullet.target.x + bullet.target.width / 2;
        const targetY = bullet.target.y + bullet.target.height / 2;
        
        const dx = targetX - (bullet.x + bullet.width / 2);
        const dy = targetY - (bullet.y + bullet.height / 2);
        const targetAngle = Math.atan2(dy, dx);
        
        let angleDiff = targetAngle - bullet.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        bullet.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), bullet.turnRate || 0.12);
        
        bullet.curvePhase += bullet.curveFrequency;
        const curveOffset = Math.sin(bullet.curvePhase) * bullet.curveAmplitude;
        
        bullet.x += Math.cos(bullet.angle) * bullet.speed * deltaTime + curveOffset;
        bullet.y += Math.sin(bullet.angle) * bullet.speed * deltaTime;
        
        this.explosions.push({
          x: bullet.x + bullet.width / 2,
          y: bullet.y + bullet.height,
          size: 6 + Math.random() * 4,
          timer: 0,
          maxTime: 400,
          color: `rgba(255, ${100 + Math.random() * 100}, 50, 0.7)`
        });
        
        const targetExists = this.enemies.includes(bullet.target) || bullet.target === this.boss;
        if (!targetExists && bullet.target) {
          bullet.target = null;
        }
        
        if (bullet.x < -20 || bullet.x > this.canvas.width + 20 || bullet.y < -20 || bullet.y > this.canvas.height + 20) {
          this.bullets.splice(index, 1);
        }
      } else {
        bullet.y -= bullet.speed * deltaTime;
        if (bullet.y < -bullet.height) this.bullets.splice(index, 1);
      }
    });

    this.enemyBullets.forEach((bullet, index) => {
      bullet.y += (bullet.speed || 300) * deltaTime;
      if (bullet.y > this.canvas.height) this.enemyBullets.splice(index, 1);
    });

    this.enemies.forEach((enemy, index) => {
      enemy.y += enemy.speed * deltaTime;
      
      this.bullets.forEach((bullet, bIndex) => {
        if (this.checkCollision(bullet, enemy)) {
          enemy.hp--;
          this.bullets.splice(bIndex, 1);
          
          if (enemy.hp <= 0) {
            this.score += enemy.score;
            this.spawnItem(enemy.x, enemy.y);
            this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            this.enemies.splice(index, 1);
            this.updateUI();
            
            if (this.score >= this.bossScore && !this.isBossMode) {
              this.spawnBoss();
            }
          }
        }
      });

      if (!this.player.isDead && this.checkCollision(enemy, this.player)) {
        if (!this.player.hasShield) {
          this.player.isDead = true;
        }
        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        this.enemies.splice(index, 1);
      }

      if (enemy.y > this.canvas.height) this.enemies.splice(index, 1);
    });

    if (this.boss) {
      if (this.boss.state === 'entering') {
        this.boss.y += this.boss.speed * deltaTime;
        if (this.boss.y >= 50) this.boss.state = 'fighting';
      } else {
        this.boss.x += this.boss.speed * this.boss.moveDir * deltaTime;
        if (this.boss.x <= 0 || this.boss.x >= this.canvas.width - this.boss.width) {
          this.boss.moveDir *= -1;
        }
        
        this.boss.shootTimer += deltaTime;
        if (this.boss.shootTimer > 1) {
          this.enemyBullets.push({
            x: this.boss.x + this.boss.width/2 - 5,
            y: this.boss.y + this.boss.height,
            width: 10,
            height: 20,
            speed: 300
          });
          this.boss.shootTimer = 0;
        }
      }

      this.bullets.forEach((bullet, bIndex) => {
        if (this.checkCollision(bullet, this.boss)) {
          this.boss.hp--;
          this.bullets.splice(bIndex, 1);
          
          if (this.boss.hp <= 0) {
            this.score += 5000;
            this.createExplosion(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2, 150);
            this.boss = null;
            this.isBossMode = false;
            this.bossScore += 2000;
            this.updateUI();
          }
        }
      });
    }

    this.items.forEach((item, index) => {
      item.y += item.speed * deltaTime;
      
      if (!this.player.isDead && this.checkCollision(item, this.player)) {
        this.applyItem(item);
        this.items.splice(index, 1);
      }
      
      if (item.y > this.canvas.height) this.items.splice(index, 1);
    });

    this.explosions.forEach((exp, index) => {
      exp.timer += deltaTime * 1000;
      if (exp.timer >= exp.maxTime) {
        this.explosions.splice(index, 1);
      }
    });

    if (!this.isBossMode) {
      this.enemySpawnTimer += deltaTime;
      if (this.enemySpawnTimer > 1.5) {
        this.spawnEnemy();
        this.enemySpawnTimer = 0;
      }
    }

    if (!this.player.isDead && !this.player.hasShield) {
      this.enemyBullets.forEach((bullet, index) => {
        if (this.checkCollision(bullet, this.player)) {
          this.player.isDead = true;
          this.enemyBullets.splice(index, 1);
        }
      });
    }
  }

  applyItem(item) {
    const cfg = window.GAME_CONFIG;
    switch(item.type) {
      case 'double':
        this.player.power = Math.min(this.player.power + cfg.items.double.power, cfg.player.maxPower);
        break;
      case 'shield':
        this.player.hasShield = true;
        setTimeout(() => this.player.hasShield = false, cfg.items.shield.duration);
        break;
      case 'bomb':
        this.enemyBullets = [];
        this.score += cfg.items.bomb.score;
        break;
    }
    this.updateUI();
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  draw() {
    // 先绘制渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(0.5, '#302b63');
    gradient.addColorStop(1, '#24243e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制流动星星
    this.drawFlowingStars();
    
    // 叠加背景图（如果有）
    if (this.images.bg) {
      this.bgY += this.bgSpeed * (1/60);
      if (this.bgY >= this.canvas.height) {
        this.bgY = 0;
      }
      this.ctx.globalAlpha = 0.3;
      this.ctx.drawImage(this.images.bg, 0, this.bgY - this.canvas.height, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.images.bg, 0, this.bgY, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;
    }

    // 绘制玩家
    if (this.player && !this.player.isDead) {
      if (this.images.player) {
        this.ctx.drawImage(this.images.player, this.player.x, this.player.y, this.player.width, this.player.height);
      } else {
        this.ctx.fillStyle = '#4ECDC4';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
      }
      
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
      
      if (this.player.hasShield) {
        this.ctx.strokeStyle = '#4ECDC4';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(
          this.player.x + this.player.width/2,
          this.player.y + this.player.height/2,
          this.player.width/1.5,
          0, Math.PI * 2
        );
        this.ctx.stroke();
      }
    }

    // 绘制敌人
    this.enemies.forEach(enemy => {
      const img = this.images[enemy.type];
      if (img) {
        this.ctx.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
      } else {
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
      
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      if (enemy.hp < enemy.maxHp) {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 5);
        this.ctx.fillStyle = '#2ECC71';
        this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * (enemy.hp / enemy.maxHp), 5);
      }
    });

    // 绘制 BOSS
    if (this.boss) {
      if (this.images.boss) {
        this.ctx.drawImage(this.images.boss, this.boss.x, this.boss.y, this.boss.width, this.boss.height);
      } else {
        this.ctx.fillStyle = '#9B59B6';
        this.ctx.fillRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height);
      }
      
      this.ctx.strokeStyle = '#FFD700';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height);
      
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.boss.x, this.boss.y - 15, this.boss.width, 8);
      this.ctx.fillStyle = '#2ECC71';
      this.ctx.fillRect(this.boss.x, this.boss.y - 15, this.boss.width * (this.boss.hp / this.boss.maxHp), 8);
    }

    // 绘制子弹
    this.bullets.forEach(bullet => {
      if (bullet.type === 'missile') {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#FF4757';
        this.ctx.fillStyle = '#FF4757';
        this.ctx.beginPath();
        this.ctx.arc(bullet.x + bullet.width/2, bullet.y + bullet.height/2, bullet.width/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFA502';
        this.ctx.beginPath();
        this.ctx.moveTo(bullet.x + bullet.width/2 - 3, bullet.y + bullet.height);
        this.ctx.lineTo(bullet.x + bullet.width/2 + 3, bullet.y + bullet.height);
        this.ctx.lineTo(bullet.x + bullet.width/2, bullet.y + bullet.height + 15);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
      } else {
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#FFEAA7';
        
        if (this.images.bullet) {
          this.ctx.drawImage(this.images.bullet, bullet.x, bullet.y, bullet.width, bullet.height);
        } else {
          this.ctx.fillStyle = '#FFEAA7';
          this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        this.ctx.shadowBlur = 0;
      }
    });

    this.ctx.fillStyle = '#FF6B6B';
    this.enemyBullets.forEach(bullet => {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // 绘制道具
    this.items.forEach(item => {
      const img = this.images[`item${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`];
      if (img) {
        this.ctx.drawImage(img, item.x, item.y, item.width, item.height);
      } else {
        this.ctx.fillStyle = '#2ECC71';
        this.ctx.beginPath();
        this.ctx.arc(item.x + item.width/2, item.y + item.height/2, item.width/2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(item.x, item.y, item.width, item.height);
    });

    // 绘制爆炸效果
    this.explosions.forEach(exp => {
      const progress = exp.timer / exp.maxTime;
      this.ctx.fillStyle = exp.color || `rgba(255, 100, 50, ${1 - progress})`;
      this.ctx.beginPath();
      this.ctx.arc(exp.x, exp.y, exp.size * progress, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawFlowingStars() {
    if (this.stars.length === 0) {
      for (let i = 0; i < 100; i++) {
        this.stars.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 100 + 50,
          brightness: Math.random()
        });
      }
    }
    
    this.stars.forEach(star => {
      star.y += star.speed * (1/60);
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
      
      star.brightness += 0.05;
      const alpha = 0.5 + Math.sin(star.brightness) * 0.5;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
  }

  gameLoop(timestamp) {
    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('lives').textContent = '❤️'.repeat(this.playerLives);
    
    fetch('VERSION.json?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        document.getElementById('version').textContent = data.version || 'V1.0.0';
      })
      .catch(() => {
        document.getElementById('version').textContent = 'V1.0.2';
      });
  }

  // 应用新配置（实时生效）
  applyConfig() {
    const cfg = window.GAME_CONFIG;
    
    // 更新玩家属性
    if (this.player) {
      this.player.speed = cfg.player.speed;
      this.player.width = cfg.player.width;
      this.player.height = cfg.player.height;
    }
    
    this.playerLives = cfg.player.lives;
    this.bgSpeed = cfg.background.speed;
    this.bossScore = cfg.game.bossInterval;
    
    // 更新 UI
    this.updateUI();
    
    console.log('✅ 配置已应用');
  }

  // 加载配置
  loadConfig() {
    // 确保配置已加载
    if (!window.GAME_CONFIG) {
      console.warn('⚠️ 配置未加载，使用默认值');
    }
  }

  showComboText(combo) {
    const comboText = document.getElementById('comboText');
    if (comboText) {
      comboText.textContent = `${combo}连击!`;
      comboText.classList.add('show');
      setTimeout(() => comboText.classList.remove('show'), 800);
    }
  }

  showGameOver() {
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('gameOver').classList.add('show');
  }

  hideGameOver() {
    document.getElementById('gameOver').classList.remove('show');
  }
}

window.addEventListener('load', () => {
  new ThunderFighter();
});
