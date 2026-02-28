export class ComboSystem {
    constructor() {
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 3.0; // 3 seconds to maintain combo
        this.scoreMultiplier = 1.0;
        this.comboElement = null;
    }
    
    init() {
        // Create combo display element
        this.comboElement = document.createElement('div');
        this.comboElement.className = 'combo-display';
        this.comboElement.innerHTML = `
            <div class="combo-text">COMBO</div>
            <div class="combo-value">×<span id="combo-multiplier">1</span></div>
        `;
        document.body.appendChild(this.comboElement);
    }
    
    addCombo() {
        this.combo++;
        this.comboTimer = this.comboTimeout;
        
        // Update max combo
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // Calculate multiplier (max 10x)
        this.scoreMultiplier = Math.min(1 + (this.combo * 0.1), 10);
        
        this.updateDisplay();
        
        // Show combo display
        if (this.combo >= 2) {
            this.comboElement.classList.add('active');
        }
    }
    
    resetCombo() {
        if (this.combo > 0) {
            console.log(`Combo broken! Max reached: ${this.combo}x`);
        }
        this.combo = 0;
        this.scoreMultiplier = 1.0;
        this.comboTimer = 0;
        this.updateDisplay();
        this.comboElement.classList.remove('active');
    }
    
    update(delta) {
        if (this.combo > 0) {
            this.comboTimer -= delta;
            
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }
    
    updateDisplay() {
        const multiplierElement = document.getElementById('combo-multiplier');
        if (multiplierElement) {
            multiplierElement.textContent = Math.floor(this.scoreMultiplier);
            
            // Add pulse animation on combo increase
            this.comboElement.style.animation = 'none';
            setTimeout(() => {
                this.comboElement.style.animation = '';
            }, 10);
        }
    }
    
    getMultiplier() {
        return this.scoreMultiplier;
    }
    
    getCombo() {
        return this.combo;
    }
    
    getMaxCombo() {
        return this.maxCombo;
    }
    
    cleanup() {
        if (this.comboElement && this.comboElement.parentNode) {
            document.body.removeChild(this.comboElement);
        }
    }
}
