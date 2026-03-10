/**
 * 雷霆战机 - 美术替换系统
 * 密码保护，实时预览
 */

// 配置
const EDITOR_CONFIG = {
  PASSWORD: 'admin123',
  API_URL: 'http://182.92.166.51:8000/api',
  GAME_URL: '/thunder-fighter/'
};

// 资源列表（友好名称）
const RESOURCES = [
  { id: 'player', name: '✈️ 我方战机', category: '战机', color: '#4ECDC4' },
  { id: 'enemy1', name: '👾 敌机 Type-1 (小型)', category: '敌机', color: '#FF6B6B' },
  { id: 'enemy2', name: '👾 敌机 Type-2 (中型)', category: '敌机', color: '#FF6B6B' },
  { id: 'enemy3', name: '👾 敌机 Type-3 (大型)', category: '敌机', color: '#FF6B6B' },
  { id: 'boss', name: '💀 BOSS 战机', category: 'BOSS', color: '#9B59B6' },
  { id: 'bullet', name: '💫 玩家子弹', category: '子弹', color: '#FFEAA7' },
  { id: 'itemDouble', name: '🎯 双发道具', category: '道具', color: '#2ECC71' },
  { id: 'itemShield', name: '🛡️ 护盾道具', category: '道具', color: '#3498DB' },
  { id: 'itemBomb', name: '💣 炸弹道具', category: '道具', color: '#E74C3C' },
  { id: 'explosion', name: '💥 爆炸效果', category: '特效', color: '#E67E22' },
  { id: 'bg', name: '🌌 背景图', category: '背景', color: '#2C3E50' },
];

let uploads = {};

// 打开编辑器（密码验证）
function openEditor() {
  const password = prompt('🔐 请输入美术编辑密码：\n(默认密码：admin123)');
  
  if (!password) return;
  
  if (password === EDITOR_CONFIG.PASSWORD) {
    showEditor();
  } else {
    alert('❌ 密码错误！');
  }
}

// 显示编辑器界面
function showEditor() {
  const overlay = document.createElement('div');
  overlay.id = 'editor-overlay';
  overlay.innerHTML = `
    <div class="editor-container">
      <div class="editor-header">
        <h2>🎨 雷霆战机 - 美术编辑</h2>
        <button class="close-btn" onclick="closeEditor()">✕ 关闭</button>
      </div>
      
      <div class="editor-content">
        <div class="category-filter">
          <button class="filter-btn active" onclick="filterCategory('all')">全部</button>
          <button class="filter-btn" onclick="filterCategory('战机')">战机</button>
          <button class="filter-btn" onclick="filterCategory('敌机')">敌机</button>
          <button class="filter-btn" onclick="filterCategory('道具')">道具</button>
          <button class="filter-btn" onclick="filterCategory('特效')">特效</button>
        </div>
        <div id="resource-list" class="resource-list"></div>
      </div>
      
      <div class="editor-footer">
        <div class="status" id="editor-status">✅ 就绪</div>
        <div class="actions">
          <button class="btn btn-refresh" onclick="refreshGame()">🔄 刷新游戏</button>
          <button class="btn btn-deploy" onclick="deploy()">🚀 一键部署</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // 添加样式
  const style = document.createElement('style');
  style.id = 'editor-style';
  style.textContent = `
    #editor-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 9999;
      overflow-y: auto;
      padding: 20px;
    }
    
    .editor-container {
      background: white;
      border-radius: 15px;
      max-width: 600px;
      margin: 20px auto;
      overflow: hidden;
    }
    
    .editor-header {
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .editor-header h2 {
      margin: 0;
      font-size: 18px;
    }
    
    .close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 8px 15px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .category-filter {
      padding: 15px;
      background: #f8f9fa;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .filter-btn {
      padding: 8px 15px;
      border: none;
      border-radius: 20px;
      background: #e0e0e0;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.3s;
    }
    
    .filter-btn.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    
    .editor-content {
      padding: 20px;
      max-height: 50vh;
      overflow-y: auto;
    }
    
    .resource-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .resource-card {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 15px;
      border: 2px solid transparent;
      transition: all 0.3s;
    }
    
    .resource-card:hover {
      border-color: #667eea;
    }
    
    .resource-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      font-size: 15px;
    }
    
    .resource-category {
      font-size: 11px;
      color: #999;
      background: #e0e0e0;
      padding: 3px 8px;
      border-radius: 4px;
      margin-left: 8px;
    }
    
    .resource-preview {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
    }
    
    .preview-box {
      flex: 1;
      text-align: center;
    }
    
    .preview-box img {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    
    .preview-label {
      font-size: 11px;
      color: #999;
      margin-top: 5px;
    }
    
    .arrow {
      color: #667eea;
      font-size: 20px;
      font-weight: bold;
    }
    
    .preview-placeholder {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 11px;
    }
    
    .upload-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .replace-btn {
      width: 100%;
      padding: 12px;
      background: #11998e;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      opacity: 0.5;
      pointer-events: none;
    }
    
    .replace-btn.active {
      opacity: 1;
      pointer-events: auto;
    }
    
    .editor-footer {
      background: #f8f9fa;
      padding: 15px 20px;
      border-top: 2px solid #e0e0e0;
    }
    
    .status {
      color: #666;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .actions {
      display: flex;
      gap: 10px;
    }
    
    .btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
    }
    
    .btn-refresh {
      background: #f0f0f0;
      color: #333;
    }
    
    .btn-deploy {
      background: linear-gradient(135deg, #11998e, #38ef7d);
      color: white;
    }
  `;
  
  document.head.appendChild(style);
  
  // 渲染资源列表
  renderResources('all');
}

// 关闭编辑器
function closeEditor() {
  const overlay = document.getElementById('editor-overlay');
  const style = document.getElementById('editor-style');
  if (overlay) overlay.remove();
  if (style) style.remove();
}

// 分类过滤
function filterCategory(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderResources(category);
}

// 渲染资源列表
function renderResources(category) {
  const container = document.getElementById('resource-list');
  container.innerHTML = '';
  
  const filtered = category === 'all' 
    ? RESOURCES 
    : RESOURCES.filter(r => r.category === category);
  
  filtered.forEach(res => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.innerHTML = `
      <div class="resource-name">${res.name} <span class="resource-category">${res.category}</span></div>
      <div class="resource-preview">
        <div class="preview-box">
          <img src="${EDITOR_CONFIG.GAME_URL}assets/${getAssetPath(res.id)}" onerror="this.style.background='${res.color}'">
          <div class="preview-label">当前</div>
        </div>
        <div class="arrow">→</div>
        <div class="preview-box">
          <div id="preview-${res.id}" class="preview-placeholder">未上传</div>
          <div class="preview-label">新图</div>
        </div>
      </div>
      <input type="file" id="file-${res.id}" accept="image/*" hidden onchange="handleFile('${res.id}', this)">
      <button class="upload-btn" onclick="document.getElementById('file-${res.id}').click()">📁 上传图片</button>
      <button class="replace-btn" id="replace-${res.id}" onclick="replace('${res.id}')">🔄 立即替换</button>
    `;
    container.appendChild(card);
  });
}

// 获取资源路径
function getAssetPath(id) {
  const paths = {
    player: 'player/player.png',
    enemy1: 'enemies/enemy1.png',
    enemy2: 'enemies/enemy2.png',
    enemy3: 'enemies/enemy3.png',
    boss: 'enemies/boss.png',
    bullet: 'bullets/bullet.png',
    itemDouble: 'items/double.png',
    itemShield: 'items/shield.png',
    itemBomb: 'items/bomb.png',
    explosion: 'explosions/explosion.png',
    bg: 'bg/bg.png'
  };
  return paths[id] || `${id}.png`;
}

// 处理文件上传
async function handleFile(id, input) {
  const file = input.files[0];
  if (!file) return;
  
  const status = document.getElementById('editor-status');
  status.textContent = '📤 上传中...';
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('resourceId', id);
  
  try {
    const res = await fetch(`${EDITOR_CONFIG.API_URL}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.success) {
      uploads[id] = file;
      
      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById(`preview-${id}`);
        preview.innerHTML = `<img src="${e.target.result}" style="width:60px;height:60px;object-fit:contain;border-radius:8px;">`;
        preview.classList.remove('preview-placeholder');
      };
      reader.readAsDataURL(file);
      
      // 启用替换按钮
      const btn = document.getElementById(`replace-${id}`);
      btn.classList.add('active');
      
      status.textContent = `✅ 已上传，点击替换`;
    }
  } catch (error) {
    status.textContent = '❌ 上传失败';
  }
}

// 替换资源
async function replace(id) {
  if (!uploads[id]) return;
  
  const status = document.getElementById('editor-status');
  status.textContent = '🔄 替换中...';
  
  const formData = new FormData();
  formData.append('resourceId', id);
  formData.append('fileName', `${id}.png`);
  
  try {
    const res = await fetch(`${EDITOR_CONFIG.API_URL}/replace`, { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.success) {
      status.textContent = `✅ 已替换`;
      refreshGame();
      setTimeout(() => renderResources('all'), 500);
    }
  } catch (error) {
    status.textContent = '❌ 替换失败';
  }
}

// 刷新游戏
function refreshGame() {
  const status = document.getElementById('editor-status');
  status.textContent = '🔄 游戏已刷新';
  
  const gameFrame = document.querySelector('.game-frame iframe');
  if (gameFrame) {
    gameFrame.src = EDITOR_CONFIG.GAME_URL + '?t=' + Date.now();
  } else {
    window.location.reload();
  }
}

// 一键部署
async function deploy() {
  const status = document.getElementById('editor-status');
  status.textContent = '🚀 部署中...';
  
  const formData = new FormData();
  formData.append('version', 'auto');
  formData.append('message', '更新美术资源');
  
  try {
    const res = await fetch(`${EDITOR_CONFIG.API_URL}/deploy`, { method: 'POST', body: formData });
    const data = await res.json();
    
    if (data.success) {
      status.textContent = `✅ 部署完成：${data.version}`;
      alert('🎉 部署成功！\n版本：' + data.version);
    }
  } catch (error) {
    status.textContent = '❌ 部署失败';
    alert('部署失败，请检查网络');
  }
}
