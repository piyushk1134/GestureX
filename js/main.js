import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CarSelector } from './carSelector.js';
import { SettingsManager } from './settingsManager.js';
import { GestureControl } from './gestureControl.js';
import { VehicleController } from './vehicle.js';
import { GameManager } from './gameManager.js';
import { showDebugInfo, createErrorOverlay } from './debugHelper.js';

// Game States
const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    CAR_SELECT: 'car_select',
    HOW_TO_PLAY: 'how_to_play',
    SETTINGS: 'settings',
    CALIBRATION: 'calibration',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

class GestureXRacing {
    constructor() {
        console.log('🎮 Initializing GestureX Racing v0.13...');
        
        // Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.loader = new GLTFLoader();
        this.clock = new THREE.Clock();
        
        // Game State
        this.state = GAME_STATES.LOADING;
        this.vehicles = [];
        this.selectedVehicleIndex = 0;
        
        // Managers
        this.carSelector = null;
        this.settingsManager = null;
        this.gestureControl = null;
        this.gameManager = null;
        
        // Loading
        this.assetsLoaded = 0;
        this.totalAssets = 5; // 5 cars
        
        // Start initialization
        this.init().catch(err => {
            console.error('Fatal initialization error:', err);
        });
    }

    async init() {
        try {
            showDebugInfo('⚙️ Setting up game systems...', 'info');
            
            console.log('🔧 Step 1: Setting up renderer...');
            this.setupRenderer();
            console.log('✅ Renderer ready');
            
            console.log('🔧 Step 2: Setting up scene...');
            this.setupScene();
            console.log('✅ Scene ready');
            
            console.log('🔧 Step 3: Setting up camera...');
            this.setupCamera();
            console.log('✅ Camera ready');
            
            console.log('🔧 Step 4: Setting up lights...');
            this.setupLights();
            console.log('✅ Lights ready');
        
        // Initialize managers
        console.log('🔧 Step 5: Initializing settings manager...');
        this.settingsManager = new SettingsManager();
        await this.settingsManager.loadSettings();
        console.log('✅ Settings loaded');
        
        // Setup UI event listeners
        console.log('🔧 Step 6: Setting up event listeners...');
        this.setupEventListeners();
        console.log('✅ Event listeners ready');
        
        // Load assets with timeout protection
        console.log('🔧 Step 7: Loading car models (this may take a moment)...');
        const loadTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Asset loading timeout after 30 seconds')), 30000)
        );
        
        await Promise.race([
            this.loadAssets(),
            loadTimeout
        ]);
        console.log('✅ All assets loaded');
        
        // Initialize car selector with loaded vehicles
        console.log('🔧 Step 8: Initializing car selector...');
        this.carSelector = new CarSelector(this, this.vehicles);
        console.log('✅ Car selector ready');
        
        // Initialize gesture control
        console.log('🔧 Step 9: Initializing gesture control...');
        this.gestureControl = new GestureControl();
        console.log('✅ Gesture control ready');
        
        // Hide loading, show menu
        console.log('🔧 Step 10: Switching to menu...');
        console.log('   Current state:', this.state);
        console.log('   Loading screen element:', document.getElementById('loading-screen'));
        console.log('   Menu screen element:', document.getElementById('menu-screen'));
        
        this.setState(GAME_STATES.MENU);
        
        // Double-check that loading screen is hidden
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.classList.contains('active')) {
            console.warn('   ⚠️ Loading screen still active after setState! Forcing removal...');
            loadingScreen.classList.remove('active');
        }
        
        // Double-check that menu screen is visible
        const menuScreenCheck = document.getElementById('menu-screen');
        if (menuScreenCheck && !menuScreenCheck.classList.contains('active')) {
            console.warn('   ⚠️ Menu screen not active after setState! Forcing activation...');
            menuScreenCheck.classList.add('active');
        }
        
        console.log('✅ Menu displayed');
        
        // Start animation loop
        console.log('🔧 Step 11: Starting animation loop...');
        this.animate();
        console.log('✅ Animation loop started');
        
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ GESTUREX RACING v0.13 INITIALIZED SUCCESSFULLY!');
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
        
        showDebugInfo('✅ GestureX Racing initialized successfully!', 'success');
        
        } catch (error) {
            console.error('');
            console.error('═══════════════════════════════════════════════════════');
            console.error('❌ INITIALIZATION FAILED');
            console.error('═══════════════════════════════════════════════════════');
            console.error('Error:', error);
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
            console.error('═══════════════════════════════════════════════════════');
            console.error('');
            
            showDebugInfo('❌ Initialization failed: ' + error.message, 'error');
            createErrorOverlay(error);
        }
    }

    setupRenderer() {
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: false, // Disable antialiasing for better performance
            powerPreference: "high-performance",
            stencil: false, // Disable stencil buffer (not needed)
            depth: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(1); // Force 1x pixel ratio for 60fps
        
        // Disable shadows for maximum performance
        this.renderer.shadowMap.enabled = false;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Performance optimizations
        this.renderer.info.autoReset = false; // Manual reset for better control
        
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 50, 300); // Reduced fog distance to prevent flicker
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1500 // Optimized for better depth precision (matches fog end at 300m + buffer)
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        // Simplified lighting for better performance
        // Single ambient light provides even illumination without shadow calculations
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);

        // Single directional light (no shadows for performance)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = false; // Disabled for 60fps
        this.scene.add(directionalLight);

        // Hemisphere light for subtle gradient (very cheap)
        const hemiLight = new THREE.HemisphereLight(0x3498db, 0x1a1a2e, 0.3);
        this.scene.add(hemiLight);
    }

    async loadAssets() {
        showDebugInfo('📦 Loading car models...', 'info');
        console.log('📦 Starting asset loading process...');
        
        const vehicleDefinitions = [
            { 
                name: 'F1 McLaren MCL35', 
                file: '2020 F1 McLaren MCL35.glb', 
                speed: 338,
                acceleration: 10,
                handling: 10,
                category: 'Formula 1' 
            },
            { 
                name: 'F1 Mercedes W11', 
                file: '2020 F1 Mercedes-Benz W11.glb', 
                speed: 340,
                acceleration: 10,
                handling: 10,
                category: 'Formula 1' 
            },
            { 
                name: 'F1 Red Bull RB16', 
                file: '2020 F1 Red Bull RB16.glb', 
                speed: 338,
                acceleration: 10,
                handling: 10,
                category: 'Formula 1' 
            },
            { 
                name: 'F1 Ferrari SF1000', 
                file: '2020 F1 SF1000.glb', 
                speed: 337,
                acceleration: 10,
                handling: 9,
                category: 'Formula 1' 
            },
            { 
                name: 'McLaren 765LT', 
                file: '2020 McLaren 765LT.glb', 
                speed: 297,
                acceleration: 9,
                handling: 9,
                category: 'Supercar' 
            },
        ];

        console.log(`📋 Total vehicles to load: ${vehicleDefinitions.length}`);

        for (let i = 0; i < vehicleDefinitions.length; i++) {
            const vehicleDef = vehicleDefinitions[i];
            const path = `assets/cars/${vehicleDef.file}`;
            
            console.log(`\n🚗 [${i + 1}/${vehicleDefinitions.length}] Loading: ${vehicleDef.name}`);
            console.log(`   Path: ${path}`);
            
            try {
                showDebugInfo(`Loading: ${vehicleDef.name}...`, 'info');
                
                // Add timeout for individual model loading (10 seconds per model)
                const modelLoadPromise = this.loader.loadAsync(path);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`Timeout loading ${vehicleDef.name}`)), 10000)
                );
                
                const gltf = await Promise.race([modelLoadPromise, timeoutPromise]);
                
                console.log(`   ✅ Model data loaded successfully`);
                
                this.vehicles.push({
                    name: vehicleDef.name,
                    model: gltf.scene,
                    speed: vehicleDef.speed,
                    acceleration: vehicleDef.acceleration,
                    handling: vehicleDef.handling,
                    category: vehicleDef.category
                });
                
                this.assetsLoaded++;
                const progress = (this.assetsLoaded / this.totalAssets) * 100;
                this.updateLoadingProgress(progress, `Loaded ${vehicleDef.name}...`);
                
                console.log(`   ✅ Vehicle added to collection (${this.vehicles.length} total)`);
                showDebugInfo(`✓ Loaded: ${vehicleDef.name}`, 'success');
                
            } catch (error) {
                console.error(`   ❌ Failed to load ${vehicleDef.file}`);
                console.error(`   Error: ${error.message}`);
                console.error(`   Stack: ${error.stack}`);
                
                showDebugInfo(`❌ Failed to load ${vehicleDef.file}: ${error.message}`, 'error');
                
                // Increment counter even on failure to prevent hanging
                this.assetsLoaded++;
                const progress = (this.assetsLoaded / this.totalAssets) * 100;
                this.updateLoadingProgress(progress, `Failed: ${vehicleDef.name}`);
            }
        }

        console.log(`\n✅ Asset loading complete: ${this.vehicles.length}/${vehicleDefinitions.length} vehicles loaded`);
        
        if (this.vehicles.length === 0) {
            throw new Error('No vehicles loaded! Please check that:\n1. You are running on a local server (not file://)\n2. The assets/cars/ folder exists\n3. The .glb files are present');
        }
        
        showDebugInfo(`✅ Loaded ${this.vehicles.length} vehicles`, 'success');
        this.updateLoadingProgress(100, 'Ready!');
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    updateLoadingProgress(percent, text) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) progressBar.style.width = percent + '%';
        if (loadingText) loadingText.textContent = text;
    }

    setupEventListeners() {
        // Main Menu Buttons
        document.getElementById('btn-start')?.addEventListener('click', () => {
            this.setState(GAME_STATES.CALIBRATION);
        });
        
        document.getElementById('btn-select-car')?.addEventListener('click', () => {
            this.setState(GAME_STATES.CAR_SELECT);
        });
        
        document.getElementById('btn-settings')?.addEventListener('click', () => {
            this.setState(GAME_STATES.SETTINGS);
        });
        
        document.getElementById('btn-how-to-play')?.addEventListener('click', () => {
            this.setState(GAME_STATES.HOW_TO_PLAY);
        });
        
        document.getElementById('btn-quit')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to quit?')) {
                window.close();
            }
        });
        
        // Car Selection Buttons
        document.getElementById('btn-prev-car')?.addEventListener('click', () => {
            this.carSelector?.previousCar();
        });
        
        document.getElementById('btn-next-car')?.addEventListener('click', () => {
            this.carSelector?.nextCar();
        });
        
        document.getElementById('btn-confirm-car')?.addEventListener('click', () => {
            this.setState(GAME_STATES.MENU);
        });
        
        document.getElementById('btn-back-from-cars')?.addEventListener('click', () => {
            this.setState(GAME_STATES.MENU);
        });
        
        // How to Play Buttons
        document.getElementById('btn-start-from-tutorial')?.addEventListener('click', () => {
            this.setState(GAME_STATES.CALIBRATION);
        });
        
        document.getElementById('btn-back-from-tutorial')?.addEventListener('click', () => {
            this.setState(GAME_STATES.MENU);
        });
        
        // Settings Buttons
        document.getElementById('btn-save-settings')?.addEventListener('click', () => {
            this.settingsManager.saveSettings();
            this.applySettings();
            this.setState(GAME_STATES.MENU);
        });
        
        document.getElementById('btn-back-from-settings')?.addEventListener('click', () => {
            this.setState(GAME_STATES.MENU);
        });
        
        document.getElementById('btn-calibrate')?.addEventListener('click', () => {
            this.setState(GAME_STATES.CALIBRATION);
        });
        
        // Settings Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Settings Range Sliders
        const volumeSliders = ['master-volume', 'sfx-volume', 'music-volume'];
        volumeSliders.forEach(id => {
            const slider = document.getElementById(`setting-${id}`);
            const display = document.getElementById(`${id}-value`);
            slider?.addEventListener('input', (e) => {
                display.textContent = e.target.value + '%';
            });
        });
        
        const sensitivitySlider = document.getElementById('setting-sensitivity');
        const sensitivityDisplay = document.getElementById('sensitivity-value');
        sensitivitySlider?.addEventListener('input', (e) => {
            sensitivityDisplay.textContent = e.target.value;
        });
        
        // Calibration Buttons
        document.getElementById('btn-start-race')?.addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('btn-back-from-calibration')?.addEventListener('click', () => {
            if (this.gestureControl) {
                this.gestureControl.cleanup();
            }
            this.setState(GAME_STATES.MENU);
        });
        
        // Pause Menu
        document.getElementById('btn-resume')?.addEventListener('click', () => {
            this.setState(GAME_STATES.PLAYING);
        });
        
        document.getElementById('btn-restart')?.addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('btn-quit-to-menu')?.addEventListener('click', () => {
            this.quitToMenu();
        });
        
        // Game Over
        document.getElementById('btn-play-again')?.addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('btn-menu-from-gameover')?.addEventListener('click', () => {
            this.quitToMenu();
        });
        
        // Keyboard Controls
        window.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Theme Toggle Button
        document.getElementById('btn-toggle-theme')?.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
    }

    handleKeyPress(e) {
        switch (e.code) {
            case 'Escape':
                if (this.state === GAME_STATES.PLAYING) {
                    this.setState(GAME_STATES.PAUSED);
                } else if (this.state === GAME_STATES.PAUSED) {
                    this.setState(GAME_STATES.PLAYING);
                }
                break;
            case 'Space':
                if (this.state === GAME_STATES.CALIBRATION) {
                    this.startGame();
                }
                break;
        }
    }

    setState(newState) {
        console.log(`🎬 State: ${this.state} → ${newState}`);
        this.state = newState;
        
        // Hide all screens
        console.log('   Hiding all screens...');
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Remove any existing car previews when changing states
        if (this.carSelector) {
            this.carSelector.removePreview();
        }
        
        // Show appropriate screen
        console.log(`   Activating ${newState} screen...`);
        switch (newState) {
            case GAME_STATES.LOADING:
                document.getElementById('loading-screen')?.classList.add('active');
                break;
                
            case GAME_STATES.MENU:
                const menuScreen = document.getElementById('menu-screen');
                if (menuScreen) {
                    menuScreen.classList.add('active');
                    console.log('   ✅ Menu screen activated');
                } else {
                    console.error('   ❌ Menu screen element not found!');
                }
                const canvas = document.getElementById('game-canvas');
                if (canvas) canvas.style.zIndex = '-1';
                const hud = document.getElementById('game-hud');
                if (hud) hud.classList.add('hidden');
                // Show menu preview after a short delay
                setTimeout(() => {
                    if (this.carSelector) {
                        console.log('   🏎️ Showing menu preview...');
                        this.carSelector.showMenuPreview();
                    }
                }, 100);
                break;
                
            case GAME_STATES.CAR_SELECT:
                document.getElementById('car-select-screen')?.classList.add('active');
                this.carSelector?.showCarousel();
                break;
                
            case GAME_STATES.HOW_TO_PLAY:
                document.getElementById('how-to-play-screen')?.classList.add('active');
                break;
                
            case GAME_STATES.SETTINGS:
                document.getElementById('settings-screen')?.classList.add('active');
                this.settingsManager?.populateUI();
                break;
                
            case GAME_STATES.CALIBRATION:
                document.getElementById('calibration-screen')?.classList.add('active');
                // Initialize gesture control with correct IDs
                this.gestureControl.init().then(success => {
                    if (success) {
                        console.log('✅ Camera started in calibration');
                    } else {
                        console.warn('⚠️ Camera failed, use keyboard');
                    }
                });
                break;
                
            case GAME_STATES.PLAYING:
                document.getElementById('game-canvas').style.zIndex = '0';
                document.getElementById('game-hud')?.classList.remove('hidden');
                document.getElementById('game-camera-feed')?.classList.remove('hidden');
                document.getElementById('pause-screen')?.classList.remove('active');
                break;
                
            case GAME_STATES.PAUSED:
                document.getElementById('pause-screen')?.classList.add('active');
                break;
                
            case GAME_STATES.GAME_OVER:
                document.getElementById('gameover-screen')?.classList.add('active');
                break;
        }
    }

    startGame() {
        console.log('🏁 Starting game...');
        const selectedVehicle = this.vehicles[this.selectedVehicleIndex];
        
        if (!selectedVehicle) {
            console.error('No vehicle selected!');
            return;
        }
        
        // Initialize game manager if not exists
        if (!this.gameManager) {
            this.gameManager = new GameManager(this, selectedVehicle);
        }
        
        this.setState(GAME_STATES.PLAYING);
        
        // Camera is already running from calibration screen, no need to start again
        console.log('📷 Using existing gesture camera feed');
    }

    restartGame() {
        console.log('🔄 Restarting game...');
        
        // Properly cleanup old game manager first
        if (this.gameManager) {
            this.gameManager.cleanup();
            this.gameManager = null;
        }
        
        // Reset clock to prevent delta time issues
        this.clock.getDelta(); // Clear accumulated delta
        
        // Restart fresh - go to calibration
        this.setState(GAME_STATES.CALIBRATION);
    }

    quitToMenu() {
        console.log('🏠 Returning to menu...');
        
        // Hide camera feed
        document.getElementById('game-camera-feed')?.classList.add('hidden');
        
        // Cleanup game manager properly
        if (this.gameManager) {
            this.gameManager.cleanup();
            this.gameManager = null;
        }
        
        // Reset clock to prevent delta time issues
        this.clock.getDelta(); // Clear accumulated delta
        
        this.setState(GAME_STATES.MENU);
    }

    applySettings() {
        if (!this.settingsManager || !this.settingsManager.settings) {
            console.warn('⚠️ Settings not available yet');
            return;
        }
        
        const settings = this.settingsManager.settings;
        
        // Graphics settings locked to performance mode for 60fps
        if (this.renderer) {
            this.renderer.shadowMap.enabled = false; // Always disabled for 60fps
        }
        
        // Apply audio settings
        // TODO: Implement audio system
        
        console.log('✓ Settings applied (Performance Mode: 60fps)');
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = Math.min(this.clock.getDelta(), 0.1); // Cap delta to prevent huge jumps
        
        // Update based on state
        if (this.state === GAME_STATES.MENU) {
            this.carSelector?.updateMenuPreview(delta);
        } else if (this.state === GAME_STATES.CAR_SELECT) {
            this.carSelector?.updateCarousel(delta);
        } else if (this.state === GAME_STATES.CALIBRATION) {
            // Gesture control updates itself via MediaPipe callbacks
        } else if (this.state === GAME_STATES.PLAYING) {
            if (this.gameManager) {
                this.gameManager.update(delta);
            }
            // Gesture control updates itself via MediaPipe callbacks
        } else if (this.state === GAME_STATES.GAME_OVER) {
            // Don't update game manager when game is over
            // This prevents lag from continued updates
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    getSelectedVehicle() {
        return this.vehicles[this.selectedVehicleIndex];
    }
    
    toggleTheme() {
        const body = document.body;
        const isDayMode = body.classList.toggle('day-mode');
        
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');
        
        if (isDayMode) {
            // Switch to Day Mode
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Day Mode';
            
            // Change scene background to day
            if (this.scene) {
                this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
                this.scene.fog = new THREE.Fog(0x87CEEB, 50, 300); // Reduced fog distance
            }
            
            console.log('🌞 Switched to Day Mode');
        } else {
            // Switch to Night Mode
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Night Mode';
            
            // Change scene background to night
            if (this.scene) {
                this.scene.background = new THREE.Color(0x1a1a2e); // Dark blue
                this.scene.fog = new THREE.Fog(0x1a1a2e, 50, 300); // Reduced fog distance
            }
            
            console.log('🌙 Switched to Night Mode');
        }
        
        // Save preference
        localStorage.setItem('gesturex_theme', isDayMode ? 'day' : 'night');
    }
}

// Start the game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GestureXRacing();
});
