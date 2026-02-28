/**
 * Enhanced Particle Effects
 * Adds drift smoke, engine exhaust, boost flames, and collision sparks
 */

import * as THREE from 'three';

export class EnhancedParticles {
    constructor(scene) {
        this.scene = scene;
        
        this.driftParticles = [];
        this.exhaustParticles = [];
        this.boostParticles = [];
        this.collisionSparks = [];
        
        this.init();
    }
    
    init() {
        this.createDriftSmoke();
        this.createExhaustSystem();
        this.createBoostFlames();
    }
    
    createDriftSmoke() {
        // Create tire smoke particles for drifting
        const smokeTexture = this.createSmokeTexture();
        
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.MeshBasicMaterial({
                map: smokeTexture,
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            
            const smoke = new THREE.Mesh(geometry, material);
            smoke.rotation.x = -Math.PI / 2;
            smoke.visible = false;
            
            this.driftParticles.push({
                mesh: smoke,
                life: 0,
                velocity: new THREE.Vector3(),
                active: false
            });
            
            this.scene.add(smoke);
        }
    }
    
    createExhaustSystem() {
        // Create exhaust smoke particles
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.SphereGeometry(0.3, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0x888888,
                transparent: true,
                opacity: 0,
                depthWrite: false
            });
            
            const exhaust = new THREE.Mesh(geometry, material);
            exhaust.visible = false;
            
            this.exhaustParticles.push({
                mesh: exhaust,
                life: 0,
                velocity: new THREE.Vector3(),
                active: false
            });
            
            this.scene.add(exhaust);
        }
    }
    
    createBoostFlames() {
        // Create boost flame particles
        for (let i = 0; i < 40; i++) {
            const geometry = new THREE.PlaneGeometry(1.5, 1.5);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1, 0.5 + Math.random() * 0.5, 0),
                transparent: true,
                opacity: 0,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            
            const flame = new THREE.Mesh(geometry, material);
            flame.visible = false;
            
            this.boostParticles.push({
                mesh: flame,
                life: 0,
                velocity: new THREE.Vector3(),
                active: false,
                color: material.color.clone()
            });
            
            this.scene.add(flame);
        }
    }
    
    createSmokeTexture() {
        // Create a simple smoke texture using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.5)');
        gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    emitDriftSmoke(position, intensity = 1) {
        // Emit drift smoke when turning
        const particle = this.driftParticles.find(p => !p.active);
        if (!particle) return;
        
        particle.active = true;
        particle.mesh.visible = true;
        particle.mesh.position.copy(position);
        particle.mesh.position.y = 0.2;
        particle.life = 1.0;
        
        particle.velocity.set(
            (Math.random() - 0.5) * 2,
            0,
            (Math.random() - 0.5) * 2
        );
        
        particle.mesh.material.opacity = 0.6 * intensity;
        particle.mesh.scale.set(1, 1, 1);
    }
    
    emitExhaust(position, speed) {
        // Emit exhaust smoke
        if (Math.random() > 0.3) return; // Don't emit every frame
        
        const particle = this.exhaustParticles.find(p => !p.active);
        if (!particle) return;
        
        particle.active = true;
        particle.mesh.visible = true;
        particle.mesh.position.copy(position);
        particle.mesh.position.y += 0.5;
        particle.life = 1.0;
        
        particle.velocity.set(
            (Math.random() - 0.5) * 0.5,
            Math.random() * 0.5 + 0.5,
            -speed * 0.1
        );
        
        particle.mesh.material.opacity = 0.4;
    }
    
    emitBoost(position) {
        // Emit boost flame particles
        for (let i = 0; i < 2; i++) {
            const particle = this.boostParticles.find(p => !p.active);
            if (!particle) continue;
            
            particle.active = true;
            particle.mesh.visible = true;
            particle.mesh.position.copy(position);
            particle.mesh.position.y += 0.5 + Math.random() * 0.5;
            particle.mesh.position.x += (Math.random() - 0.5) * 1;
            particle.life = 1.0;
            
            particle.velocity.set(
                (Math.random() - 0.5) * 2,
                Math.random() * 1,
                -5 - Math.random() * 5
            );
            
            particle.mesh.material.opacity = 0.8;
            particle.mesh.scale.set(1, 1, 1);
        }
    }
    
    emitCollisionSparks(position) {
        // Create sparks on collision
        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 4, 4);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(1, 0.8, 0),
                transparent: true,
                opacity: 1
            });
            
            const spark = new THREE.Mesh(geometry, material);
            spark.position.copy(position);
            spark.position.y += 1;
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 10,
                (Math.random() - 0.5) * 10
            );
            
            this.collisionSparks.push({
                mesh: spark,
                velocity: velocity,
                life: 1.0
            });
            
            this.scene.add(spark);
        }
    }
    
    update(deltaTime) {
        // Update drift smoke
        this.driftParticles.forEach(particle => {
            if (!particle.active) return;
            
            particle.life -= deltaTime * 2;
            
            if (particle.life <= 0) {
                particle.active = false;
                particle.mesh.visible = false;
                return;
            }
            
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.mesh.material.opacity = particle.life * 0.6;
            particle.mesh.scale.multiplyScalar(1 + deltaTime);
            particle.mesh.rotation.z += deltaTime;
        });
        
        // Update exhaust
        this.exhaustParticles.forEach(particle => {
            if (!particle.active) return;
            
            particle.life -= deltaTime * 1.5;
            
            if (particle.life <= 0) {
                particle.active = false;
                particle.mesh.visible = false;
                return;
            }
            
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.mesh.material.opacity = particle.life * 0.4;
            particle.mesh.scale.multiplyScalar(1 + deltaTime * 0.5);
        });
        
        // Update boost flames
        this.boostParticles.forEach(particle => {
            if (!particle.active) return;
            
            particle.life -= deltaTime * 3;
            
            if (particle.life <= 0) {
                particle.active = false;
                particle.mesh.visible = false;
                return;
            }
            
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
            particle.mesh.material.opacity = particle.life * 0.8;
            
            // Flicker effect
            const flicker = 0.8 + Math.random() * 0.4;
            particle.mesh.material.color.copy(particle.color).multiplyScalar(flicker);
            
            particle.mesh.lookAt(this.scene.position);
        });
        
        // Update collision sparks
        this.collisionSparks = this.collisionSparks.filter(spark => {
            spark.life -= deltaTime * 2;
            
            if (spark.life <= 0) {
                this.scene.remove(spark.mesh);
                spark.mesh.geometry.dispose();
                spark.mesh.material.dispose();
                return false;
            }
            
            spark.velocity.y -= 20 * deltaTime; // Gravity
            spark.mesh.position.add(spark.velocity.clone().multiplyScalar(deltaTime));
            spark.mesh.material.opacity = spark.life;
            
            return true;
        });
    }
    
    dispose() {
        // Clean up all particles
        [...this.driftParticles, ...this.exhaustParticles, ...this.boostParticles].forEach(particle => {
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
            this.scene.remove(particle.mesh);
        });
        
        this.collisionSparks.forEach(spark => {
            spark.mesh.geometry.dispose();
            spark.mesh.material.dispose();
            this.scene.remove(spark.mesh);
        });
    }
}
