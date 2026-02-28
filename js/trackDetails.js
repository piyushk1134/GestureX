/**
 * Track Details Enhancement
 * Adds detailed road surface, lane markings, roadside objects, and track variations
 */

import * as THREE from 'three';

export class TrackDetails {
    constructor(scene) {
        this.scene = scene;
        
        this.roadSegments = [];
        this.laneMarkings = [];
        this.roadsideObjects = [];
        
        this.init();
    }
    
    init() {
        this.createDetailedRoad();
        this.createLaneMarkings();
        this.createRoadsideObjects();
        this.createRoadBorders();
    }
    
    createDetailedRoad() {
        // Create road with detailed texture
        const roadTexture = this.createAsphaltTexture();
        
        const roadWidth = 20;
        const roadLength = 100;
        const segments = 20;
        
        for (let i = 0; i < segments; i++) {
            const geometry = new THREE.PlaneGeometry(roadWidth, roadLength / segments);
            const material = new THREE.MeshStandardMaterial({
                map: roadTexture,
                roughness: 0.9,
                metalness: 0.1,
                color: 0x333333
            });
            
            const road = new THREE.Mesh(geometry, material);
            road.rotation.x = -Math.PI / 2;
            road.position.z = -i * (roadLength / segments) - 50;
            road.receiveShadow = true;
            
            this.roadSegments.push({
                mesh: road,
                initialZ: road.position.z
            });
            
            this.scene.add(road);
        }
    }
    
    createAsphaltTexture() {
        // Create procedural asphalt texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add noise for asphalt texture
        const imageData = ctx.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 30 - 15;
            data[i] += noise;     // R
            data[i + 1] += noise; // G
            data[i + 2] += noise; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add some cracks
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 512);
            ctx.lineTo(Math.random() * 512, Math.random() * 512);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 20);
        
        return texture;
    }
    
    createLaneMarkings() {
        // Create dashed lane markings
        const markingGeometry = new THREE.PlaneGeometry(0.3, 3);
        const markingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        
        // Center lane markings
        for (let i = 0; i < 40; i++) {
            const marking = new THREE.Mesh(markingGeometry, markingMaterial);
            marking.rotation.x = -Math.PI / 2;
            marking.position.set(0, 0.02, -i * 10);
            
            this.laneMarkings.push({
                mesh: marking,
                initialZ: marking.position.z
            });
            
            this.scene.add(marking);
        }
        
        // Side lane markings (solid lines)
        const sideMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide
        });
        
        [-8, 8].forEach(xPos => {
            for (let i = 0; i < 20; i++) {
                const sideGeometry = new THREE.PlaneGeometry(0.2, 10);
                const sideLine = new THREE.Mesh(sideGeometry, sideMaterial);
                sideLine.rotation.x = -Math.PI / 2;
                sideLine.position.set(xPos, 0.02, -i * 10 - 50);
                
                this.laneMarkings.push({
                    mesh: sideLine,
                    initialZ: sideLine.position.z
                });
                
                this.scene.add(sideLine);
            }
        });
    }
    
    createRoadsideObjects() {
        // Create roadside details (barriers, lights, signs)
        this.createBarriers();
        this.createStreetLights();
        this.createDistanceSigns();
        this.createRoadReflectors();
    }
    
    createBarriers() {
        // Create safety barriers on sides
        const barrierGeometry = new THREE.BoxGeometry(0.3, 1.5, 5);
        const barrierMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            roughness: 0.7,
            metalness: 0.3
        });
        
        [-12, 12].forEach(xPos => {
            for (let i = 0; i < 30; i++) {
                if (Math.random() > 0.3) { // Sparse placement
                    const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
                    barrier.position.set(xPos, 0.75, -i * 15 - 20);
                    barrier.castShadow = true;
                    
                    // Add reflective stripe
                    const stripeGeometry = new THREE.BoxGeometry(0.31, 0.3, 5);
                    const stripeMaterial = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        emissive: 0xffffff,
                        emissiveIntensity: 0.5
                    });
                    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                    stripe.position.y = 0.4;
                    barrier.add(stripe);
                    
                    this.roadsideObjects.push({
                        mesh: barrier,
                        initialZ: barrier.position.z
                    });
                    
                    this.scene.add(barrier);
                }
            }
        });
    }
    
    createStreetLights() {
        // Create street lights
        const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.5
        });
        
        [-15, 15].forEach(xPos => {
            for (let i = 0; i < 15; i++) {
                const pole = new THREE.Mesh(poleGeometry, poleMaterial);
                pole.position.set(xPos, 3, -i * 30 - 10);
                pole.castShadow = true;
                
                // Add light fixture
                const lightGeometry = new THREE.SphereGeometry(0.5);
                const lightMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffdd88,
                    emissive: 0xffdd88,
                    emissiveIntensity: 1
                });
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.position.y = 3;
                pole.add(light);
                
                // Add point light
                const pointLight = new THREE.PointLight(0xffdd88, 0.5, 20);
                pointLight.position.y = 3;
                pole.add(pointLight);
                
                this.roadsideObjects.push({
                    mesh: pole,
                    initialZ: pole.position.z
                });
                
                this.scene.add(pole);
            }
        });
    }
    
    createDistanceSigns() {
        // Create distance marker signs
        const signGeometry = new THREE.PlaneGeometry(2, 1);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
        });
        
        for (let i = 0; i < 20; i++) {
            const sign = new THREE.Mesh(signGeometry, signMaterial);
            sign.position.set(-10, 2, -i * 50 - 25);
            sign.rotation.y = Math.PI / 6;
            
            this.roadsideObjects.push({
                mesh: sign,
                initialZ: sign.position.z
            });
            
            this.scene.add(sign);
        }
    }
    
    createRoadReflectors() {
        // Create small road reflectors
        const reflectorGeometry = new THREE.SphereGeometry(0.1);
        const reflectorMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            emissive: 0xff6600,
            emissiveIntensity: 0.8
        });
        
        [-9, 9].forEach(xPos => {
            for (let i = 0; i < 100; i++) {
                const reflector = new THREE.Mesh(reflectorGeometry, reflectorMaterial);
                reflector.position.set(xPos, 0.1, -i * 5);
                
                this.roadsideObjects.push({
                    mesh: reflector,
                    initialZ: reflector.position.z
                });
                
                this.scene.add(reflector);
            }
        });
    }
    
    createRoadBorders() {
        // Create grass/dirt borders
        const borderGeometry = new THREE.PlaneGeometry(10, 500);
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 1
        });
        
        [-15, 15].forEach(xPos => {
            const border = new THREE.Mesh(borderGeometry, borderMaterial);
            border.rotation.x = -Math.PI / 2;
            border.position.set(xPos, -0.1, -250);
            border.receiveShadow = true;
            this.scene.add(border);
        });
    }
    
    update(speed, deltaTime) {
        // Update road segments position
        this.roadSegments.forEach(segment => {
            segment.mesh.position.z += speed * deltaTime;
            
            if (segment.mesh.position.z > 50) {
                segment.mesh.position.z = segment.initialZ;
            }
        });
        
        // Update lane markings
        this.laneMarkings.forEach(marking => {
            marking.mesh.position.z += speed * deltaTime;
            
            if (marking.mesh.position.z > 20) {
                marking.mesh.position.z = marking.initialZ;
            }
        });
        
        // Update roadside objects
        this.roadsideObjects.forEach(obj => {
            obj.mesh.position.z += speed * deltaTime;
            
            if (obj.mesh.position.z > 50) {
                obj.mesh.position.z = obj.initialZ;
            }
        });
    }
    
    dispose() {
        // Clean up resources
        [...this.roadSegments, ...this.laneMarkings, ...this.roadsideObjects].forEach(item => {
            if (item.mesh.geometry) item.mesh.geometry.dispose();
            if (item.mesh.material) {
                if (Array.isArray(item.mesh.material)) {
                    item.mesh.material.forEach(mat => mat.dispose());
                } else {
                    item.mesh.material.dispose();
                }
            }
            this.scene.remove(item.mesh);
        });
    }
}
