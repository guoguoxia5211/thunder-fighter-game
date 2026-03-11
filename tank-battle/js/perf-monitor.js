// 性能监控模块 - 集成 perf-profiler 技能
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameTime = 0;
        this.memory = 0;
        this.entities = { bullets: 0, enemies: 0, particles: 0 };
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.warnings = [];
    }

    // 每帧调用
    update() {
        const now = performance.now();
        this.frameTime = now - this.lastTime;
        this.frameCount++;
        
        // 每秒计算一次 FPS
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
            
            // 内存使用 (仅 Chrome/Edge 支持)
            if (performance.memory) {
                this.memory = performance.memory.usedJSHeapSize / 1048576; // MB
            }
            
            // 检查性能
            this.warnings = this.checkPerformance();
        }
    }

    // 更新实体计数
    updateEntityCount(type, delta) {
        if (this.entities[type] !== undefined) {
            this.entities[type] += delta;
        }
    }

    // 设置实体计数
    setEntityCount(type, count) {
        if (this.entities[type] !== undefined) {
            this.entities[type] = count;
        }
    }

    // 获取总实体数
    getTotalEntities() {
        return Object.values(this.entities).reduce((a, b) => a + b, 0);
    }

    // 性能检查
    checkPerformance() {
        const warnings = [];
        
        if (this.fps < 30) {
            warnings.push('⚠️ 帧率过低：' + this.fps);
        } else if (this.fps < 60) {
            warnings.push('⚠️ 帧率警告：' + this.fps);
        }
        
        if (this.memory > 200) {
            warnings.push('⚠️ 内存过高：' + this.memory.toFixed(1) + 'MB');
        } else if (this.memory > 100) {
            warnings.push('⚠️ 内存警告：' + this.memory.toFixed(1) + 'MB');
        }
        
        if (this.entities.bullets > 100) {
            warnings.push('⚠️ 子弹过多：' + this.entities.bullets);
        }
        
        if (this.entities.enemies > 10) {
            warnings.push('⚠️ 敌人过多：' + this.entities.enemies);
        }
        
        return warnings;
    }

    // 获取性能报告
    getReport() {
        return {
            fps: this.fps,
            frameTime: this.frameTime.toFixed(2) + 'ms',
            memory: this.memory.toFixed(2) + 'MB',
            entities: { ...this.entities },
            total: this.getTotalEntities(),
            warnings: this.warnings
        };
    }

    // 更新 HUD 显示
    updateHUD() {
        const fpsEl = document.getElementById('fps');
        const memoryEl = document.getElementById('memory');
        const entitiesEl = document.getElementById('entities');
        
        if (fpsEl) fpsEl.textContent = this.fps;
        if (memoryEl) memoryEl.textContent = this.memory.toFixed(1);
        if (entitiesEl) entitiesEl.textContent = this.getTotalEntities();
        
        // 颜色警告
        if (this.fps < 30) {
            fpsEl.style.color = '#e74c3c';
        } else if (this.fps < 60) {
            fpsEl.style.color = '#f39c12';
        } else {
            fpsEl.style.color = '#0f0';
        }
    }

    // 生成基准测试报告
    async runBenchmark(duration = 60) {
        const results = {
            fps: [],
            memory: [],
            frameTime: []
        };
        
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                results.fps.push(this.fps);
                results.memory.push(this.memory);
                results.frameTime.push(this.frameTime);
                
                if (Date.now() - startTime >= duration * 1000) {
                    clearInterval(interval);
                    
                    // 生成报告
                    resolve({
                        avgFps: this.average(results.fps),
                        minFps: Math.min(...results.fps),
                        maxFps: Math.max(...results.fps),
                        avgMemory: this.average(results.memory),
                        memoryGrowth: results.memory[results.memory.length - 1] - results.memory[0],
                        duration: duration
                    });
                }
            }, 1000);
        });
    }

    // 计算平均值
    average(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }
}

// 全局实例
const perfMonitor = new PerformanceMonitor();
