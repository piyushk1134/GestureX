# 🚧 REMAINING FEATURES TO IMPLEMENT

## ✅ COMPLETED (2/7)
1. ✅ Lane switching with smooth animation
2. ✅ Moving obstacles & solid barriers

---

## ⏳ REMAINING (5/7)

### 3. Wave System with Difficulty Scaling
**File:** `js/gameManager.js`

**Add to constructor:**
```javascript
this.currentWave = 1;
this.waveTimer = 0;
this.waveDuration = 60; // 60 seconds per wave
this.difficultyMultiplier = 1.0;
this.checkpoint = false;
```

**Add to update():**
```javascript
// Wave system
this.waveTimer += delta;
if (this.waveTimer >= this.waveDuration) {
    this.completeWave();
}
```

**Add new method:**
```javascript
completeWave() {
    this.currentWave++;
    this.waveTimer = 0;
    
    // Increase difficulty by 5%
    this.difficultyMultiplier += 0.05;
    this.obstacleManager.setDifficulty(this.difficultyMultiplier);
    
    // Every 3 waves = checkpoint
    if (this.currentWave % 3 === 0) {
        this.checkpoint = true;
        this.lives = Math.min(this.lives + 1, 5); // Regenerate 1 life (max 5)
        this.showCheckpointMessage();
    }
    
    this.showWaveCompleteMessage();
}

showWaveCompleteMessage() {
    // Display "WAVE X COMPLETE!" message
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'font-size:48px;color:#3498db;font-weight:bold;z-index:10000;' +
        'text-shadow:0 0 20px #3498db;animation:pulse 0.5s ease-in-out;';
    msg.textContent = `🌊 WAVE ${this.currentWave} COMPLETE!`;
    document.body.appendChild(msg);
    setTimeout(() => document.body.removeChild(msg), 2000);
}

showCheckpointMessage() {
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'font-size:56px;color:#2ecc71;font-weight:bold;z-index:10001;' +
        'text-shadow:0 0 30px #2ecc71;';
    msg.innerHTML = '🏁 CHECKPOINT!<br>+1 LIFE ❤️';
    document.body.appendChild(msg);
    setTimeout(() => document.body.removeChild(msg), 3000);
}
```

**Update HUD to show wave:**
```javascript
document.getElementById('hud-wave').textContent = `Wave ${this.currentWave}`;
```

---

### 4. Camera Feed in Game Screen
**File:** `index.html`

**Add to game-hud div:**
```html
<div id="game-hud" class="hidden">
    <!-- Existing HUD elements -->
    
    <!-- Camera Feed (bottom right) -->
    <div id="game-camera-feed" style="position:fixed; bottom:20px; right:20px; 
         width:320px; height:240px; border:3px solid #2ecc71; border-radius:10px;
         overflow:hidden; background:#000; box-shadow:0 0 20px rgba(46,204,113,0.5);">
        <canvas id="game-gesture-canvas" width="320" height="240"></canvas>
        <div style="position:absolute; top:5px; left:5px; color:#2ecc71; font-size:14px; font-weight:bold;">
            📹 CAMERA
        </div>
        <div id="game-gesture-status" style="position:absolute; bottom:5px; left:5px; 
             color:#fff; font-size:12px; background:rgba(0,0,0,0.7); padding:3px 8px; border-radius:5px;">
            🖐️ No hand detected
        </div>
    </div>
</div>
```

**File:** `js/gestureControl.js`

**Add method to draw to game canvas:**
```javascript
drawToGameCanvas() {
    const gameCanvas = document.getElementById('game-gesture-canvas');
    if (!gameCanvas || !this.videoElement || !this.canvasElement) return;
    
    const gameCtx = gameCanvas.getContext('2d');
    
    // Copy from main canvas to game canvas
    gameCtx.clearRect(0, 0, 320, 240);
    gameCtx.drawImage(this.canvasElement, 0, 0, 320, 240);
    
    // Update status text
    const statusEl = document.getElementById('game-gesture-status');
    if (statusEl) {
        if (this.handDetected) {
            statusEl.innerHTML = `🖐️ ${this.currentGesture}`;
            statusEl.style.color = '#2ecc71';
        } else {
            statusEl.innerHTML = '🤷 No hand';
            statusEl.style.color = '#e74c3c';
        }
    }
}
```

**Call in onResults():**
```javascript
onResults(results) {
    // ... existing code ...
    
    // Also draw to game canvas if in game
    this.drawToGameCanvas();
}
```

---

### 5. Load McLaren 765LT for Traffic
**File:** `js/main.js`

**In loadAssets(), find McLaren 765LT:**
```javascript
async loadAssets() {
    // ... existing code ...
    
    // Find McLaren 765LT specifically for traffic
    const mclarenTraffic = this.vehicles.find(v => v.file === '2020 McLaren 765LT.glb');
    if (mclarenTraffic && this.obstacleManager) {
        this.obstacleManager.setTrafficCarModel(mclarenTraffic.model);
        console.log('🚗 McLaren 765LT set as traffic car');
    }
}
```

**Update gameManager constructor call:**
```javascript
this.obstacleManager = new ObstacleManager(this.game.scene, this.game);
```

---

### 6. Update HUD HTML
**File:** `index.html`

**Replace game-hud div:**
```html
<div id="game-hud" class="hidden">
    <div style="position:fixed; top:20px; left:20px; color:#fff; font-size:18px;">
        <div>🏆 Score: <span id="hud-score">0m</span></div>
        <div>⭐ Best: <span id="hud-best">0m</span></div>
        <div>⚡ Speed: <span id="hud-speed">0</span> km/h</div>
        <div>🌊 Wave: <span id="hud-wave">1</span></div>
        <div>⏱️ Time: <span id="hud-time">0:00</span></div>
    </div>
    
    <div style="position:fixed; top:20px; right:20px; color:#fff; font-size:18px;">
        <div>💙 Lives: <span id="hud-lives">❤️❤️❤️</span></div>
    </div>
    
    <!-- Camera feed added here (from feature 4) -->
</div>
```

---

### 7. Fix GameManager Constructor
**File:** `js/gameManager.js`

**Replace the incomplete constructor with:**
```javascript
constructor(game, selectedVehicle) {
    this.game = game;
    this.selectedVehicle = selectedVehicle;
    
    this.playerVehicle = null;
    this.obstacleManager = null;
    this.score = 0;
    this.distance = 0;
    this.highScore = 0;
    this.lives = 3;
    this.gameTime = 0;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    
    // Wave system
    this.currentWave = 1;
    this.waveTimer = 0;
    this.waveDuration = 60; // 60 seconds per wave
    this.difficultyMultiplier = 1.0;
    
    this.loadHighScore();
    this.init();
    
    console.log('🎮 Game Manager initialized');
}
```

---

## 📝 IMPLEMENTATION ORDER

1. Fix gameManager constructor (feature 7) - **CRITICAL**
2. Add wave system (feature 3)
3. Update HUD HTML (feature 6)
4. Add camera feed to game (feature 4)
5. Load McLaren for traffic (feature 5)

---

## 🧪 TESTING CHECKLIST

After implementation:
- [ ] Game loads without errors
- [ ] Car switches lanes smoothly with A/D
- [ ] Obstacles move toward player
- [ ] Barriers cause collision
- [ ] Wave counter increases every 60 seconds
- [ ] Difficulty increases (faster obstacles)
- [ ] Checkpoint every 3 waves (+1 life)
- [ ] Camera feed shows in bottom right
- [ ] McLaren 765LT appears as traffic
- [ ] HUD shows all info correctly

---

## ⚠️ KNOWN ISSUES TO FIX

1. **gameManager constructor** - Currently incomplete/corrupted
2. **Obstacle movement** - May need speed tuning
3. **Lane switching** - Need to integrate with controls
4. **Camera feed** - Needs to be shown during gameplay

---

**READY TO CONTINUE? Let me know and I'll implement features 3-7!**
