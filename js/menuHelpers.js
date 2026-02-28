// Menu Helpers - High Score and Theme Toggle
// Auto-initializes when DOM is ready

class MenuHelpers {
    constructor() {
        this.currentTheme = 'dark';
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.loadHighScore();
        this.setupThemeToggle();
        console.log('✅ Menu helpers initialized');
    }
    
    loadHighScore() {
        const savedHighScore = localStorage.getItem('gesturex_high_score');
        const highScore = savedHighScore ? parseInt(savedHighScore) : 0;
        const highScoreEl = document.getElementById('high-score');
        
        if (highScoreEl) {
            highScoreEl.textContent = highScore;
            console.log(`📊 High score loaded: ${highScore}`);
        }
        
        // Also update on state changes
        this.watchForHighScoreUpdates();
    }
    
    watchForHighScoreUpdates() {
        // Check for high score updates every second
        setInterval(() => {
            const savedHighScore = localStorage.getItem('gesturex_high_score');
            const highScore = savedHighScore ? parseInt(savedHighScore) : 0;
            const highScoreEl = document.getElementById('high-score');
            
            if (highScoreEl && highScoreEl.textContent !== highScore.toString()) {
                highScoreEl.textContent = highScore;
            }
        }, 1000);
    }
    
    setupThemeToggle() {
        const themeToggleBtn = document.getElementById('btn-toggle-theme');
        if (!themeToggleBtn) {
            console.warn('⚠️ Theme toggle button not found');
            return;
        }
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('gesturex_theme') || 'dark';
        this.currentTheme = savedTheme;
        
        // Apply saved theme
        document.body.classList.toggle('light-theme', savedTheme === 'light');
        themeToggleBtn.textContent = savedTheme === 'light' ? '☀️' : '🌙';
        
        // Add click handler
        themeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        console.log(`🎨 Theme toggle setup - Current: ${savedTheme}`);
    }
    
    toggleTheme() {
        // Toggle theme
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update body class
        document.body.classList.toggle('light-theme');
        
        // Update button icon
        const themeToggleBtn = document.getElementById('btn-toggle-theme');
        if (themeToggleBtn) {
            themeToggleBtn.textContent = this.currentTheme === 'light' ? '☀️' : '🌙';
        }
        
        // Save preference
        localStorage.setItem('gesturex_theme', this.currentTheme);
        
        console.log(`🎨 Theme changed to: ${this.currentTheme}`);
    }
}

// Auto-initialize
window.menuHelpers = new MenuHelpers();
