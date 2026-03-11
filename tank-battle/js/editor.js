/**
 * 坦克大战 - 美术替换系统
 */

const TANK_EDITOR_CONFIG = {
  PASSWORD: 'admin123'
};

const TANK_RESOURCES = [
  { id: 'player', name: '🚀 玩家坦克', category: '坦克', color: '#4ecdc4' },
  { id: 'enemy_normal', name: '🔴 普通敌人', category: '敌人', color: '#e74c3c' },
  { id: 'enemy_fast', name: '🟠 快速敌人', category: '敌人', color: '#f39c12' },
  { id: 'enemy_heavy', name: '🟣 重装敌人', category: '敌人', color: '#8e44ad' },
  { id: 'enemy_special', name: '🩷 特种敌人', category: '敌人', color: '#e91e63' },
  { id: 'brick', name: '🧱 砖块', category: '地图', color: '#d35400' },
  { id: 'steel', name: '🟦 钢板', category: '地图', color: '#7f8c8d' },
  { id: 'base', name: '🏠 基地', category: '地图', color: '#f1c40f' },
];

let tankUploads = {};

function openTankEditor() {
  const password = prompt('🔐 请输入美术编辑密码：\n(默认密码：admin123)');
  if (!password) return;
  if (password === TANK_EDITOR_CONFIG.PASSWORD) {
    showTankEditor();
  } else {
    alert('❌ 密码错误！');
  }
}

function showTankEditor() {
  const overlay = document.createElement('div');
  overlay.id = 'tank-editor-overlay';
  overlay.innerHTML = `
    <div class="tank-editor-container">
      <div class="tank-editor-header">
        <h2>🎨 坦克大战 - 美术编辑</h2>
        <button class="tank-close-btn" onclick="closeTankEditor()">✕ 关闭</button>
      </div>
      <div class="tank-editor-content">
        <div class="tank-category-filter">
          <button class="tank-filter-btn active" onclick="filterTankCategory('all')">全部</button>
          <button class="tank-filter-btn" onclick="filterTankCategory('坦克')">坦克</button>
          <button class="tank-filter-btn" onclick="filterTankCategory('敌人')">敌人</button>
          <button class="tank-filter-btn" onclick="filterTankCategory('地图')">地图</button>
        </div>
        <div id="tank-resource-list" class="tank-resource-list"></div>
      </div>
      <div class="tank-editor-footer">
        <div class="tank-status" id="tank-editor-status">✅ 就绪</div>
        <div class="tank-actions">
          <button class="tank-btn tank-btn-refresh" onclick="refreshTankGame()">🔄 刷新游戏</button>
          <button class="tank-btn tank-btn-deploy" onclick="deployTank()">🚀 保存并部署</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  addTankEditorStyles();
  renderTankResources('all');
}

function closeTankEditor() {
  const overlay = document.getElementById('tank-editor-overlay');
  const style = document.getElementById('tank-editor-style');
  if (overlay) overlay.remove();
  if (style) style.remove();
}

function addTankEditorStyles() {
  const style = document.createElement('style');
  style.id = 'tank-editor-style';
  style.textContent = `
    #tank-editor-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 9999;
      overflow-y: auto;
      padding: 20px;
    }
    .tank-editor-container {
      background: white;
      border-radius: 15px;
      max-width: 600px;
      margin: 20px auto;
      overflow: hidden;
    }
    .tank-editor-header {
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tank-editor-header h2 { margin: 0; font-size: 18px; }
    .tank-close-btn {
      background: rgba(255,255,255,0.2);
      border: none; color: white;
      padding: 8px 15px; border-radius: 6px;
      cursor: pointer; font-weight: bold;
    }
    .tank-category-filter {
      padding: 15px;
      background: #f8f9fa;
      display: flex;
      gap: 8px; flex-wrap: wrap;
    }
    .tank-filter-btn {
      padding: 8px 15px;
      border: none; border-radius: 20px;
      background: #e0e0e0;
      cursor: pointer; font-size: 13px;
    }
    .tank-filter-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    .tank-editor-content { padding: 20px; max-height: 50vh; overflow-y: auto; }
    .tank-resource-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }
    .tank-resource-item {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.3s;
    }
    .tank-resource-item:hover {
      border-color: #667eea;
      transform: translateY(-3px);
    }
    .tank-resource-preview {
      width: 60px; height: 60px;
      object-fit: contain;
      margin: 0 auto 10px;
      border: 2px solid #ddd;
      border-radius: 8px;
      background: white;
    }
    .tank-resource-name {
      font-size: 13px;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .tank-upload-btn {
      background: linear-gradient(135deg, #3498db, #2980b9);
      border: none;
      padding: 8px 15px;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .tank-editor-footer {
      background: #f8f9fa;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e0e0e0;
    }
    .tank-status { color: #27ae60; font-weight: bold; }
    .tank-actions { display: flex; gap: 10px; }
    .tank-btn {
      padding: 10px 20px;
      border: none; border-radius: 8px;
      cursor: pointer; font-weight: bold;
      font-size: 14px;
    }
    .tank-btn-refresh { background: #95a5a6; color: white; }
    .tank-btn-deploy { background: #27ae60; color: white; }
    .tank-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
  `;
}

function renderTankResources(category) {
  const list = document.getElementById('tank-resource-list');
  const filtered = category === 'all' ? TANK_RESOURCES : TANK_RESOURCES.filter(r => r.category === category);
  list.innerHTML = filtered.map(r => `
    <div class="tank-resource-item">
      <img class="tank-resource-preview" id="tank-preview-${r.id}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect fill='${encodeURIComponent(r.color)}' x='3' y='3' width='30' height='30'/%3E%3C/svg%3E" alt="${r.name}">
      <div class="tank-resource-name">${r.name}</div>
      <button class="tank-upload-btn" onclick="document.getElementById('tank-upload-${r.id}').click()">📤 上传</button>
      <input type="file" id="tank-upload-${r.id}" accept="image/*" style="display:none" onchange="uploadTankResource('${r.id}', event)">
    </div>
  `).join('');
}

function filterTankCategory(category) {
  document.querySelectorAll('.tank-filter-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderTankResources(category);
}

function uploadTankResource(id, event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    tankUploads[id] = e.target.result;
    document.getElementById('tank-preview-' + id).src = e.target.result;
    const status = document.getElementById('tank-editor-status');
    status.textContent = '✅ ' + file.name + ' 已上传';
    status.style.color = '#27ae60';
  };
  reader.readAsDataURL(file);
}

function deployTank() {
  if (Object.keys(tankUploads).length === 0) {
    const status = document.getElementById('tank-editor-status');
    status.textContent = '⚠️ 请先上传资源';
    status.style.color = '#f39c12';
    return;
  }
  localStorage.setItem('tank_resources', JSON.stringify(tankUploads));
  const status = document.getElementById('tank-editor-status');
  status.textContent = '✅ 已保存并部署';
  status.style.color = '#27ae60';
  setTimeout(() => { closeTankEditor(); location.reload(); }, 1000);
}

function refreshTankGame() { location.reload(); }
