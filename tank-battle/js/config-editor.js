/**
 * 坦克大战 - 数值配置编辑器
 * 密码保护，实时调整游戏数值
 */

const TANK_CONFIG_EDITOR = {
  PASSWORD: 'admin123',
  
  // 打开配置编辑器
  open() {
    const password = prompt('🔐 请输入数值配置密码：\n(默认密码：admin123)');
    
    if (!password) return;
    
    if (password === this.PASSWORD) {
      this.showEditor();
    } else {
      alert('❌ 密码错误！');
    }
  },
  
  // 显示编辑器界面
  showEditor() {
    const overlay = document.createElement('div');
    overlay.id = 'config-overlay';
    overlay.innerHTML = `
      <div class="config-container">
        <div class="config-header">
          <h2>⚙️ 坦克大战 - 数值配置</h2>
          <button class="close-btn" onclick="TANK_CONFIG_EDITOR.close()">✕ 关闭</button>
        </div>
        
        <div class="config-content">
          <div class="config-tabs">
            <button class="tab active" onclick="TANK_CONFIG_EDITOR.showTab('player')">🚀 玩家</button>
            <button class="tab" onclick="TANK_CONFIG_EDITOR.showTab('enemies')">👾 敌人</button>
            <button class="tab" onclick="TANK_CONFIG_EDITOR.showTab('bullets')">💫 子弹</button>
            <button class="tab" onclick="TANK_CONFIG_EDITOR.showTab('spawn')">📦 生成</button>
          </div>
          
          <div id="config-panel" class="config-panel"></div>
        </div>
        
        <div class="config-footer">
          <div class="status" id="config-status">✅ 就绪</div>
          <div class="actions">
            <button class="btn btn-reset" onclick="resetConfig()">🔄 重置默认</button>
            <button class="btn btn-save" onclick="TANK_CONFIG_EDITOR.save()">💾 保存配置</button>
            <button class="btn btn-apply" onclick="TANK_CONFIG_EDITOR.apply()">⚡ 立即生效</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.addStyles();
    this.showTab('player');
  },
  
  // 关闭编辑器
  close() {
    const overlay = document.getElementById('config-overlay');
    const style = document.getElementById('config-style');
    if (overlay) overlay.remove();
    if (style) style.remove();
  },
  
  // 添加样式
  addStyles() {
    const style = document.createElement('style');
    style.id = 'config-style';
    style.textContent = `
      #config-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 9998;
        overflow-y: auto;
        padding: 20px;
      }
      .config-container {
        background: white;
        border-radius: 15px;
        max-width: 700px;
        margin: 20px auto;
        overflow: hidden;
      }
      .config-header {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .config-header h2 { margin: 0; font-size: 18px; }
      .close-btn {
        background: rgba(255,255,255,0.2);
        border: none; color: white;
        padding: 8px 15px; border-radius: 6px;
        cursor: pointer; font-weight: bold;
      }
      .config-content { padding: 20px; }
      .config-tabs {
        display: flex; gap: 8px;
        margin-bottom: 20px; flex-wrap: wrap;
      }
      .tab {
        padding: 10px 15px;
        border: none; border-radius: 20px;
        background: #e0e0e0;
        cursor: pointer; font-size: 13px;
      }
      .tab.active {
        background: linear-gradient(135deg, #4ecdc4, #26a69a);
        color: white;
      }
      .config-panel { max-height: 50vh; overflow-y: auto; }
      .config-group {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
      }
      .config-group h3 {
        margin: 0 0 15px 0;
        color: #2c3e50;
        font-size: 16px;
      }
      .config-item {
        display: grid;
        grid-template-columns: 1fr 100px 80px;
        gap: 10px;
        align-items: center;
        margin-bottom: 10px;
      }
      .config-item label {
        color: #555;
        font-size: 14px;
      }
      .config-item input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }
      .config-item input:focus {
        outline: none;
        border-color: #4ecdc4;
      }
      .config-footer {
        background: #f8f9fa;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #e0e0e0;
      }
      .status { color: #27ae60; font-weight: bold; }
      .actions { display: flex; gap: 10px; }
      .btn {
        padding: 10px 20px;
        border: none; border-radius: 8px;
        cursor: pointer; font-weight: bold;
        font-size: 14px;
      }
      .btn-reset { background: #95a5a6; color: white; }
      .btn-save { background: #3498db; color: white; }
      .btn-apply { background: #27ae60; color: white; }
      .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
    `;
  },
  
  // 显示标签页
  showTab(tabName) {
    const panel = document.getElementById('config-panel');
    const config = window.TANK_CONFIG || window.parent.TANK_CONFIG;
    
    // 更新标签状态
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    let html = '';
    
    if (tabName === 'player') {
      html = this.renderGroup('玩家配置', config.player, 'player');
    } else if (tabName === 'enemies') {
      html = `
        <div class="config-group">
          <h3>🔴 普通坦克</h3>
          ${this.renderGroupContent(config.enemies.normal, 'enemies.normal')}
        </div>
        <div class="config-group">
          <h3>🟠 快速坦克</h3>
          ${this.renderGroupContent(config.enemies.fast, 'enemies.fast')}
        </div>
        <div class="config-group">
          <h3>🟣 重装坦克</h3>
          ${this.renderGroupContent(config.enemies.heavy, 'enemies.heavy')}
        </div>
        <div class="config-group">
          <h3>🩷 特种坦克</h3>
          ${this.renderGroupContent(config.enemies.special, 'enemies.special')}
        </div>
      `;
    } else if (tabName === 'bullets') {
      html = `
        <div class="config-group">
          <h3>玩家子弹</h3>
          ${this.renderGroupContent(config.bullets.player, 'bullets.player')}
        </div>
        <div class="config-group">
          <h3>敌人子弹</h3>
          ${this.renderGroupContent(config.bullets.enemy, 'bullets.enemy')}
        </div>
      `;
    } else if (tabName === 'spawn') {
      html = this.renderGroup('敌人生成配置', config.spawn, 'spawn');
    }
    
    panel.innerHTML = html;
  },
  
  // 渲染分组
  renderGroup(title, data, prefix) {
    let html = `<div class="config-group"><h3>${title}</h3>`;
    html += this.renderGroupContent(data, prefix);
    html += '</div>';
    return html;
  },
  
  // 渲染分组内容
  renderGroupContent(data, prefix) {
    let html = '';
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number') {
        html += `
          <div class="config-item">
            <label>${this.formatLabel(key)}</label>
            <input type="number" step="0.1" value="${value}" 
                   data-key="${prefix}.${key}">
            <span class="value-preview">${value}</span>
          </div>
        `;
      }
    }
    return html;
  },
  
  // 格式化标签
  formatLabel(key) {
    const labels = {
      speed: '速度',
      lives: '生命',
      damage: '伤害',
      hp: '血量',
      score: '分数',
      bulletSpeed: '子弹速度',
      bulletCooldown: '射击冷却',
      shootDelay: '射击间隔',
      width: '宽度',
      height: '高度',
      interval: '生成间隔',
      maxEnemies: '最大数量',
      totalToSpawn: '总敌人数'
    };
    return labels[key] || key;
  },
  
  // 保存配置
  save() {
    const inputs = document.querySelectorAll('.config-item input');
    const config = window.TANK_CONFIG || window.parent.TANK_CONFIG;
    
    inputs.forEach(input => {
      const keys = input.dataset.key.split('.');
      let value = parseFloat(input.value);
      
      let obj = config;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    });
    
    localStorage.setItem('tank_config', JSON.stringify(config));
    
    const status = document.getElementById('config-status');
    status.textContent = '✅ 已保存';
    status.style.color = '#27ae60';
    
    setTimeout(() => {
      status.textContent = '✅ 就绪';
    }, 2000);
  },
  
  // 立即生效
  apply() {
    this.save();
    
    const status = document.getElementById('config-status');
    status.textContent = '⚡ 已生效（刷新游戏）';
    status.style.color = '#f39c12';
    
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
};

// 全局函数
function openConfigEditor() {
  TANK_CONFIG_EDITOR.open();
}
