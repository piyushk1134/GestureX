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
        console.log('  Keyboard: W/↑ - Accelerate | S/↓ - Brake');
        console.log('           D/→ - Turn Left  | A/← - Turn Right');
        console.log('  Gestures: 🖐️ Open Hand | ✊ Fist | 👈👉 Point');
        console.log('  Touch:    📱 On-screen buttons & swipes');
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
        // Initialize scenery arrays
        this.sceneryObjects = [];
        this.buildingObjects = [];
        this.mountainObjects = [];
        this.cloudObjects = [];
        
        // Create distant mountains (static background)
        this.createMountains();
        
        // Create buildings along the roadside
        this.createBuildings();
        
        // Create trees along the side
        for (let i = -200; i < 200; i += 60) {
            // Left side - varied positioning
            const leftTree = this.createTree();
            leftTree.position.set(-22 + Math.random() * 4, 0, i + Math.random() * 20);
            this.game.scene.add(leftTree);
            this.sceneryObjects.push(leftTree);
            
            // Right side - varied positioning
            const rightTree = this.createTree();
            rightTree.position.set(22 + Math.random() * 4, 0, i + Math.random() * 20);
            this.game.scene.add(rightTree);
            this.sceneryObjects.push(rightTree);
        }
        
        // Add street lamps along the road
        for (let i = -200; i < 200; i += 40) {
            // Left side lamp
            const leftLamp = this.createStreetLamp();
            leftLamp.position.set(-12, 0, i);
            this.game.scene.add(leftLamp);
            this.sceneryObjects.push(leftLamp);
            
            // Right side lamp
            const rightLamp = this.createStreetLamp();
            rightLamp.position.set(12, 0, i);
            this.game.scene.add(rightLamp);
            this.sceneryObjects.push(rightLamp);
        }
        
        // Add billboards
        for (let i = -200; i < 200; i += 120) {
            if (Math.random() > 0.5) {
                const billboard = this.createBillboard();
                billboard.position.set(-28, 0, i);
                this.game.scene.add(billboard);
                this.sceneryObjects.push(billboard);
            } else {
                const billboard = this.createBillboard();
                billboard.position.set(28, 0, i);
                this.game.scene.add(billboard);
                this.sceneryObjects.push(billboard);
            }
        }
        
        // Create clouds in the sky
        this.createClouds();
        
        console.log(`✅ Created detailed scenery: ${this.sceneryObjects.length} roadside objects, ${this.buildingObjects.length} buildings, ${this.mountainObjects.length} mountains, ${this.cloudObjects.length} clouds`);
    }
    
    createTree() {
        // Create a tree group with trunk and foliage
        const tree = new THREE.Group();
        
        // Random tree variation
        const treeType = Math.floor(Math.random() * 3);
        
        // Brown trunk (optimized geometry)
        const trunkHeight = 2.5 + Math.random() * 1.5;
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 6);
        const trunkMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513 // Brown
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = false;
        tree.add(trunk);
        
        // Different foliage colors for variety
        const foliageColors = [0x228B22, 0x2E8B57, 0x3CB371];
        const foliageMaterial = new THREE.MeshLambertMaterial({ 
            color: foliageColors[treeType]
        });
        
        // Green foliage (3 spheres stacked)
        const foliage1 = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 6, 6),
            foliageMaterial
        );
        foliage1.position.y = trunkHeight + 1;
        foliage1.castShadow = false;
        tree.add(foliage1);
        
        const foliage2 = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 6, 6),
            foliageMaterial
        );
        foliage2.position.y = trunkHeight + 2;
        foliage2.castShadow = false;
        tree.add(foliage2);
        
        const foliage3 = new THREE.Mesh(
            new THREE.SphereGeometry(0.9, 6, 6),
            foliageMaterial
        );
        foliage3.position.y = trunkHeight + 2.8;
        foliage3.castShadow = false;
        tree.add(foliage3);
        
        return tree;
    }
    
    createMountains() {
        // Create distant mountain range (far background)
        const mountainCount = 8;
        
        for (let i = 0; i < mountainCount; i++) {
            const mountain = new THREE.Group();
            
            // Random mountain size and shape
            const height = 30 + Math.random() * 40;
            const width = 25 + Math.random() * 20;
            
            // Mountain geometry (cone)
            const geometry = new THREE.ConeGeometry(width, height, 4);
            const material = new THREE.MeshLambertMaterial({ 
                color: 0x4A4A4A,
                flatShading: true
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = height / 2;
            mesh.rotation.y = Math.random() * Math.PI;
            mountain.add(mesh);
            
            // Snow cap
            const snowHeight = height * 0.3;
            const snowGeometry = new THREE.ConeGeometry(width * 0.5, snowHeight, 4);
            const snowMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xFFFFFF
            });
            const snow = new THREE.Mesh(snowGeometry, snowMaterial);
            snow.position.y = height - snowHeight / 2;
            mountain.add(snow);
            
            // Position mountains far in the background
            const side = i % 2 === 0 ? -1 : 1;
            const distance = 150 + Math.random() * 50;
            mountain.position.set(
                side * distance,
                0,
                -100 + (i * 80) + Math.random() * 40
            );
            
            this.game.scene.add(mountain);
            this.mountainObjects.push(mountain);
        }
    }
    
    createBuildings() {
        // Create cityscape buildings in the background
        for (let i = -200; i < 200; i += 50) {
            // Left side buildings
            if (Math.random() > 0.3) {
                const building = this.createBuilding();
                building.position.set(-50 - Math.random() * 30, 0, i + Math.random() * 30);
                this.game.scene.add(building);
                this.buildingObjects.push(building);
            }
            
            // Right side buildings
            if (Math.random() > 0.3) {
                const building = this.createBuilding();
                building.position.set(50 + Math.random() * 30, 0, i + Math.random() * 30);
                this.game.scene.add(building);
                this.buildingObjects.push(building);
            }
        }
    }
    
    createBuilding() {
        const building = new THREE.Group();
        
        // Random building dimensions
        const width = 8 + Math.random() * 8;
        const height = 15 + Math.random() * 30;
        const depth = 8 + Math.random() * 8;
        
        // Main building structure
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const buildingColors = [0x505050, 0x606060, 0x4A5B6C, 0x5A6B7C];
        const material = new THREE.MeshLambertMaterial({ 
            color: buildingColors[Math.floor(Math.random() * buildingColors.length)]
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = height / 2;
        building.add(mesh);
        
        // Add fake windows to the building
        this.addFakeWindows(building, width, height, depth);
        
        return building;
    }
    
    addFakeWindows(building, width, height, depth) {
        // Window configuration
        const windowWidth = 1.2;
        const windowHeight = 1.8;
        const horizontalSpacing = 2.2;
        const verticalSpacing = 2.5;
        
        // Calculate number of floors to fill the entire height
        const bottomMargin = 1.5;
        const topMargin = 1.5;
        const availableHeight = height - bottomMargin - topMargin;
        const numFloors = Math.ceil(availableHeight / verticalSpacing);
        const adjustedSpacing = availableHeight / numFloors;
        
        // Calculate actual coverage
        const firstWindowY = bottomMargin;
        const lastWindowY = bottomMargin + ((numFloors - 1) * adjustedSpacing);
        const topGap = height - lastWindowY - topMargin;
        
        console.log(`✅ Building: h=${height.toFixed(1)}m, floors=${numFloors}, spacing=${adjustedSpacing.toFixed(2)}m`);
        console.log(`   Windows from ${firstWindowY.toFixed(1)}m to ${lastWindowY.toFixed(1)}m (gap at top: ${topGap.toFixed(1)}m)`);
        
        // Create a simple glowing window material
        const createWindowMaterial = () => {
            const isLit = Math.random() > 0.25; // 75% chance of being lit
            if (isLit) {
                // Random bright window colors (MeshBasicMaterial only uses 'color')
                const colors = [
                    0xffff99, // Warm yellow
                    0xffffff, // Bright white
                    0xffcc66  // Orange
                ];
                const windowColor = colors[Math.floor(Math.random() * colors.length)];
                
                return new THREE.MeshBasicMaterial({
                    color: windowColor
                });
            } else {
                return new THREE.MeshBasicMaterial({
                    color: 0x1a1a2e
                });
            }
        };
        
        const windowGeometry = new THREE.PlaneGeometry(windowWidth, windowHeight);
        
        // Add windows to front face (Z+) - from bottom to top with adjusted spacing
        for (let floor = 0; floor < numFloors; floor++) {
            const y = bottomMargin + (floor * adjustedSpacing);
            for (let x = -width/2 + horizontalSpacing; x < width/2; x += horizontalSpacing) {
                const window = new THREE.Mesh(windowGeometry, createWindowMaterial());
                window.position.set(x, y - height/2, depth/2 + 0.1);
                building.add(window);
            }
        }
        
        // Add windows to back face (Z-) - from bottom to top
        for (let floor = 0; floor < numFloors; floor++) {
            const y = bottomMargin + (floor * adjustedSpacing);
            for (let x = -width/2 + horizontalSpacing; x < width/2; x += horizontalSpacing) {
                const window = new THREE.Mesh(windowGeometry, createWindowMaterial());
                window.position.set(x, y - height/2, -depth/2 - 0.1);
                window.rotation.y = Math.PI;
                building.add(window);
            }
        }
        
        // Add windows to left face (X-) - from bottom to top
        for (let floor = 0; floor < numFloors; floor++) {
            const y = bottomMargin + (floor * adjustedSpacing);
            for (let z = -depth/2 + horizontalSpacing; z < depth/2; z += horizontalSpacing) {
                const window = new THREE.Mesh(windowGeometry, createWindowMaterial());
                window.position.set(-width/2 - 0.1, y - height/2, z);
                window.rotation.y = -Math.PI / 2;
                building.add(window);
            }
        }
        
        // Add windows to right face (X+) - from bottom to top
        for (let floor = 0; floor < numFloors; floor++) {
            const y = bottomMargin + (floor * adjustedSpacing);
            for (let z = -depth/2 + horizontalSpacing; z < depth/2; z += horizontalSpacing) {
                const window = new THREE.Mesh(windowGeometry, createWindowMaterial());
                window.position.set(width/2 + 0.1, y - height/2, z);
                window.rotation.y = Math.PI / 2;
                building.add(window);
            }
        }
    }
    
    createStreetLamp() {
        const lamp = new THREE.Group();
        
        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.15, 0.15, 6, 6);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 3;
        lamp.add(pole);
        
        // Lamp head
        const headGeometry = new THREE.SphereGeometry(0.4, 8, 6);
        const headMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFF99,
            emissive: 0xFFFF66,
            emissiveIntensity: 0.5
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 6;
        lamp.add(head);
        
        return lamp;
    }
    
    createBillboard() {
        const billboard = new THREE.Group();
        
        // Support pole
        const poleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 8, 6);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 4;
        billboard.add(pole);
        
        // Billboard board
        const boardGeometry = new THREE.BoxGeometry(8, 4, 0.2);
        const billboardColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3];
        const boardMaterial = new THREE.MeshLambertMaterial({ 
            color: billboardColors[Math.floor(Math.random() * billboardColors.length)]
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.y = 8;
        billboard.add(board);
        
        return billboard;
    }
    
    createClouds() {
        // Create fluffy clouds in the sky
        for (let i = 0; i < 12; i++) {
            const cloud = this.createCloud();
            cloud.position.set(
                -100 + Math.random() * 200,
                40 + Math.random() * 20,
                -150 + i * 60 + Math.random() * 40
            );
            this.game.scene.add(cloud);
            this.cloudObjects.push(cloud);
        }
    }
    
    createCloud() {
        const cloud = new THREE.Group();
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        
        // Create cloud from multiple spheres
        const sphereCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < sphereCount; i++) {
            const size = 3 + Math.random() * 4;
            const geometry = new THREE.SphereGeometry(size, 6, 6);
            const sphere = new THREE.Mesh(geometry, cloudMaterial);
            sphere.position.set(
                (i - sphereCount / 2) * 4,
                Math.random() * 2,
                Math.random() * 2
            );
            cloud.add(sphere);
        }
        
        return cloud;
    }

    update(delta) {
        if (!this.playerVehicle) return;
        
        // Stop updating if game is over
        if (this.isGameOver) return;
        
        // Get input from gesture control, touch, and keyboard
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
        // Use smooth, consistent movement for all track elements
        
        // Ground sections - smooth movement
        if (this.groundSections) {
            for (let ground of this.groundSections) {
                ground.position.z -= moveDistance;
                // Loop sections back to front when they pass behind camera
                if (ground.position.z < -1000) {
                    ground.position.z += 4000;
                }
            }
        }
        
        // Track sections - smooth movement
        if (this.trackSections) {
            for (let track of this.trackSections) {
                track.position.z -= moveDistance;
                // Loop sections back to front
                if (track.position.z < -1000) {
                    track.position.z += 4000;
                }
            }
        }
        
        // Barriers - smooth movement with same speed as track
        if (this.obstacleManager && this.obstacleManager.barriers) {
            for (let barrier of this.obstacleManager.barriers) {
                barrier.position.z -= moveDistance;
                // Loop barriers
                if (barrier.position.z < -1000) {
                    barrier.position.z += 4000;
                }
            }
        }
        
        // Lane dashes - smooth, synchronized movement
        if (this.laneDashes) {
            for (let dash of this.laneDashes) {
                dash.position.z -= moveDistance;
                // Loop dashes when they pass behind
                if (dash.position.z < -100) {
                    dash.position.z += 400;
                }
            }
        }
        
        // Scenery objects (trees, lamps, billboards) - parallax effect for depth
        if (this.sceneryObjects) {
            // Roadside objects move slightly slower for parallax depth effect
            const scenerySpeed = moveDistance * 0.85;
            for (let obj of this.sceneryObjects) {
                obj.position.z -= scenerySpeed;
                // Loop objects when they pass behind
                if (obj.position.z < -100) {
                    obj.position.z += 400;
                }
            }
        }
        
        // Buildings - even slower parallax (far background)
        if (this.buildingObjects) {
            const buildingSpeed = moveDistance * 0.6;
            for (let building of this.buildingObjects) {
                building.position.z -= buildingSpeed;
                // Loop buildings
                if (building.position.z < -150) {
                    building.position.z += 400;
                }
            }
        }
        
        // Mountains - very slow parallax (distant background, almost static)
        if (this.mountainObjects) {
            const mountainSpeed = moveDistance * 0.3;
            for (let mountain of this.mountainObjects) {
                mountain.position.z -= mountainSpeed;
                // Loop mountains with larger distance
                if (mountain.position.z < -200) {
                    mountain.position.z += 800;
                }
            }
        }
        
        // Clouds - slow drift for atmospheric effect
        if (this.cloudObjects) {
            const cloudSpeed = moveDistance * 0.2;
            for (let cloud of this.cloudObjects) {
                cloud.position.z -= cloudSpeed;
                // Also add slight horizontal drift
                cloud.position.x += Math.sin(this.gameTime * 0.1) * delta * 0.5;
                // Loop clouds
                if (cloud.position.z < -200) {
                    cloud.position.z += 800;
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
        
        // Keyboard controls
        const keys = this.getKeyboardState();
        controls.accelerate = controls.accelerate || keys.up;
        controls.brake = controls.brake || keys.down;
        controls.left = controls.left || keys.left;
        controls.right = controls.right || keys.right;
        controls.boost = controls.boost || keys.shift;
        controls.toggleCamera = controls.toggleCamera || keys.toggleCamera;
        
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
            left: window.keys['KeyD'] || window.keys['ArrowRight'],  // Inverted: D = Left
            right: window.keys['KeyA'] || window.keys['ArrowLeft'],  // Inverted: A = Right
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
        
        // Get current speed and boost state
        const speed = Math.floor(this.playerVehicle.getSpeed());
        const isBoosting = this.playerVehicle.isBoosting || false;
        
        // Update speedometer gauge (bottom right)
        const gaugeNeedle = document.getElementById('gauge-needle');
        const gaugeSpeedDisplay = document.getElementById('gauge-speed-display');
        if (gaugeNeedle && gaugeSpeedDisplay) {
            // Rotate needle from -90° (0 km/h) to 90° (299 km/h)
            const maxSpeed = 299;
            const rotation = -90 + (speed / maxSpeed) * 180;
            gaugeNeedle.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
            gaugeSpeedDisplay.textContent = speed;
        }
        
        // Update boost meter (bottom left) - shows energy level
        const boostFill = document.getElementById('boost-meter-fill');
        if (boostFill) {
            // Get boost energy percentage from vehicle
            const boostPercentage = this.playerVehicle.getBoostPercentage();
            boostFill.style.width = boostPercentage + '%';
            
            // Add active class when boosting
            if (isBoosting) {
                boostFill.classList.add('active');
            } else {
                boostFill.classList.remove('active');
            }
            
            // Change color based on energy level
            if (boostPercentage < 20) {
                boostFill.style.opacity = '0.5'; // Low energy warning
            } else {
                boostFill.style.opacity = '1';
            }
        }
        
        // Update lives
        const livesEl = document.getElementById('hud-lives');
        if (livesEl) livesEl.innerHTML = '❤️'.repeat(this.lives);
        
        // Update time
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        const timeEl = document.getElementById('hud-time');
        if (timeEl) {
            timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
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
        this.isGameOver = false; // Reset game over flag
        
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
        // Prevent multiple calls
        if (this.isGameOver) return;
        
        console.log('💥 Game Over!');
        
        // Set game over flag to stop updates
        this.isGameOver = true;
        
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
        const finalScoreEl = document.getElementById('final-score');
        const finalDistanceEl = document.getElementById('final-distance');
        const finalHighScoreEl = document.getElementById('final-high-score');
        const finalMaxSpeedEl = document.getElementById('final-max-speed');
        
        if (finalScoreEl) finalScoreEl.textContent = Math.floor(this.score);
        if (finalDistanceEl) finalDistanceEl.textContent = Math.floor(this.distance);
        if (finalHighScoreEl) finalHighScoreEl.textContent = Math.floor(this.highScore);
        if (finalMaxSpeedEl) finalMaxSpeedEl.textContent = Math.floor(this.playerVehicle.getSpeed());
        
        console.log('📊 Final stats updated - Score:', this.score, 'Distance:', this.distance);
        
        // Change state to game over
        console.log('🎬 Calling setState(game_over)...');
        if (this.game && typeof this.game.setState === 'function') {
            this.game.setState('game_over');
            console.log('✅ setState(game_over) called successfully');
        } else {
            console.error('❌ Cannot call setState - game reference missing!');
        }
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
        
        // Remove building objects
        if (this.buildingObjects) {
            for (let obj of this.buildingObjects) {
                this.game.scene.remove(obj);
                obj.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            }
            this.buildingObjects = [];
        }
        
        // Remove mountain objects
        if (this.mountainObjects) {
            for (let obj of this.mountainObjects) {
                this.game.scene.remove(obj);
                obj.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            }
            this.mountainObjects = [];
        }
        
        // Remove cloud objects
        if (this.cloudObjects) {
            for (let obj of this.cloudObjects) {
                this.game.scene.remove(obj);
                obj.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            }
            this.cloudObjects = [];
        }
        
        console.log('✅ Game manager cleaned up');
    }
}
