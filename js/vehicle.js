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
        
        this.maxSpeed = vehicleData.speed || 200;
        this.acceleration = vehicleData.acceleration || 7;
        this.handling = vehicleData.handling || 7;
        this.brakeForce = 0.95;
        
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
        
        // Camera POV system
        this.cameraMode = 'chase'; // 'chase' or 'fixed' (cockpit)
        this.cameraToggleCooldown = 0;
        this.cameraToggleCooldownTime = 0.3; // Prevent rapid toggling
        
        // Create 3D model
        this.body = null;
        this.createBody();
        
        console.log(`🏎️ Vehicle created: ${vehicleData.name}`);
        console.log(`🛣️ Lane system: 5 lanes, starting in center (lane ${this.currentLane})`);
        console.log(`📷 Camera mode: ${this.cameraMode} (toggle with V key)`);
    }

    createBody() {
        if (this.vehicleData.model) {
            this.body = this.vehicleData.model.clone();
            this.mesh = this.body; // Add mesh reference for collision detection
            this.body.position.copy(this.position);
            this.body.rotation.y = this.rotation;
            
            // Scale to appropriate size - larger to be more visible
            this.body.scale.set(1.0, 1.0, 1.0);
            
            this.body.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = false; // Disabled for 60fps
                    child.receiveShadow = false; // Disabled for 60fps
                }
            });
            
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
        
        // Handle acceleration
        if (controls.accelerate) {
            this.currentSpeed += this.acceleration * delta * 10;
        } else if (controls.brake) {
            this.currentSpeed -= this.acceleration * delta * 15;
        } else {
            // Natural deceleration
            this.currentSpeed *= this.brakeForce;
        }
        
        // Clamp speed
        this.currentSpeed = Math.max(0, Math.min(this.currentSpeed, this.maxSpeed));
        
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
        
        // Move car forward based on speed (car moves, obstacles also move towards it)
        this.body.position.z += this.currentSpeed * delta * 0.27778; // Convert km/h to m/s
        
        // Update position reference
        this.position.copy(this.body.position);
        
        // Update camera
        this.updateCamera();
    }

    updateCamera() {
        if (!this.camera || !this.body) return;
        
        if (this.cameraMode === 'chase') {
            // Chase camera: behind and above the car for better racing POV
            const cameraOffset = new THREE.Vector3(0, 4, -12);
            const cameraPosition = new THREE.Vector3();
            
            // Position camera relative to car
            cameraPosition.copy(this.body.position);
            cameraPosition.add(cameraOffset);
            
            // Smooth camera movement for stability
            this.camera.position.lerp(cameraPosition, 0.1);
            
            // Look slightly ahead of the car for better visibility
            const lookAtPoint = new THREE.Vector3(
                this.body.position.x,
                this.body.position.y + 1,
                this.body.position.z + 5
            );
            this.camera.lookAt(lookAtPoint);
            
        } else if (this.cameraMode === 'fixed') {
            // Fixed camera: cockpit/hood view - camera moves with the car
            const cameraOffset = new THREE.Vector3(0, 2, 2);
            const cameraPosition = new THREE.Vector3();
            
            // Position camera on the car (hood view)
            cameraPosition.copy(this.body.position);
            cameraPosition.add(cameraOffset);
            
            // Smooth camera movement
            this.camera.position.lerp(cameraPosition, 0.15);
            
            // Look far ahead for fixed camera
            const lookAtPoint = new THREE.Vector3(
                this.body.position.x,
                this.body.position.y + 1,
                this.body.position.z + 50
            );
            this.camera.lookAt(lookAtPoint);
        }
    }
    
    toggleCameraMode() {
        if (this.cameraMode === 'chase') {
            this.cameraMode = 'fixed';
            console.log('📷 Camera: Fixed (Hood View)');
        } else {
            this.cameraMode = 'chase';
            console.log('📷 Camera: Chase View');
        }
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

    getPosition() {
        return this.position.clone();
    }
}
