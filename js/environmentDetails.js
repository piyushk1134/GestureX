/**
 * Environmental Details Enhancement
 * Adds sky, clouds, horizon effects, and ambient details to the game
 */

import * as THREE from 'three';

export class EnvironmentDetails {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        this.clouds = [];
        this.stars = [];
        this.speedLines = [];
        
        this.init();
    }
    
    init() {
        this.createSkybox();
        this.createClouds();
        this.createStars();
        this.createHorizon();
        this.createSpeedLines();
        this.createAmbientFog();
    }
    
    createSkybox() {
        // Create gradient skybox
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0x89b2eb) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }
    
    createClouds() {
        // Create fluffy clouds
        const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });
        
        for (let i = 0; i < 20; i++) {
            const cloudGroup = new THREE.Group();
            
            // Create cloud clusters
            for (let j = 0; j < 5; j++) {
                const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
                cloud.scale.set(
                    Math.random() * 2 + 1,
                    Math.random() * 0.5 + 0.5,
                    Math.random() * 2 + 1
                );
                cloud.position.set(
                    Math.random() * 4 - 2,
                    Math.random() * 2 - 1,
                    Math.random() * 4 - 2
                );
                cloudGroup.add(cloud);
            }
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 200,
                30 + Math.random() * 20,
                -50 - Math.random() * 100
            );
            
            this.clouds.push({
                mesh: cloudGroup,
                speed: Math.random() * 0.2 + 0.1,
                initialZ: cloudGroup.position.z
            });
            
            this.scene.add(cloudGroup);
        }
    }
    
    createStars() {
        // Create distant stars (visible in darker areas)
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 400;
            const y = Math.random() * 200 + 50;
            const z = (Math.random() - 0.5) * 400;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        this.stars.push(stars);
    }
    
    createHorizon() {
        // Create horizon glow effect
        const horizonGeometry = new THREE.PlaneGeometry(1000, 50);
        const horizonMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa88,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
        horizon.rotation.x = Math.PI / 2;
        horizon.position.y = 0;
        horizon.position.z = -200;
        this.scene.add(horizon);
    }
    
    createSpeedLines() {
        // Create speed lines for motion effect
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        
        for (let i = 0; i < 50; i++) {
            const positions = [];
            const x = (Math.random() - 0.5) * 40;
            const y = Math.random() * 5;
            const z = -Math.random() * 100;
            
            positions.push(x, y, z);
            positions.push(x, y, z + 5);
            
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            
            const line = new THREE.Line(geometry, lineMaterial.clone());
            line.visible = false; // Only show at high speeds
            
            this.speedLines.push({
                mesh: line,
                baseZ: z,
                speed: Math.random() * 2 + 1
            });
            
            this.scene.add(line);
        }
    }
    
    createAmbientFog() {
        // Add atmospheric fog
        this.scene.fog = new THREE.Fog(0x89b2eb, 50, 300);
    }
    
    update(speed, deltaTime) {
        // Update clouds - move them forward
        this.clouds.forEach(cloud => {
            cloud.mesh.position.z += speed * cloud.speed * deltaTime;
            
            // Reset cloud position when it passes the camera
            if (cloud.mesh.position.z > 50) {
                cloud.mesh.position.z = cloud.initialZ;
            }
        });
        
        // Update speed lines based on speed
        const speedThreshold = 30;
        const showSpeedLines = speed > speedThreshold;
        
        this.speedLines.forEach(line => {
            line.mesh.visible = showSpeedLines;
            
            if (showSpeedLines) {
                const speedFactor = (speed - speedThreshold) / 50;
                line.mesh.material.opacity = Math.min(0.5, speedFactor * 0.5);
                
                // Move lines
                const positions = line.mesh.geometry.attributes.position.array;
                positions[2] += speed * line.speed * deltaTime;
                positions[5] += speed * line.speed * deltaTime;
                
                // Reset when behind camera
                if (positions[2] > 20) {
                    positions[2] = line.baseZ;
                    positions[5] = line.baseZ + 5;
                }
                
                line.mesh.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
    
    dispose() {
        // Clean up resources
        this.clouds.forEach(cloud => {
            cloud.mesh.children.forEach(child => {
                child.geometry.dispose();
                child.material.dispose();
            });
            this.scene.remove(cloud.mesh);
        });
        
        this.speedLines.forEach(line => {
            line.mesh.geometry.dispose();
            line.mesh.material.dispose();
            this.scene.remove(line.mesh);
        });
        
        this.stars.forEach(star => {
            star.geometry.dispose();
            star.material.dispose();
            this.scene.remove(star);
        });
    }
}
