import * as THREE from 'three';

export class ObstacleManager {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.obstacles = [];
        this.barriers = [];
        this.spawnTimer = 0;
        this.spawnInterval = 2.0; // Faster spawn rate
        this.difficulty = 1.0;
        this.obstacleSpeed = 80; // Increased from 30 to 80 for faster movement
        this.trafficCarModel = null;
        
        this.createBarriers();
        console.log('🚧 Obstacle Manager initialized');
    }
    
    createBarriers() {
        const trackWidth = 17.5;
        const barrierGeometry = new THREE.BoxGeometry(1, 2, 2000); // 2km length per section
        const barrierMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xe74c3c,
            emissive: 0xe74c3c,
            emissiveIntensity: 0.2
        });
        
        // Create TWO sections for each barrier (like the track) for seamless looping
        
        // LEFT BARRIERS
        // Section 1: 0 to 2000m
        const leftBarrier1 = new THREE.Mesh(barrierGeometry, barrierMaterial);
        leftBarrier1.position.set(-trackWidth/2 - 1, 1, 0);
        leftBarrier1.userData.isBarrier = true;
        this.scene.add(leftBarrier1);
        this.barriers.push(leftBarrier1);
        
        // Section 2: 2000 to 4000m
        const leftBarrier2 = new THREE.Mesh(barrierGeometry, barrierMaterial);
        leftBarrier2.position.set(-trackWidth/2 - 1, 1, 2000);
        leftBarrier2.userData.isBarrier = true;
        this.scene.add(leftBarrier2);
        this.barriers.push(leftBarrier2);
        
        // RIGHT BARRIERS
        // Section 1: 0 to 2000m
        const rightBarrier1 = new THREE.Mesh(barrierGeometry, barrierMaterial);
        rightBarrier1.position.set(trackWidth/2 + 1, 1, 0);
        rightBarrier1.userData.isBarrier = true;
        this.scene.add(rightBarrier1);
        this.barriers.push(rightBarrier1);
        
        // Section 2: 2000 to 4000m
        const rightBarrier2 = new THREE.Mesh(barrierGeometry, barrierMaterial);
        rightBarrier2.position.set(trackWidth/2 + 1, 1, 2000);
        rightBarrier2.userData.isBarrier = true;
        this.scene.add(rightBarrier2);
        this.barriers.push(rightBarrier2);
        
        console.log('✅ Created dual-section barriers (4 total: 2 left, 2 right, seamless looping)');
    }
    
    setTrafficCarModel(model) {
        this.trafficCarModel = model;
        console.log('🚗 McLaren 765LT loaded');
    }
    
    update(delta, playerPosition) {
        // Smooth delta clamping to prevent stuttering
        const clampedDelta = Math.min(delta, 0.1);
        const moveSpeed = this.obstacleSpeed * this.difficulty * clampedDelta;
        
        // Update obstacles with smooth interpolation
        for (let obstacle of this.obstacles) {
            // Store previous position for interpolation
            if (!obstacle.previousZ) {
                obstacle.previousZ = obstacle.position.z;
            }
            
            // Update position
            obstacle.previousZ = obstacle.position.z;
            obstacle.position.z -= moveSpeed;
            
            // Apply position to mesh with smoothing
            if (obstacle.mesh) {
                // Smooth interpolation for better visual quality
                const lerpFactor = 0.3; // Adjust for smoothness (lower = smoother, higher = more responsive)
                const targetZ = obstacle.position.z;
                const currentZ = obstacle.mesh.position.z;
                obstacle.mesh.position.z = currentZ + (targetZ - currentZ) * lerpFactor;
            }
        }
        
        // Update spawn timer
        this.spawnTimer += clampedDelta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnRandomObstacle(playerPosition);
            this.spawnTimer = 0;
        }
        
        // Remove obstacles that are behind player with smooth cleanup
        this.obstacles = this.obstacles.filter(obstacle => {
            const distance = playerPosition.z - obstacle.position.z;
            if (distance > 50) {
                if (obstacle.mesh) {
                    this.scene.remove(obstacle.mesh);
                    // Dispose geometry and materials for memory management
                    if (obstacle.mesh.geometry) obstacle.mesh.geometry.dispose();
                    if (obstacle.mesh.material) {
                        if (Array.isArray(obstacle.mesh.material)) {
                            obstacle.mesh.material.forEach(mat => mat.dispose());
                        } else {
                            obstacle.mesh.material.dispose();
                        }
                    }
                }
                return false;
            }
            return true;
        });
    }
    
    spawnRandomObstacle(playerPosition) {
        const rand = Math.random();
        let type;
        if (rand < 0.7) type = 'traffic';
        else if (rand < 0.85) type = 'pothole';
        else type = 'rock';
        
        const lanes = [-7.0, -3.5, 0.0, 3.5, 7.0];
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        const spawnZ = playerPosition.z + 150;
        
        switch(type) {
            case 'pothole': this.spawnPothole(lane, spawnZ); break;
            case 'rock': this.spawnRock(lane, spawnZ); break;
            case 'traffic': this.spawnTraffic(lane, spawnZ); break;
        }
    }
    
    spawnPothole(x, z) {
        // Lane width is 3.5m, so pothole should be max 1.2m radius (2.4m diameter)
        const geometry = new THREE.CircleGeometry(1.2, 12); // Reduced from 16 to 12 segments
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 }); // MeshBasicMaterial for performance
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.15, z);
        this.scene.add(mesh);
        
        this.obstacles.push({ type: 'pothole', mesh: mesh, position: mesh.position, radius: 1.3 });
    }
    
    spawnRock(x, z) {
        // Lane width is 3.5m, rock should be max 0.9m radius (1.8m size)
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // Use simple box instead of dodecahedron for performance
        const material = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Lambert is cheaper than Standard
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0.9, z);
        mesh.rotation.set(0.5, 0.5, 0.5); // Slight rotation for variety
        mesh.castShadow = false; // Disabled for 60fps
        this.scene.add(mesh);
        
        this.obstacles.push({ type: 'rock', mesh: mesh, position: mesh.position, radius: 1.0 });
    }
    
    spawnTraffic(x, z) {
        let carMesh;
        
        if (this.trafficCarModel) {
            carMesh = this.trafficCarModel.clone();
            carMesh.scale.set(1.2, 1.2, 1.2); // Larger scale to properly fill lane
        } else {
            // Lane width is 3.5m, car should be max 2.5m wide
            carMesh = new THREE.Group();
            const bodyGeometry = new THREE.BoxGeometry(2.5, 1.5, 4.5);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.75;
            carMesh.add(body);
            
            const roofGeometry = new THREE.BoxGeometry(2.0, 1, 3);
            const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
            roof.position.y = 1.75;
            carMesh.add(roof);
        }
        
        carMesh.position.set(x, 0.5, z);
        carMesh.rotation.y = Math.PI;
        this.scene.add(carMesh);
        
        // Collision radius should be 1.5m (3m diameter) to fit in 3.5m lane
        this.obstacles.push({ type: 'traffic', mesh: carMesh, position: carMesh.position, radius: 1.5 });
    }
    
    checkCollision(playerPos, playerRadius) {
        const trackWidth = 17.5;
        const barrierX = trackWidth / 2 + 1;
        
        if (Math.abs(playerPos.x) > barrierX - playerRadius) {
            return { type: 'barrier', obstacle: null };
        }
        
        for (let obstacle of this.obstacles) {
            const dx = playerPos.x - obstacle.position.x;
            const dz = playerPos.z - obstacle.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < playerRadius + obstacle.radius) {
                return { type: obstacle.type, obstacle: obstacle };
            }
        }
        
        return null;
    }
    
    removeObstacle(obstacle) {
        const index = this.obstacles.indexOf(obstacle);
        if (index > -1) {
            this.scene.remove(obstacle.mesh);
            this.obstacles.splice(index, 1);
        }
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.spawnInterval = Math.max(0.5, 2.0 / difficulty); // Faster spawn with difficulty
        this.obstacleSpeed = 80 + (difficulty * 20); // Speed increases with difficulty
    }
    
    reset() {
        for (let obstacle of this.obstacles) {
            this.scene.remove(obstacle.mesh);
        }
        this.obstacles = [];
        this.spawnTimer = 0;
        this.difficulty = 1.0;
        this.spawnInterval = 2.0;
        this.obstacleSpeed = 80;
    }
    
    cleanup() {
        this.reset();
        for (let barrier of this.barriers) {
            this.scene.remove(barrier);
        }
        this.barriers = [];
    }
}
