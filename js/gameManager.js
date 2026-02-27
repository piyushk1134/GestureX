import * as THREE from 'three';
import { VehicleController } from './vehicle.js';
import { ObstacleManager } from './obstacles.js';

export class GameManager {
    constructor(game, vehicleData) {
        this.game = game;
        this.scene = game.scene;
        this.camera = game.camera;
        this.vehicleData = vehicleData;
        
        this.player = null;
        this.obstacleManager = null;
        this.track = null;
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = 1;
        this.highScore = 0;
        
        this.init();
    }

    init() {
        console.log('🎬 GameManager.init() starting...');
        
        // Create track FIRST
        this.createTrack();
        console.log('✅ Track created');
        
        // Create player vehicle
        this.playerVehicle = new VehicleController(
            this.vehicleData,
            this.game.scene,
            this.game.camera
        );
        console.log('✅ Player vehicle created');
        
        // Position camera to see track
        this.game.camera.position.set(0, 15, 25);
        this.game.camera.lookAt(0, 0, 0);
        console.log('✅ Camera positioned at:', this.game.camera.position);
        
        // Create obstacle manager
        this.obstacleManager = new ObstacleManager(this.game.scene, this.game);
        
        // Find McLaren 765LT model for traffic cars
        const mclarenModel = this.game.vehicles.find(v => v.name === 'McLaren 765LT');
        if (mclarenModel && mclarenModel.model) {
            this.obstacleManager.setTrafficCarModel(mclarenModel.model);
            console.log('✅ Traffic cars will use McLaren 765LT model');
        } else {
            console.warn('⚠️ McLaren 765LT not found, using simple box for traffic');
        }
        
        console.log('✅ Obstacle manager created');
        
        // Start game
        this.resetGame();
        
        console.log('');
        console.log('════════════════════════════════════════════');
        console.log('✅ GAME READY!');
        console.log('════════════════════════════════════════════');
        console.log('🎮 Controls:');
        console.log('  W/↑ - Accelerate');
        console.log('  S/↓ - Brake');
        console.log('  A/← - Turn Left');
        console.log('  D/→ - Turn Right');
        console.log('════════════════════════════════════════════');
        console.log('');
    }

    createTrack() {
        // Create TWO ground sections for seamless looping
        const groundGeometry = new THREE.PlaneGeometry(200, 2000);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.1
        });
        
        // First ground section
        const ground1 = new THREE.Mesh(groundGeometry, groundMaterial);
        ground1.rotation.x = -Math.PI / 2;
        ground1.position.y = 0;
        ground1.position.z = 0;
        ground1.receiveShadow = false; // Disabled for 60fps
        this.game.scene.add(ground1);
        
        // Second ground section (starts where first ends)
        const ground2 = new THREE.Mesh(groundGeometry, groundMaterial);
        ground2.rotation.x = -Math.PI / 2;
        ground2.position.y = 0;
        ground2.position.z = 2000;
        ground2.receiveShadow = false; // Disabled for 60fps
        this.game.scene.add(ground2);
        
        this.groundSections = [ground1, ground2]; // Store both for looping
        
        // Racing track (5 lanes, each lane = 3.5m car width)
        const laneWidth = 3.5; // Width of each lane (matches car width)
        const numLanes = 5;
        const trackWidth = laneWidth * numLanes; // 17.5m total
        
        const trackGeometry = new THREE.PlaneGeometry(trackWidth, 2000);
        const trackMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2c3e50,
            roughness: 0.7
        });
        
        // First track section
        const track1 = new THREE.Mesh(trackGeometry, trackMaterial);
        track1.rotation.x = -Math.PI / 2;
        track1.position.y = 0.01; // Just slightly above ground to prevent Z-fighting
        track1.position.z = 0;
        track1.receiveShadow = false; // Disabled for 60fps
        this.game.scene.add(track1);
        
        // Second track section (starts where first ends)
        const track2 = new THREE.Mesh(trackGeometry, trackMaterial);
        track2.rotation.x = -Math.PI / 2;
        track2.position.y = 0.01;
        track2.position.z = 2000;
        track2.receiveShadow = false; // Disabled for 60fps
        this.game.scene.add(track2);
        
        this.trackSections = [track1, track2]; // Store both for looping
        
        // Lane markings (white dashed lines between 5 lanes) - Store for repeating
        this.laneDashes = [];
        const dashLength = 8;
        const gapLength = 4;
        
        // Calculate lane positions (4 lines for 5 lanes)
        const lanePositions = [];
        for (let i = 1; i < numLanes; i++) {
            lanePositions.push(-trackWidth/2 + i * laneWidth);
        }
        
        // Create initial dashes from -200 to +200 (visible range)
        for (let z = -200; z < 200; z += dashLength + gapLength) {
            for (const laneX of lanePositions) {
                const dash = this.createDash(laneX, z, dashLength);
                this.game.scene.add(dash);
                this.laneDashes.push(dash);
            }
        }
        
        // Side barriers (infinite)
        this.createBarriers(trackWidth);
        
        // Add some scenery (will be managed dynamically)
        this.createScenery();
        
        console.log(`✅ Created infinite 5-lane track (${trackWidth}m wide, ${laneWidth}m per lane)`);
    }
    
    createDash(x, z, length) {
        const dashGeometry = new THREE.BoxGeometry(0.3, 0.1, length);
        const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const dash = new THREE.Mesh(dashGeometry, dashMaterial);
        dash.position.set(x, 0.05, z); // Properly raised above track (track is at 0.01)
        return dash;
    }
    
    createBarriers(trackWidth) {
        // REMOVED - Barriers are now created by ObstacleManager only
        // This prevents duplicate overlapping geometry
        console.log('✅ Barriers handled by ObstacleManager');
    }
    
    createScenery() {
        // Add trees along the side - Store for repeating
        this.sceneryObjects = [];
        
        // Create fewer trees for better performance (every 80m instead of 50m)
        for (let i = -200; i < 200; i += 80) {
            // Left side
            const leftTree = this.createTree();
            leftTree.position.set(-25, 0, i + Math.random() * 30);
            this.game.scene.add(leftTree);
            this.sceneryObjects.push(leftTree);
            
            // Right side
            const rightTree = this.createTree();
            rightTree.position.set(25, 0, i + Math.random() * 30);
            this.game.scene.add(rightTree);
            this.sceneryObjects.push(rightTree);
        }
    }
    
    createTree() {
        // Create a tree group with trunk and foliage
        const tree = new THREE.Group();
        
        // Brown trunk (optimized geometry)
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 6); // Reduced from 8 to 6 segments
        const trunkMaterial = new THREE.MeshLambertMaterial({ // Lambert is cheaper than Standard
            color: 0x8B4513 // Brown
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5; // Half of trunk height
        trunk.castShadow = false; // Disabled for 60fps
        tree.add(trunk);
        
        // Green foliage (3 spheres stacked)
        const foliageMaterial = new THREE.MeshLambertMaterial({ // Lambert is cheaper than Standard
            color: 0x228B22 // Forest green
        });
        
        // Bottom foliage sphere (reduced geometry for performance)
        const foliage1 = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 6, 6), // Reduced from 8x8 to 6x6
            foliageMaterial
        );
        foliage1.position.y = 3.5;
        foliage1.castShadow = false; // Disabled for 60fps
        tree.add(foliage1);
        
        // Middle foliage sphere (reduced geometry for performance)
        const foliage2 = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 6, 6), // Reduced from 8x8 to 6x6
            foliageMaterial
        );
        foliage2.position.y = 4.5;
        foliage2.castShadow = false; // Disabled for 60fps
        tree.add(foliage2);
        
        // Top foliage sphere (reduced geometry for performance)
        const foliage3 = new THREE.Mesh(
            new THREE.SphereGeometry(0.9, 6, 6), // Reduced from 8x8 to 6x6
            foliageMaterial
        );
        foliage3.position.y = 5.3;
        foliage3.castShadow = false; // Disabled for 60fps
        tree.add(foliage3);
        
        return tree;
    }

    update(delta) {
        if (!this.playerVehicle) return;
        
        // Get input from gesture control or keyboard
        const gestureInput = this.game.gestureControl?.getGestureInput();
        const controls = this.getControls(gestureInput);
        
        // Update vehicle
        this.playerVehicle.update(delta, controls);
        
        // Get vehicle speed to move the world
        const speed = this.playerVehicle.getSpeed();
        const moveDistance = speed * delta * 0.27778; // Convert km/h to m/s
        
        // Car stays at Z=0, get virtual position for tracking
        const vehiclePos = this.playerVehicle.mesh?.position || new THREE.Vector3(0, 0, 0);
        const virtualZ = this.playerVehicle.position.z; // Virtual position for distance tracking
        
        // Update obstacles
        if (this.obstacleManager) {
            this.obstacleManager.update(delta, vehiclePos);
            
            // Check collisions
            const collision = this.obstacleManager.checkCollision(vehiclePos, 2);
            if (collision && !this.isInvulnerable) {
                this.handleCollision(collision);
            }
        }
        
        // Update invulnerability
        if (this.isInvulnerable) {
            this.invulnerabilityTimer -= delta;
            if (this.invulnerabilityTimer <= 0) {
                this.isInvulnerable = false;
                // Reset vehicle opacity
                if (this.playerVehicle.mesh) {
                    this.playerVehicle.mesh.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.opacity = 1.0;
                            child.material.transparent = false;
                        }
                    });
                }
            } else {
                // Blink effect
                const blink = Math.floor(this.invulnerabilityTimer * 10) % 2;
                if (this.playerVehicle.mesh) {
                    this.playerVehicle.mesh.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.opacity = blink ? 0.3 : 1.0;
                            child.material.transparent = true;
                        }
                    });
                }
            }
        }
        
        // Update game time
        this.gameTime += delta;
        
        // Update distance traveled
        this.distance += moveDistance;
        
        // Update score (based on distance)
        this.score = Math.floor(this.distance);
        
        // Move all track elements TOWARDS the car (negative Z direction)
        // Ground sections
        if (this.groundSections) {
            for (let ground of this.groundSections) {
                ground.position.z -= moveDistance;
                // Loop sections back to front when they pass behind camera
                if (ground.position.z < -1000) {
                    ground.position.z += 4000;
                }
            }
        }
        
        // Track sections
        if (this.trackSections) {
            for (let track of this.trackSections) {
                track.position.z -= moveDistance;
                // Loop sections back to front
                if (track.position.z < -1000) {
                    track.position.z += 4000;
                }
            }
        }
        
        // Barriers (if they exist in obstacle manager)
        if (this.obstacleManager && this.obstacleManager.barriers) {
            for (let barrier of this.obstacleManager.barriers) {
                barrier.position.z -= moveDistance;
                // Loop barriers
                if (barrier.position.z < -1000) {
                    barrier.position.z += 4000;
                }
            }
        }
        
        // Lane dashes
        if (this.laneDashes) {
            for (let dash of this.laneDashes) {
                dash.position.z -= moveDistance;
                // Loop dashes when they pass behind
                if (dash.position.z < -100) {
                    dash.position.z += 400;
                }
            }
        }
        
        // Scenery objects (trees)
        if (this.sceneryObjects) {
            for (let obj of this.sceneryObjects) {
                obj.position.z -= moveDistance;
                // Loop trees when they pass behind
                if (obj.position.z < -100) {
                    obj.position.z += 400;
                }
            }
        }
        
        // Update HUD
        this.updateHUD();
        
        // Check game over conditions
        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    getControls(gestureInput) {
        const controls = {
            accelerate: false,
            brake: false,
            left: false,
            right: false,
            boost: false,
            toggleCamera: false
        };
        
        // Gesture controls
        if (gestureInput && gestureInput.handDetected) {
            Object.assign(controls, gestureInput.controls);
        }
        
        // Touch controls (mobile)
        if (this.game.touchControls) {
            const touchInput = this.game.touchControls.getControls();
            controls.accelerate = controls.accelerate || touchInput.accelerate;
            controls.brake = controls.brake || touchInput.brake;
            controls.left = controls.left || touchInput.left;
            controls.right = controls.right || touchInput.right;
            controls.boost = controls.boost || touchInput.boost;
            controls.toggleCamera = controls.toggleCamera || touchInput.toggleCamera;
        }
        
        // Keyboard fallback (safe access)
        const keyboardFallback = this.game.settingsManager?.settings?.controls?.keyboardFallback ?? true;
        if (keyboardFallback) {
            const keys = this.getKeyboardState();
            controls.accelerate = controls.accelerate || keys.up;
            controls.brake = controls.brake || keys.down;
            controls.left = controls.left || keys.left;
            controls.right = controls.right || keys.right;
            controls.boost = controls.boost || keys.shift;
            controls.toggleCamera = controls.toggleCamera || keys.toggleCamera;
        }
        
        return controls;
    }

    getKeyboardState() {
        // Get keyboard state from window
        if (!window.keys) {
            window.keys = {};
            
            // Setup keyboard listeners
            window.addEventListener('keydown', (e) => {
                window.keys[e.code] = true;
            });
            
            window.addEventListener('keyup', (e) => {
                window.keys[e.code] = false;
            });
        }
        
        return {
            up: window.keys['KeyW'] || window.keys['ArrowUp'],
            down: window.keys['KeyS'] || window.keys['ArrowDown'],
            left: window.keys['KeyA'] || window.keys['ArrowLeft'],
            right: window.keys['KeyD'] || window.keys['ArrowRight'],
            shift: window.keys['ShiftLeft'] || window.keys['ShiftRight'],
            toggleCamera: window.keys['KeyV']
        };
    }

    updateHUD() {
        // Update distance (score)
        const scoreEl = document.getElementById('hud-score');
        const bestEl = document.getElementById('hud-best');
        
        if (scoreEl) scoreEl.textContent = Math.floor(this.distance) + 'm';
        if (bestEl) bestEl.textContent = Math.floor(this.highScore) + 'm';
        
        // Update speed
        const speed = Math.floor(this.playerVehicle.getSpeed());
        document.getElementById('hud-speed').textContent = speed;
        
        // Update lives
        const livesEl = document.getElementById('hud-lives');
        livesEl.innerHTML = '❤️'.repeat(this.lives);
        
        // Update time
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('hud-time').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update camera mode indicator
        const cameraMode = this.playerVehicle.getCameraMode();
        const cameraModeEl = document.getElementById('hud-camera-mode');
        if (cameraModeEl) {
            const cameraNames = {
                'chase': '📷 Chase',
                'chase_close': '📷 Close Chase'
            };
            cameraModeEl.textContent = cameraNames[cameraMode] || '📷 ' + cameraMode;
        }
    }

    handleCollision(collision) {
        console.log(`💥 Hit ${collision.type}!`);
        
        this.lives--;
        this.isInvulnerable = true;
        this.invulnerabilityTimer = 2.0; // 2 seconds invulnerability
        
        // Visual feedback
        this.showDamageEffect();
        
        // Remove the obstacle
        if (collision.obstacle && this.obstacleManager) {
            this.obstacleManager.removeObstacle(collision.obstacle);
        }
    }
    
    showDamageEffect() {
        // Flash screen red
        const damageOverlay = document.createElement('div');
        damageOverlay.style.position = 'fixed';
        damageOverlay.style.top = '0';
        damageOverlay.style.left = '0';
        damageOverlay.style.width = '100%';
        damageOverlay.style.height = '100%';
        damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        damageOverlay.style.pointerEvents = 'none';
        damageOverlay.style.zIndex = '9999';
        document.body.appendChild(damageOverlay);
        
        setTimeout(() => {
            document.body.removeChild(damageOverlay);
        }, 200);
    }

    resetGame() {
        this.score = 0;
        this.distance = 0;
        this.lives = 3;
        this.gameTime = 0;
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
        
        // Load high score from localStorage
        this.loadHighScore();
        
        if (this.playerVehicle) {
            this.playerVehicle.reset();
        }
        
        if (this.obstacleManager) {
            this.obstacleManager.reset();
        }
    }

    gameOver() {
        console.log('💥 Game Over!');
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            
            // Celebrate new high score!
            this.celebrateNewHighScore();
            
            document.getElementById('high-score-msg').classList.add('new-record');
            document.getElementById('high-score-msg').innerHTML = 
                '🎉 NEW HIGH SCORE! 🎉';
        } else {
            document.getElementById('high-score-msg').classList.remove('new-record');
            document.getElementById('high-score-msg').innerHTML = 
                '⭐ Highest Score: <span id="final-best">' + Math.floor(this.highScore) + '</span>';
        }
        
        // Update game over screen
        document.getElementById('final-score').textContent = Math.floor(this.score);
        document.getElementById('final-best').textContent = Math.floor(this.highScore);
        
        // Change state
        this.game.setState('game_over');
    }
    
    celebrateNewHighScore() {
        console.log('🎉 NEW HIGH SCORE CELEBRATION!');
        
        // Create celebration overlay with confetti effect
        const celebration = document.createElement('div');
        celebration.style.position = 'fixed';
        celebration.style.top = '0';
        celebration.style.left = '0';
        celebration.style.width = '100%';
        celebration.style.height = '100%';
        celebration.style.pointerEvents = 'none';
        celebration.style.zIndex = '9998';
        celebration.style.overflow = 'hidden';
        
        // Create confetti particles
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
            celebration.appendChild(confetti);
        }
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                to {
                    top: 100%;
                    transform: translateY(100%) rotate(${Math.random() * 360}deg);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(celebration);
        
        // Remove celebration after animation
        setTimeout(() => {
            document.body.removeChild(celebration);
            document.head.removeChild(style);
        }, 4000);
        
        // Flash screen gold
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '9997';
        flash.style.animation = 'flashGold 0.5s ease-out';
        
        const flashStyle = document.createElement('style');
        flashStyle.textContent = `
            @keyframes flashGold {
                0% { opacity: 0; }
                50% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(flashStyle);
        document.body.appendChild(flash);
        
        setTimeout(() => {
            document.body.removeChild(flash);
            document.head.removeChild(flashStyle);
        }, 500);
    }

    loadHighScore() {
        const saved = localStorage.getItem('gesturex_highscore');
        this.highScore = saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        localStorage.setItem('gesturex_highscore', Math.floor(this.highScore));
    }

    cleanup() {
        console.log('🧹 Cleaning up game manager...');
        
        // Remove player vehicle
        if (this.playerVehicle && this.playerVehicle.body) {
            this.game.scene.remove(this.playerVehicle.body);
            this.playerVehicle = null;
        }
        
        // Cleanup obstacles
        if (this.obstacleManager) {
            this.obstacleManager.cleanup();
            this.obstacleManager = null;
        }
        
        // Remove ground sections
        if (this.groundSections) {
            for (let ground of this.groundSections) {
                this.game.scene.remove(ground);
                ground.geometry?.dispose();
                ground.material?.dispose();
            }
            this.groundSections = [];
        }
        
        // Remove track sections
        if (this.trackSections) {
            for (let track of this.trackSections) {
                this.game.scene.remove(track);
                track.geometry?.dispose();
                track.material?.dispose();
            }
            this.trackSections = [];
        }
        
        // Remove lane dashes
        if (this.laneDashes) {
            for (let dash of this.laneDashes) {
                this.game.scene.remove(dash);
                dash.geometry?.dispose();
                dash.material?.dispose();
            }
            this.laneDashes = [];
        }
        
        // Remove scenery objects
        if (this.sceneryObjects) {
            for (let obj of this.sceneryObjects) {
                this.game.scene.remove(obj);
                obj.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            }
            this.sceneryObjects = [];
        }
        
        console.log('✅ Game manager cleaned up');
    }
}
