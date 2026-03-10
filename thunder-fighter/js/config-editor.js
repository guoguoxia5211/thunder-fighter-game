/**
 * 数值配置编辑器 - 实时调整游戏数值
 * 密码保护，即时生效
 */

const CONFIG_EDITOR = {
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
          <h2>⚙️ 数值配置系统</h2>
          <button class="close-btn" onclick="CONFIG_EDITOR.close()">✕ 关闭</button>
        </div>
        
        <div class="config-content">
          <div class="config-tabs">
            <button class="tab active" onclick="CONFIG_EDITOR.showTab('player')">👤 玩家</button>
            <button class="tab" onclick="CONFIG_EDITOR.showTab('enemies')">👾 敌机</button>
            <button class="tab" onclick="CONFIG_EDITOR.showTab('boss')">💀 BOSS</button>
            <button class="tab" onclick="CONFIG_EDITOR.showTab('bullets')">💫 子弹</button>
            <button class="tab" onclick="CONFIG_EDITOR.showTab('items')">🎁 道具</button>
          </div>
          
          <div id="config-panel" class="config-panel"></div>
        </div>
        
        <div class="config-footer">
          <div class="status" id="config-status">✅ 就绪</div>
          <div class="actions">
            <button class="btn btn-reset" onclick="resetConfig()">🔄 重置默认</button>
            <button class="btn btn-save" onclick="CONFIG_EDITOR.save()">💾 保存配置</button>
            <button class="btn btn-apply" onclick="CONFIG_EDITOR.apply()">⚡ 立即生效</button>
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
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
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
      
      .config-header h2 {
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
      
      .config-content {
        padding: 20px;
      }
      
      .config-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      
      .tab {
        padding: 10px 15px;
        border: none;
        border-radius: 20px;
        background: #e0e0e0;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.3s;
      }
      
      .tab.active {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      
      .config-panel {
        max-height: 50vh;
        overflow-y: auto;
      }
      
      .config-group {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
      }
      
      .config-group h3 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 15px;
        border-bottom: 2px solid #667eea;
        padding-bottom: 8px;
      }
      
      .config-item {
        display: grid;
        grid-template-columns: 1fr 100px 80px;
        gap: 10px;
        align-items: center;
        margin-bottom: 10px;
      }
      
      .config-item label {
        font-size: 13px;
        color: #666;
      }
      
      .config-item input {
        padding: 8px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
      }
      
      .config-item input:focus {
        border-color: #667eea;
        outline: none;
      }
      
      .config-item .desc {
        font-size: 11px;
        color: #999;
      }
      
      .config-footer {
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
      
      .btn-reset {
        background: #f0f0f0;
        color: #333;
      }
      
      .btn-save {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      
      .btn-apply {
        background: linear-gradient(135deg, #11998e, #38ef7d);
        color: white;
      }
    `;
    
    document.head.appendChild(style);
  },
  
  // 显示标签页
  showTab(tabName) {
    document.querySelectorAll('.config-tabs .tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const panel = document.getElementById('config-panel');
    const config = window.GAME_CONFIG;
    
    let html = '';
    
    if (tabName === 'player') {
      html = this.renderGroup('玩家配置', config.player, 'player');
    } else if (tabName === 'enemies') {
      html = `
        ${this.renderGroup('敌机 Type-1', config.enemies.enemy1, 'enemies.enemy1')}
        ${this.renderGroup('敌机 Type-2', config.enemies.enemy2, 'enemies.enemy2')}
        ${this.renderGroup('敌机 Type-3', config.enemies.enemy3, 'enemies.enemy3')}
      `;
    } else if (tabName === 'boss') {
      html = this.renderGroup('BOSS 配置', config.boss, 'boss');
    } else if (tabName === 'bullets') {
      html = `
        ${this.renderGroup('普通子弹', config.bullets.normal, 'bullets.normal')}
        ${this.renderGroup('追踪导弹', config.bullets.missile, 'bullets.missile')}
        ${this.renderGroup('敌方子弹', config.bullets.enemy, 'bullets.enemy')}
      `;
    } else if (tabName === 'items') {
      html = this.renderGroup('道具配置', config.items, 'items');
    }
    
    panel.innerHTML = html;
  },
  
  // 渲染配置组
  renderGroup(title, config, path) {
    let html = `<div class="config-group"><h3>${title}</h3>`;
    
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'number') {
        const label = this.getLabel(key);
        const unit = this.getUnit(key);
        html += `
          <div class="config-item">
            <label>${label}</label>
            <input type="number" 
                   value="${value}" 
                   onchange="CONFIG_EDITOR.update('${path}.${key}', this.value)"
                   step="${value < 1 ? 0.1 : 1}">
            <span class="desc">${unit}</span>
          </div>
        `;
      }
    }
    
    html += '</div>';
    return html;
  },
  
  // 获取中文标签
  getLabel(key) {
    const labels = {
      speed: '速度',
      hp: '血量',
      score: '分数',
      width: '宽度',
      height: '高度',
      lives: '生命数',
      bulletSpeed: '子弹速度',
      bulletCooldown: '射击间隔',
      power: '火力等级',
      maxPower: '最大火力',
      spawnRate: '生成频率',
      shootInterval: '射击间隔',
      spawnScore: '出现分数',
      damage: '伤害',
      turnRate: '转向速率',
      curveAmplitude: '曲线幅度',
      curveFrequency: '曲线频率',
      launchInterval: '发射间隔',
      dropRate: '掉落率',
      duration: '持续时间',
      alpha: '透明度'
    };
    return labels[key] || key;
  },
  
  // 获取单位
  getUnit(key) {
    const units = {
      speed: '像素/秒',
      bulletSpeed: '像素/秒',
      bulletCooldown: '毫秒',
      spawnRate: '秒',
      shootInterval: '秒',
      duration: '毫秒',
      alpha: '0-1',
      dropRate: '0-1'
    };
    return units[key] || '';
  },
  
  // 更新配置值
  update(path, value) {
    const keys = path.split('.');
    let obj = window.GAME_CONFIG;
    
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = parseFloat(value);
    document.getElementById('config-status').textContent = '⚠️ 已修改（需保存/应用）';
  },
  
  // 保存配置
  save() {
    saveConfig();
    document.getElementById('config-status').textContent = '✅ 已保存到本地';
  },
  
  // 立即生效
  apply() {
    if (window.gameInstance) {
      window.gameInstance.applyConfig();
      document.getElementById('config-status').textContent = '✅ 已立即生效';
    } else {
      document.getElementById('config-status').textContent = '⚠️ 游戏未运行';
    }
  }
};

// 添加全局按钮
function addConfigButton() {
  const btn = document.createElement('button');
  btn.className = 'config-btn';
  btn.textContent = '⚙️ 数值配置';
  btn.onclick = () => CONFIG_EDITOR.open();
  btn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: linear-gradient(135deg, #f093fb, #f5576c);
    color: white;
    border: none;
    padding: 15px 25px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(240,147,251,0.4);
    z-index: 1000;
  `;
  document.body.appendChild(btn);
}

// 游戏加载后添加按钮
window.addEventListener('load', () => {
  setTimeout(addConfigButton, 1000);
});
