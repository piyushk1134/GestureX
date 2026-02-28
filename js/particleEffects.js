import * as THREE from 'three';

export class ParticleEffects {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.exhaustParticles = [];
        this.boostParticles = [];
        this.sparkParticles = [];
    }
    
    // Create exhaust smoke from car
    createExhaustSmoke(position, velocity) {
        const particleCount = 3;
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.3, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: 0x888888,
                transparent: true,
                opacity: 0.5
            });
            const particle = new THREE.Mesh(geometry, material);
            
            // Position behind the car
            particle.position.copy(position);
            particle.position.x += (Math.random() - 0.5) * 1;
            particle.position.y += 0.2;
            particle.position.z -= 2 + Math.random();
            
            // Particle properties
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    0.5 + Math.random() * 0.5,
                    -velocity * 0.3
                ),
                lifetime: 1.0,
                age: 0
            };
            
            this.scene.add(particle);
            this.exhaustParticles.push(particle);
        }
    }
    
    // Create boost trail effect
    createBoostTrail(position, isBoosting) {
        if (!isBoosting) return;
        
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.4, 6, 6);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.8,
                emissive: 0x00FFFF,
                emissiveIntensity: 0.5
            });
            const particle = new THREE.Mesh(geometry, material);
            
            // Position behind the car
            particle.position.copy(position);
            particle.position.x += (Math.random() - 0.5) * 2;
            particle.position.y += 0.3;
            particle.position.z -= 3 + Math.random() * 2;
            
            // Particle properties
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 1,
                    0.2,
                    -5
                ),
                lifetime: 0.5,
                age: 0
            };
            
            this.scene.add(particle);
            this.boostParticles.push(particle);
        }
    }
    
    // Create collision sparks
    createCollisionSparks(position) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.15, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFAA00,
                transparent: true,
                opacity: 1.0,
                emissive: 0xFFAA00,
                emissiveIntensity: 1.0
            });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.copy(position);
            particle.position.y += 1;
            
            // Random explosion direction
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 10;
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    5 + Math.random() * 5,
                    Math.sin(angle) * speed
                ),
                lifetime: 0.8,
                age: 0,
                gravity: -20
            };
            
            this.scene.add(particle);
            this.sparkParticles.push(particle);
        }
    }
    
    // Create tire smoke on lane change
    createTireSmoke(position) {
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.5, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: 0xCCCCCC,
                transparent: true,
                opacity: 0.6
            });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.copy(position);
            particle.position.y = 0.2;
            particle.position.x += (Math.random() - 0.5) * 2;
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    0.5,
                    -2
                ),
                lifetime: 1.2,
                age: 0,
                expansion: 1.5
            };
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }
    
    // Create speed lines effect
    createSpeedLines(position, speed) {
        if (speed < 150) return; // Only show at high speeds
        
        const lineCount = 3;
        
        for (let i = 0; i < lineCount; i++) {
            const geometry = new THREE.BoxGeometry(0.1, 0.1, 5);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Mesh(geometry, material);
            
            line.position.set(
                position.x + (Math.random() - 0.5) * 20,
                position.y + Math.random() * 3,
                position.z + 10 + Math.random() * 20
            );
            
            line.userData = {
                velocity: new THREE.Vector3(0, 0, -speed * 0.5),
                lifetime: 0.3,
                age: 0
            };
            
            this.scene.add(line);
            this.particles.push(line);
        }
    }
    
    // Update all particles
    update(delta) {
        // Update exhaust particles
        this.updateParticleArray(this.exhaustParticles, delta, (particle, userData) => {
            particle.position.add(userData.velocity.clone().multiplyScalar(delta));
            userData.velocity.y -= 1 * delta; // Gravity
            particle.material.opacity = 0.5 * (1 - userData.age / userData.lifetime);
        });
        
        // Update boost particles
        this.updateParticleArray(this.boostParticles, delta, (particle, userData) => {
            particle.position.add(userData.velocity.clone().multiplyScalar(delta));
            particle.material.opacity = 0.8 * (1 - userData.age / userData.lifetime);
            particle.scale.setScalar(1 + userData.age * 2);
        });
        
        // Update spark particles
        this.updateParticleArray(this.sparkParticles, delta, (particle, userData) => {
            particle.position.add(userData.velocity.clone().multiplyScalar(delta));
            if (userData.gravity) {
                userData.velocity.y += userData.gravity * delta;
            }
            particle.material.opacity = 1.0 * (1 - userData.age / userData.lifetime);
        });
        
        // Update generic particles
        this.updateParticleArray(this.particles, delta, (particle, userData) => {
            particle.position.add(userData.velocity.clone().multiplyScalar(delta));
            if (userData.expansion) {
                particle.scale.setScalar(1 + userData.age * userData.expansion);
            }
            particle.material.opacity = 0.6 * (1 - userData.age / userData.lifetime);
        });
    }
    
    updateParticleArray(array, delta, updateFn) {
        for (let i = array.length - 1; i >= 0; i--) {
            const particle = array[i];
            const userData = particle.userData;
            
            userData.age += delta;
            
            if (userData.age >= userData.lifetime) {
                this.scene.remove(particle);
                particle.geometry.dispose();
                particle.material.dispose();
                array.splice(i, 1);
            } else {
                updateFn(particle, userData);
            }
        }
    }
    
    // Cleanup all particles
    cleanup() {
        const allParticles = [
            ...this.particles,
            ...this.exhaustParticles,
            ...this.boostParticles,
            ...this.sparkParticles
        ];
        
        allParticles.forEach(particle => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        
        this.particles = [];
        this.exhaustParticles = [];
        this.boostParticles = [];
        this.sparkParticles = [];
    }
}
