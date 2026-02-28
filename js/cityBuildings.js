/**
 * City Buildings with Windows
 * Adds buildings with illuminated windows along the racing track
 */

import * as THREE from 'three';

export class CityBuildings {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        
        this.buildingTypes = [
            { width: 8, depth: 8, minHeight: 10, maxHeight: 25, rows: 12, cols: 5 },
            { width: 12, depth: 10, minHeight: 15, maxHeight: 35, rows: 18, cols: 7 },
            { width: 6, depth: 6, minHeight: 8, maxHeight: 20, rows: 10, cols: 4 },
            { width: 10, depth: 12, minHeight: 12, maxHeight: 30, rows: 15, cols: 8 }
        ];
        
        this.init();
    }
    
    init() {
        console.log('🏙️ CityBuildings.init() starting...');
        this.createCityscape();
        console.log('✅ CityBuildings initialized with', this.buildings.length, 'buildings');
    }
    
    createCityscape() {
        // Create buildings on both sides of the road
        const roadWidth = 17.5; // Actual 5-lane road width (5 * 3.5m)
        const buildingDistance = 6; // Distance from road edge (closer to be visible in camera FOV)
        const buildingSpacing = 15; // Space between buildings
        const numberOfBuildings = 30; // Buildings per side
        
        // Left side buildings
        for (let i = 0; i < numberOfBuildings; i++) {
            const buildingType = this.buildingTypes[Math.floor(Math.random() * this.buildingTypes.length)];
            const height = THREE.MathUtils.randFloat(buildingType.minHeight, buildingType.maxHeight);
            
            const building = this.createBuilding(
                buildingType.width,
                height,
                buildingType.depth,
                buildingType.rows,
                buildingType.cols
            );
            
            building.position.set(
                -(roadWidth / 2 + buildingDistance + Math.random() * 3),
                height / 2,  // Raise group so mesh bottom sits on ground
                -i * buildingSpacing - Math.random() * 10
            );
            
            this.buildings.push({
                mesh: building,
                initialZ: building.position.z
            });
            
            this.scene.add(building);
            
            // Debug: Log first building position
            if (i === 0) {
                console.log('🏢 First left building at:', building.position.x, building.position.y, building.position.z);
            }
        }
        
        // Right side buildings
        for (let i = 0; i < numberOfBuildings; i++) {
            const buildingType = this.buildingTypes[Math.floor(Math.random() * this.buildingTypes.length)];
            const height = THREE.MathUtils.randFloat(buildingType.minHeight, buildingType.maxHeight);
            
            const building = this.createBuilding(
                buildingType.width,
                height,
                buildingType.depth,
                buildingType.rows,
                buildingType.cols
            );
            
            building.position.set(
                (roadWidth / 2 + buildingDistance + Math.random() * 3),
                height / 2,  // Raise group so mesh bottom sits on ground
                -i * buildingSpacing - Math.random() * 10
            );
            
            this.buildings.push({
                mesh: building,
                initialZ: building.position.z
            });
            
            this.scene.add(building);
            
            // Debug: Log first building position
            if (i === 0) {
                console.log('🏢 First right building at:', building.position.x, building.position.y, building.position.z);
            }
        }
        
        console.log('🏙️ Created', this.buildings.length, 'total buildings on both sides');
    }
    
    createBuilding(width, height, depth, windowRows, windowCols) {
        const building = new THREE.Group();
        
        // Main building structure
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: this.getRandomBuildingColor(),
            roughness: 0.8,
            metalness: 0.2
        });
        
        const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
        buildingMesh.castShadow = true;
        buildingMesh.receiveShadow = true;
        // Keep mesh centered at origin - group will be positioned at height/2
        building.add(buildingMesh);
        
        // Add windows to all four sides
        this.addWindows(building, width, height, depth, windowRows, windowCols);
        
        // Add roof details
        this.addRoofDetails(building, width, height, depth);
        
        return building;
    }
    
    addWindows(building, width, height, depth, rows, cols) {
        const windowWidth = (width * 0.8) / cols;
        const windowPadding = 0.5; // Padding between windows
        const windowHeight = 2.0; // Fixed window height
        
        // Calculate rows dynamically by dividing building's Y-size by (window height + padding)
        const calculatedRows = Math.floor(height / (windowHeight + windowPadding));
        const actualRows = calculatedRows > 0 ? calculatedRows : 1;
        
        const windowDepth = 0.2;
        
        // Create window texture
        const windowTexture = this.createWindowTexture();
        
        let totalWindows = 0;
        
        // Front face (facing the road)
        const frontCount = this.createWindowFace(
            building,
            width, height, depth,
            actualRows, cols,
            windowWidth, windowHeight, windowDepth,
            windowTexture,
            'front'
        );
        totalWindows += frontCount;
        
        // Back face
        const backCount = this.createWindowFace(
            building,
            width, height, depth,
            actualRows, cols,
            windowWidth, windowHeight, windowDepth,
            windowTexture,
            'back'
        );
        totalWindows += backCount;
        
        // Left side
        const leftCols = Math.floor(cols * (depth / width));
        const leftCount = this.createWindowFace(
            building,
            width, height, depth,
            actualRows, leftCols,
            windowWidth, windowHeight, windowDepth,
            windowTexture,
            'left'
        );
        totalWindows += leftCount;
        
        // Right side
        const rightCols = Math.floor(cols * (depth / width));
        const rightCount = this.createWindowFace(
            building,
            width, height, depth,
            actualRows, rightCols,
            windowWidth, windowHeight, windowDepth,
            windowTexture,
            'right'
        );
        totalWindows += rightCount;
        
        if (this.buildings.length === 0) {
            console.log(`🪟 First building (height=${height.toFixed(1)}m): ${totalWindows} windows created`);
            console.log(`   ${actualRows} rows spanning full building height (${windowHeight}m windows + ${windowPadding}m padding)`);
            console.log(`   Group Y position: ${height/2}, Building mesh height: ${height}`);
            console.log(`   Windows from Y=${(-height/2 + windowHeight/2).toFixed(1)} to Y=${(height/2 - windowHeight/2).toFixed(1)}`);
            console.log(`   In world space: ${(-height/2 + windowHeight/2 + height/2).toFixed(1)} to ${(height/2 - windowHeight/2 + height/2).toFixed(1)}`);
        }
    }
    
    createWindowFace(building, width, height, depth, rows, cols, windowWidth, windowHeight, windowDepth, texture, face) {
        const windowGroup = new THREE.Group();
        let windowCount = 0;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Random window colors for variety
                const windowTypes = [
                    { lit: true, color: 0xffff99, emissive: 0xffff66, intensity: 0.8 },  // Warm yellow
                    { lit: true, color: 0xffffff, emissive: 0xffffcc, intensity: 0.9 },  // Bright white
                    { lit: true, color: 0xffcc99, emissive: 0xff9933, intensity: 0.7 },  // Orange
                    { lit: false, color: 0x1a1a2e, emissive: 0x000000, intensity: 0 }     // Dark
                ];
                
                // 75% chance of lit window
                const typeIndex = Math.random() > 0.25 ? Math.floor(Math.random() * 3) : 3;
                const windowType = windowTypes[typeIndex];
                
                // Create window frame (dark border)
                const frameGeometry = new THREE.PlaneGeometry(windowWidth * 0.9, windowHeight * 0.9);
                const frameMaterial = new THREE.MeshBasicMaterial({
                    color: 0x0a0a0a,
                    side: THREE.DoubleSide
                });
                const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                
                // Create window glass (smaller, inset)
                const glassGeometry = new THREE.PlaneGeometry(windowWidth * 0.75, windowHeight * 0.75);
                const glassMaterial = new THREE.MeshBasicMaterial({
                    color: windowType.color,
                    emissive: windowType.emissive,
                    emissiveIntensity: windowType.intensity,
                    side: THREE.DoubleSide
                });
                const glass = new THREE.Mesh(glassGeometry, glassMaterial);
                glass.position.z = 0.05; // Slightly in front of frame
                
                // Combine frame and glass
                const window = new THREE.Group();
                window.add(frame);
                window.add(glass);
                
                // Position windows based on face
                const startX = -width / 2 + width * 0.1 + windowWidth / 2;
                // Building mesh is centered in group (-height/2 to +height/2)
                // Group is raised by height/2 so mesh bottom = ground level in world
                // Windows span from -height/2 (bottom) to +height/2 (top) in local space
                const startY = -height / 2 + windowHeight / 2;
                const endY = height / 2 - windowHeight / 2;
                const spacing = rows > 1 ? (endY - startY) / (rows - 1) : 0;
                
                switch (face) {
                    case 'front':
                        window.position.set(
                            startX + col * windowWidth,
                            startY + row * spacing,
                            depth / 2 + windowDepth
                        );
                        break;
                    case 'back':
                        window.position.set(
                            startX + col * windowWidth,
                            startY + row * spacing,
                            -depth / 2 - windowDepth
                        );
                        window.rotation.y = Math.PI;
                        break;
                    case 'left':
                        window.position.set(
                            -width / 2 - windowDepth,
                            startY + row * spacing,
                            -depth / 2 + depth * 0.1 + (windowWidth * depth / width) * col
                        );
                        window.rotation.y = -Math.PI / 2;
                        break;
                    case 'right':
                        window.position.set(
                            width / 2 + windowDepth,
                            startY + row * spacing,
                            -depth / 2 + depth * 0.1 + (windowWidth * depth / width) * col
                        );
                        window.rotation.y = Math.PI / 2;
                        break;
                }
                
                // Add point light for lit windows
                if (windowType.lit && Math.random() > 0.6) {
                    const glowLight = new THREE.PointLight(windowType.emissive, 0.5, 8);
                    glowLight.position.copy(window.position);
                    windowGroup.add(glowLight);
                }
                
                windowGroup.add(window);
                windowCount++;
            }
        }
        
        building.add(windowGroup);
        return windowCount;
    }
    
    createWindowTexture() {
        // Create a simple window texture
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Window frame
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 64, 64);
        
        // Window panes
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(2, 2, 28, 28);
        ctx.fillRect(34, 2, 28, 28);
        ctx.fillRect(2, 34, 28, 28);
        ctx.fillRect(34, 34, 28, 28);
        
        // Cross divider
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(30, 0, 4, 64);
        ctx.fillRect(0, 30, 64, 4);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    addRoofDetails(building, width, height, depth) {
        // Add antenna or roof details on some buildings
        if (Math.random() > 0.6) {
            const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5);
            const antennaMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.5
            });
            
            const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            // Building mesh centered, so top is at +height/2
            antenna.position.y = height / 2 + 2.5;
            
            // Add blinking light on top
            const lightGeometry = new THREE.SphereGeometry(0.3);
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                emissive: 0xff0000
            });
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.y = 2.5;
            antenna.add(light);
            
            building.add(antenna);
        }
        
        // Add rooftop AC units or structures
        if (Math.random() > 0.5) {
            const acGeometry = new THREE.BoxGeometry(2, 1, 1.5);
            const acMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                roughness: 0.9,
                metalness: 0.3
            });
            
            const numUnits = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numUnits; i++) {
                const ac = new THREE.Mesh(acGeometry, acMaterial);
                ac.position.set(
                    (Math.random() - 0.5) * width * 0.6,
                    height / 2 + 0.5,  // On top of centered building mesh
                    (Math.random() - 0.5) * depth * 0.6
                );
                building.add(ac);
            }
        }
    }
    
    getRandomBuildingColor() {
        const colors = [
            0x2a2a3a, // Dark blue-gray (modern)
            0x3a3a3a, // Charcoal
            0x2d3436, // Dark steel
            0x34495e, // Modern blue-gray
            0x2c3e50, // Deep blue
            0x1a1a2e  // Almost black
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(speed, deltaTime) {
        // Move buildings along with game speed
        this.buildings.forEach(building => {
            building.mesh.position.z += speed * deltaTime;
            
            // Reset building position when it passes the camera
            if (building.mesh.position.z > 100) {
                building.mesh.position.z = building.initialZ - this.buildings.length * 15;
            }
        });
        
        // Animate blinking lights on antennas
        this.buildings.forEach(building => {
            building.mesh.children.forEach(child => {
                if (child.type === 'Mesh' && child.geometry.type === 'CylinderGeometry') {
                    // This is an antenna
                    child.children.forEach(light => {
                        if (light.type === 'Mesh' && light.geometry.type === 'SphereGeometry') {
                            // Blink effect
                            const time = Date.now() * 0.001;
                            light.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.5;
                        }
                    });
                }
            });
        });
    }
    
    dispose() {
        // Clean up all buildings and their materials
        this.buildings.forEach(building => {
            building.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => {
                            if (mat.map) mat.map.dispose();
                            mat.dispose();
                        });
                    } else {
                        if (child.material.map) child.material.map.dispose();
                        child.material.dispose();
                    }
                }
            });
            this.scene.remove(building.mesh);
        });
        
        this.buildings = [];
    }
}
