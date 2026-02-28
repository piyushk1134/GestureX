import * as THREE from 'three';

export class VehicleController {
    constructor(vehicleData, scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.vehicleData = vehicleData;
        
        // Physics properties
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = 0;
        
        this.maxSpeed = 250; // Normal max speed capped at 250
        this.boostMaxSpeed = 299; // Boost max speed
        this.acceleration = vehicleData.acceleration || 7;
        this.handling = vehicleData.handling || 7;
        this.brakeForce = 0.95;
        this.isBoosting = false; // Track boost state
        
        // Boost energy system
        this.boostEnergy = 100; // Start with full boost
        this.maxBoostEnergy = 100;
        this.boostDrainRate = 30; // Energy drained per second when boosting
        this.boostRechargeRate = 15; // Energy recharged per second when not boosting
        this.minBoostEnergy = 10; // Minimum energy required to activate boost
        
        this.currentSpeed = 0;
        this.steerAngle = 0;
        
        // Lane system (5 lanes, 3.5m each)
        this.laneWidth = 3.5;
        this.lanes = [-7.0, -3.5, 0.0, 3.5, 7.0]; // 5 lane positions
        this.currentLane = 2; // Start in center lane (index 2)
        this.targetLane = 2;
        this.laneSwitchSpeed = 8.0; // How fast to switch lanes
        this.laneSwitchCooldown = 0; // Cooldown timer to prevent multiple switches
        this.laneSwitchCooldownTime = 0.5; // 0.5 seconds between lane changes
        
        // Camera POV system - Simple chase cameras
        this.cameraMode = 'chase'; // Current camera mode
        this.cameraModes = [
            'chase',        // Chase camera (default)
            'chase_close'   // Close chase camera
        ];
        this.currentCameraIndex = 0; // Start with chase camera
        this.cameraToggleCooldown = 0;
        this.cameraToggleCooldownTime = 0.3; // Prevent rapid toggling
        
        // Create 3D model
        this.body = null;
        this.createBody();
        
        console.log(`🏎️ Vehicle created: ${vehicleData.name}`);
        console.log(`🛣️ Lane system: 5 lanes, starting in center (lane ${this.currentLane})`);
        console.log(`📷 Camera modes: Chase / Close Chase (toggle with V key)`);
    }

    createBody() {
        if (this.vehicleData.model) {
            this.body = this.vehicleData.model.clone();
            this.mesh = this.body; // Add mesh reference for collision detection
            this.body.position.copy(this.position);
            this.body.rotation.y = this.rotation;
            
            // Scale to appropriate size - larger to be more visible
            this.body.scale.set(1.0, 1.0, 1.0);
            
            // Find and store wheel references to keep them stationary
            this.wheels = [];
            
            this.body.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = false; // Disabled for 60fps
                    child.receiveShadow = false; // Disabled for 60fps
                    
                    // Detect wheels/tires by name (common naming patterns)
                    const name = child.name.toLowerCase();
                    if (name.includes('wheel') || name.includes('tire') || name.includes('tyre') || 
                        name.includes('rim') || name.includes('rotor')) {
                        this.wheels.push({
                            mesh: child,
                            initialRotation: child.rotation.clone() // Store initial rotation
                        });
                        console.log(`🛞 Found wheel: ${child.name}`);
                    }
                }
            });
            
            console.log(`✅ Found ${this.wheels.length} wheels to keep stationary`);
            
            this.scene.add(this.body);
            console.log('✅ Vehicle body added to scene at:', this.body.position);
        } else {
            console.error('❌ No vehicle model provided!');
        }
    }

    update(delta, controls) {
        if (!this.body) return;
        
        // Update lane switch cooldown
        if (this.laneSwitchCooldown > 0) {
            this.laneSwitchCooldown -= delta;
        }
        
        // Update camera toggle cooldown
        if (this.cameraToggleCooldown > 0) {
            this.cameraToggleCooldown -= delta;
        }
        
        // Handle camera toggle (V key)
        if (controls.toggleCamera && this.cameraToggleCooldown <= 0) {
            this.toggleCameraMode();
            this.cameraToggleCooldown = this.cameraToggleCooldownTime;
        }
        
        // Handle boost energy system
        const wantsToBoost = controls.boost || false;
        
        // Check if we can boost (have enough energy)
        if (wantsToBoost && this.boostEnergy >= this.minBoostEnergy) {
            this.isBoosting = true;
            // Drain boost energy
            this.boostEnergy -= this.boostDrainRate * delta;
            this.boostEnergy = Math.max(0, this.boostEnergy);
            
            // If energy runs out, stop boosting
            if (this.boostEnergy < this.minBoostEnergy) {
                this.isBoosting = false;
            }
        } else {
            this.isBoosting = false;
            // Recharge boost energy when not boosting
            this.boostEnergy += this.boostRechargeRate * delta;
            this.boostEnergy = Math.min(this.maxBoostEnergy, this.boostEnergy);
        }
        
        // Determine active max speed based on boost
        const activeMaxSpeed = this.isBoosting ? this.boostMaxSpeed : this.maxSpeed;
        
        // Handle acceleration
        if (controls.accelerate) {
            this.currentSpeed += this.acceleration * delta * 10;
        } else if (controls.brake) {
            this.currentSpeed -= this.acceleration * delta * 15;
        } else {
            // Natural deceleration
            this.currentSpeed *= this.brakeForce;
        }
        
        // Clamp speed based on boost state
        this.currentSpeed = Math.max(0, Math.min(this.currentSpeed, activeMaxSpeed));
        
        // If boosting and below boost max, accelerate faster
        if (this.isBoosting && this.currentSpeed < this.boostMaxSpeed) {
            this.currentSpeed += this.acceleration * delta * 15; // Extra acceleration during boost
            this.currentSpeed = Math.min(this.currentSpeed, this.boostMaxSpeed);
        }
        
        // If not boosting and speed exceeds normal max, slow down gradually
        if (!this.isBoosting && this.currentSpeed > this.maxSpeed) {
            this.currentSpeed -= this.acceleration * delta * 5; // Gradual slowdown
            this.currentSpeed = Math.max(this.currentSpeed, this.maxSpeed);
        }
        
        // Handle lane switching (only if cooldown expired)
        if (this.laneSwitchCooldown <= 0) {
            if (controls.left) {
                this.switchLane(-1); // Decrease lane index (move to more negative X = left)
            } else if (controls.right) {
                this.switchLane(1); // Increase lane index (move to more positive X = right)
            }
        }
        
        // Smoothly move to target lane
        const targetX = this.lanes[this.targetLane];
        const currentX = this.body.position.x;
        const diff = targetX - currentX;
        
        if (Math.abs(diff) > 0.1) {
            this.body.position.x += diff * this.laneSwitchSpeed * delta;
        } else {
            this.body.position.x = targetX;
            this.currentLane = this.targetLane;
        }
        
        // Car stays at fixed Z position, track/obstacles move instead
        // Update position reference for distance tracking only
        this.position.z += this.currentSpeed * delta * 0.27778; // Track virtual distance traveled
        
        // Keep car at fixed position visually
        this.body.position.z = 0; // Car stays at origin
        this.body.position.x = this.body.position.x; // Only X changes for lane switching
        this.body.position.y = this.body.position.y; // Y stays constant
        
        // Keep wheels stationary (reset to initial rotation)
        if (this.wheels && this.wheels.length > 0) {
            for (let wheel of this.wheels) {
                wheel.mesh.rotation.copy(wheel.initialRotation);
            }
        }
        
        // Update camera
        this.updateCamera();
    }

    updateCamera() {
        if (!this.camera || !this.body) return;
        
        let cameraOffset, lookAtPoint, lerpSpeed;
        
        switch (this.cameraMode) {
            case 'chase':
                // Default chase camera: behind and above the car - perfect balance
                cameraOffset = new THREE.Vector3(0, 3.5, -10);
                lerpSpeed = 0.15; // Increased for smoother following
                lookAtPoint = new THREE.Vector3(
                    this.body.position.x,
                    this.body.position.y + 1,
                    this.body.position.z + 8
                );
                break;
                
            case 'chase_close':
                // Close chase camera: closer for intense racing action
                cameraOffset = new THREE.Vector3(0, 2.5, -6);
                lerpSpeed = 0.18; // Increased for smoother following
                lookAtPoint = new THREE.Vector3(
                    this.body.position.x,
                    this.body.position.y + 1,
                    this.body.position.z + 5
                );
                break;
                
            default:
                // Fallback to chase camera
                cameraOffset = new THREE.Vector3(0, 3.5, -10);
                lerpSpeed = 0.15;
                lookAtPoint = new THREE.Vector3(
                    this.body.position.x,
                    this.body.position.y + 1,
                    this.body.position.z + 8
                );
        }
        
        // Position camera relative to car
        const cameraPosition = new THREE.Vector3();
        cameraPosition.copy(this.body.position);
        cameraPosition.add(cameraOffset);
        
        // Smooth camera movement for stability with enhanced interpolation
        this.camera.position.lerp(cameraPosition, lerpSpeed);
        
        // Smooth look-at with interpolation for smoother rotation
        if (!this.targetLookAt) {
            this.targetLookAt = lookAtPoint.clone();
        }
        this.targetLookAt.lerp(lookAtPoint, 0.2); // Smooth look-at interpolation
        this.camera.lookAt(this.targetLookAt);
    }
    
    toggleCameraMode() {
        // Cycle through camera modes
        this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameraModes.length;
        this.cameraMode = this.cameraModes[this.currentCameraIndex];
        
        const cameraNames = {
            'chase': 'Chase Camera',
            'chase_close': 'Close Chase'
        };
        
        console.log(`📷 Camera: ${cameraNames[this.cameraMode] || this.cameraMode}`);
    }
    
    getCameraMode() {
        return this.cameraMode;
    }

    switchLane(direction) {
        // direction: -1 for left, +1 for right
        const newLane = this.targetLane + direction;
        
        // Check bounds (0-4 for 5 lanes)
        if (newLane >= 0 && newLane < this.lanes.length) {
            this.targetLane = newLane;
            this.laneSwitchCooldown = this.laneSwitchCooldownTime; // Set cooldown
            console.log(`🛣️ Switching to lane ${this.targetLane} (${this.lanes[this.targetLane]}m)`);
        }
    }
    
    getCurrentLaneIndex() {
        return this.currentLane;
    }
    
    reset() {
        this.position.set(0, 0.5, 0); // Slightly above ground
        this.velocity.set(0, 0, 0);
        this.rotation = 0;
        this.currentSpeed = 0;
        this.steerAngle = 0;
        this.currentLane = 2; // Center lane
        this.targetLane = 2;
        
        if (this.body) {
            this.body.position.copy(this.position);
            this.body.rotation.y = this.rotation;
        }
        
        console.log('🔄 Vehicle reset to center lane');
    }

    getSpeed() {
        return this.currentSpeed;
    }
    
    getBoostEnergy() {
        return this.boostEnergy;
    }
    
    getMaxBoostEnergy() {
        return this.maxBoostEnergy;
    }
    
    getBoostPercentage() {
        return (this.boostEnergy / this.maxBoostEnergy) * 100;
    }

    getPosition() {
        return this.position.clone();
    }
}
