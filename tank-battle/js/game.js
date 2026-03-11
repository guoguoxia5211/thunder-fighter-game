const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = false;
let score = 0;
let lives = 3;
let player, bullets, enemies, keys;

function init() {
  keys = {};
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' && gameRunning) {
      player.shoot();
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => keys[e.key] = false);
}

function startGame() {
  document.getElementById('startScreen').style.display = 'none';
  gameRunning = true;
  score = 0;
  lives = 3;
  player = new Player(275, 500);
  bullets = [];
  enemies = [];
  updateUI();
  gameLoop();
  setInterval(() => {
    if (gameRunning && enemies.length < 4) {
      enemies.push(new Enemy());
    }
  }, 2000);
}

function restartGame() {
  document.getElementById('gameOver').classList.remove('show');
  startGame();
}

function updateUI() {
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
}

function gameOver() {
  gameRunning = false;
  document.getElementById('finalScore').textContent = score;
  document.getElementById('gameOver').classList.add('show');
}

function gameLoop() {
  if (!gameRunning) return;
  
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  player.update();
  player.draw();
  
  bullets.forEach((b, i) => {
    b.update();
    b.draw();
    if (b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);
  });
  
  enemies.forEach((e, ei) => {
    e.update();
    e.draw();
    
    bullets.forEach((b, bi) => {
      if (rectIntersect(b, e)) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score += 100;
        updateUI();
      }
    });
    
    if (rectIntersect(player, e)) {
      enemies.splice(ei, 1);
      lives--;
      updateUI();
      if (lives <= 0) gameOver();
    }
    
    if (e.y > canvas.height) {
      enemies.splice(ei, 1);
      lives--;
      updateUI();
      if (lives <= 0) gameOver();
    }
  });
  
  requestAnimationFrame(gameLoop);
}

function rectIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.width = 40; this.height = 40;
    this.speed = 5;
  }
  update() {
    if (keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
    if (keys['ArrowRight'] && this.x < canvas.width - this.width) this.x += this.speed;
    if (keys['ArrowUp'] && this.y > 40) this.y -= this.speed;
    if (keys['ArrowDown'] && this.y < canvas.height - this.height) this.y += this.speed;
  }
  shoot() {
    bullets.push(new Bullet(this.x + this.width/2 - 3, this.y));
  }
  draw() {
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#26a69a';
    ctx.fillRect(this.x + 15, this.y - 10, 10, 20);
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.width = 6; this.height = 15;
    this.speed = 10;
  }
  update() { this.y -= this.speed; }
  draw() {
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor() {
    this.x = Math.random() * (canvas.width - 40);
    this.y = -40;
    this.width = 40; this.height = 40;
    this.speed = 2 + Math.random() * 2;
  }
  update() { this.y += this.speed; }
  draw() {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(this.x + 5, this.y + 5, 30, 30);
  }
}

init();
