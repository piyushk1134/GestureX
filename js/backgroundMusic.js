// Background Music System for Home Page

export class BackgroundMusic {
    constructor() {
        this.audio = null;
        this.musicToggle = null;
        this.musicIcon = null;
        this.isPlaying = false;
        this.isMuted = false;
        
        this.init();
    }
    
    init() {
        // Get audio element
        this.audio = document.getElementById('bg-music');
        this.musicToggle = document.getElementById('music-toggle');
        this.musicIcon = document.getElementById('music-icon');
        
        if (!this.audio || !this.musicToggle) {
            console.warn('Background music elements not found');
            return;
        }
        
        // Set volume
        this.audio.volume = 0.3; // 30% volume for background music
        
        // Load saved music preference
        const savedMusicState = localStorage.getItem('gesturex_music_enabled');
        this.isMuted = savedMusicState === 'false';
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Auto-play attempt (will be blocked by browser, needs user interaction)
        this.attemptAutoPlay();
        
        console.log('🎵 Background music system initialized');
    }
    
    setupEventListeners() {
        // Music toggle button
        this.musicToggle.addEventListener('click', () => {
            this.toggle();
        });
        
        // Audio events
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updateUI();
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updateUI();
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
        });
        
        // Start music on first user interaction
        const startMusicOnInteraction = () => {
            if (!this.isPlaying && !this.isMuted) {
                this.play();
            }
            // Remove listeners after first interaction
            document.removeEventListener('click', startMusicOnInteraction);
            document.removeEventListener('keydown', startMusicOnInteraction);
        };
        
        document.addEventListener('click', startMusicOnInteraction);
        document.addEventListener('keydown', startMusicOnInteraction);
    }
    
    attemptAutoPlay() {
        if (!this.isMuted) {
            this.audio.play().catch(error => {
                console.log('Auto-play prevented by browser. Waiting for user interaction.');
                // This is expected behavior in modern browsers
            });
        } else {
            this.updateUI();
        }
    }
    
    play() {
        if (this.audio && !this.isMuted) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updateUI();
                console.log('🎵 Music playing');
            }).catch(error => {
                console.error('Failed to play music:', error);
            });
        }
    }
    
    pause() {
        if (this.audio && this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            this.updateUI();
            console.log('⏸️ Music paused');
        }
    }
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
            this.isMuted = true;
        } else {
            this.isMuted = false;
            this.play();
        }
        
        // Save preference
        localStorage.setItem('gesturex_music_enabled', !this.isMuted);
    }
    
    updateUI() {
        if (!this.musicIcon || !this.musicToggle) return;
        
        if (this.isPlaying) {
            this.musicIcon.textContent = '🔊';
            this.musicToggle.classList.add('playing');
            this.musicToggle.title = 'Mute Music';
        } else {
            this.musicIcon.textContent = '🔇';
            this.musicToggle.classList.remove('playing');
            this.musicToggle.title = 'Play Music';
        }
    }
    
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
            this.updateUI();
        }
    }
    
    setVolume(volume) {
        if (this.audio) {
            this.audio.volume = Math.max(0, Math.min(1, volume));
        }
    }
    
    fadeOut(duration = 1000) {
        if (!this.audio || !this.isPlaying) return;
        
        const startVolume = this.audio.volume;
        const fadeSteps = 50;
        const stepTime = duration / fadeSteps;
        const volumeStep = startVolume / fadeSteps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = startVolume - (volumeStep * currentStep);
            
            if (newVolume <= 0 || currentStep >= fadeSteps) {
                this.audio.volume = 0;
                this.pause();
                clearInterval(fadeInterval);
                // Restore volume for next play
                setTimeout(() => {
                    this.audio.volume = startVolume;
                }, 100);
            } else {
                this.audio.volume = newVolume;
            }
        }, stepTime);
    }
    
    fadeIn(duration = 1000, targetVolume = 0.3) {
        if (!this.audio) return;
        
        this.audio.volume = 0;
        this.play();
        
        const fadeSteps = 50;
        const stepTime = duration / fadeSteps;
        const volumeStep = targetVolume / fadeSteps;
        
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = volumeStep * currentStep;
            
            if (newVolume >= targetVolume || currentStep >= fadeSteps) {
                this.audio.volume = targetVolume;
                clearInterval(fadeInterval);
            } else {
                this.audio.volume = newVolume;
            }
        }, stepTime);
    }
}

// Initialize background music when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.backgroundMusic = new BackgroundMusic();
    });
} else {
    window.backgroundMusic = new BackgroundMusic();
}
