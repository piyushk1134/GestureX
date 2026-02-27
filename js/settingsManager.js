export class SettingsManager {
    constructor() {
        this.settings = {
            graphics: {
                quality: 'high',
                shadows: true,
                effects: true,
                fps: false
            },
            audio: {
                masterVolume: 70,
                sfxVolume: 80,
                musicVolume: 50,
                mute: false
            },
            controls: {
                sensitivity: 5,
                cameraPosition: 'front',
                keyboardFallback: true
            }
        };
        
        console.log('⚙️ Settings Manager initialized');
    }

    async loadSettings() {
        try {
            const saved = localStorage.getItem('gesturex_settings');
            if (saved) {
                const loadedSettings = JSON.parse(saved);
                // Deep merge to preserve defaults
                this.settings = {
                    graphics: { ...this.settings.graphics, ...(loadedSettings.graphics || {}) },
                    audio: { ...this.settings.audio, ...(loadedSettings.audio || {}) },
                    controls: { ...this.settings.controls, ...(loadedSettings.controls || {}) }
                };
                console.log('✓ Settings loaded from localStorage');
            }
            // Ensure settings object is always valid
            if (!this.settings || !this.settings.graphics) {
                console.warn('⚠️ Settings corrupted, using defaults');
                this.resetToDefaults();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.resetToDefaults();
        }
    }
    
    resetToDefaults() {
        this.settings = {
            graphics: {
                quality: 'high',
                shadows: true,
                effects: true,
                fps: false
            },
            audio: {
                masterVolume: 70,
                sfxVolume: 80,
                musicVolume: 50,
                mute: false
            },
            controls: {
                sensitivity: 5,
                cameraPosition: 'front',
                keyboardFallback: true
            }
        };
    }

    saveSettings() {
        // Gather settings from UI
        this.settings.graphics.quality = document.getElementById('setting-quality')?.value || 'high';
        this.settings.graphics.shadows = document.getElementById('setting-shadows')?.checked || false;
        this.settings.graphics.effects = document.getElementById('setting-effects')?.checked || false;
        this.settings.graphics.fps = document.getElementById('setting-fps')?.checked || false;
        
        this.settings.audio.masterVolume = parseInt(document.getElementById('setting-master-volume')?.value) || 70;
        this.settings.audio.sfxVolume = parseInt(document.getElementById('setting-sfx-volume')?.value) || 80;
        this.settings.audio.musicVolume = parseInt(document.getElementById('setting-music-volume')?.value) || 50;
        this.settings.audio.mute = document.getElementById('setting-mute')?.checked || false;
        
        this.settings.controls.sensitivity = parseInt(document.getElementById('setting-sensitivity')?.value) || 5;
        this.settings.controls.cameraPosition = document.getElementById('setting-camera')?.value || 'front';
        this.settings.controls.keyboardFallback = document.getElementById('setting-keyboard')?.checked || false;
        
        // Save to localStorage
        try {
            localStorage.setItem('gesturex_settings', JSON.stringify(this.settings));
            console.log('✓ Settings saved');
            this.showNotification('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }

    populateUI() {
        // Graphics
        const qualityEl = document.getElementById('setting-quality');
        const shadowsEl = document.getElementById('setting-shadows');
        const effectsEl = document.getElementById('setting-effects');
        const fpsEl = document.getElementById('setting-fps');
        
        if (qualityEl) qualityEl.value = this.settings.graphics.quality;
        if (shadowsEl) shadowsEl.checked = this.settings.graphics.shadows;
        if (effectsEl) effectsEl.checked = this.settings.graphics.effects;
        if (fpsEl) fpsEl.checked = this.settings.graphics.fps;
        
        // Audio
        const masterVolumeEl = document.getElementById('setting-master-volume');
        const sfxVolumeEl = document.getElementById('setting-sfx-volume');
        const musicVolumeEl = document.getElementById('setting-music-volume');
        const muteEl = document.getElementById('setting-mute');
        
        if (masterVolumeEl) {
            masterVolumeEl.value = this.settings.audio.masterVolume;
            document.getElementById('master-volume-value').textContent = this.settings.audio.masterVolume + '%';
        }
        if (sfxVolumeEl) {
            sfxVolumeEl.value = this.settings.audio.sfxVolume;
            document.getElementById('sfx-volume-value').textContent = this.settings.audio.sfxVolume + '%';
        }
        if (musicVolumeEl) {
            musicVolumeEl.value = this.settings.audio.musicVolume;
            document.getElementById('music-volume-value').textContent = this.settings.audio.musicVolume + '%';
        }
        if (muteEl) muteEl.checked = this.settings.audio.mute;
        
        // Controls
        const sensitivityEl = document.getElementById('setting-sensitivity');
        const cameraEl = document.getElementById('setting-camera');
        const keyboardEl = document.getElementById('setting-keyboard');
        
        if (sensitivityEl) {
            sensitivityEl.value = this.settings.controls.sensitivity;
            document.getElementById('sensitivity-value').textContent = this.settings.controls.sensitivity;
        }
        if (cameraEl) cameraEl.value = this.settings.controls.cameraPosition;
        if (keyboardEl) keyboardEl.checked = this.settings.controls.keyboardFallback;
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getQualitySettings() {
        const quality = this.settings.graphics.quality;
        
        const presets = {
            low: {
                shadowMapSize: 512,
                antialias: false,
                pixelRatio: 1
            },
            medium: {
                shadowMapSize: 1024,
                antialias: true,
                pixelRatio: 1
            },
            high: {
                shadowMapSize: 2048,
                antialias: true,
                pixelRatio: Math.min(window.devicePixelRatio, 2)
            },
            ultra: {
                shadowMapSize: 4096,
                antialias: true,
                pixelRatio: window.devicePixelRatio
            }
        };
        
        return presets[quality] || presets.high;
    }
}
