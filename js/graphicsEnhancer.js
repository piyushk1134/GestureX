import * as THREE from 'three';

export class GraphicsEnhancer {
    constructor(scene, renderer, camera) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
    }
    
    enhanceLighting() {
        // Remove existing lights
        const existingLights = [];
        this.scene.traverse((object) => {
            if (object.isLight) {
                existingLights.push(object);
            }
        });
        existingLights.forEach(light => this.scene.remove(light));
        
        // Enhanced ambient light for overall brightness
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light (sun) with better angle
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(50, 100, 50);
        mainLight.castShadow = false; // Keep shadows off for 60fps
        this.scene.add(mainLight);
        
        // Secondary directional light for fill
        const fillLight = new THREE.DirectionalLight(0xadd8e6, 0.4);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);
        
        // Rim light for dramatic effect
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, 20, -100);
        this.scene.add(rimLight);
        
        // Hemisphere light for natural sky/ground lighting
        const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x545454, 0.5);
        this.scene.add(hemiLight);
        
        console.log('✨ Enhanced lighting system installed');
    }
    
    enhanceSkybox() {
        // Create gradient sky
        const skyGeo = new THREE.SphereGeometry(1000, 32, 32);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
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
        
        const sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
        
        console.log('🌅 Enhanced skybox created');
    }
    
    enhanceFog() {
        // Add atmospheric fog for depth
        this.scene.fog = new THREE.Fog(0x87ceeb, 100, 600);
        console.log('🌫️ Atmospheric fog added');
    }
    
    enhanceTrackMaterials() {
        // Find and enhance track materials
        this.scene.traverse((object) => {
            if (object.isMesh && object.material) {
                // Road surface
                if (object.material.color && object.material.color.getHex() === 0x2c3e50) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: 0x2c3e50,
                        roughness: 0.8,
                        metalness: 0.1,
                        envMapIntensity: 0.5
                    });
                }
                
                // Lane markers
                if (object.material.color && object.material.color.getHex() === 0xffffff) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        emissive: 0xffffff,
                        emissiveIntensity: 0.2,
                        roughness: 0.6,
                        metalness: 0.1
                    });
                }
                
                // Barriers
                if (object.userData.isBarrier) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: 0xe74c3c,
                        emissive: 0xe74c3c,
                        emissiveIntensity: 0.3,
                        roughness: 0.5,
                        metalness: 0.2
                    });
                }
            }
        });
        
        console.log('🛣️ Track materials enhanced');
    }
    
    enhanceObstacleMaterials() {
        // This will be called each frame to enhance new obstacles
        this.scene.traverse((object) => {
            if (object.isMesh && object.material && !object.userData.enhanced) {
                // Traffic cars
                if (object.material.color && (
                    object.material.color.getHex() === 0xe74c3c ||
                    object.parent?.userData?.isTrafficCar
                )) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: object.material.color,
                        roughness: 0.3,
                        metalness: 0.8,
                        envMapIntensity: 1.0
                    });
                    object.userData.enhanced = true;
                }
                
                // Rocks
                if (object.geometry?.type === 'BoxGeometry' && 
                    object.material.color && 
                    object.material.color.getHex() === 0x808080) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: 0x808080,
                        roughness: 0.9,
                        metalness: 0.1
                    });
                    object.userData.enhanced = true;
                }
            }
        });
    }
    
    enhanceSceneryMaterials() {
        // Enhance trees, buildings, mountains
        this.scene.traverse((object) => {
            if (object.isMesh && object.material && !object.userData.enhanced) {
                const color = object.material.color?.getHex();
                
                // Trees (green colors)
                if (color === 0x228B22 || color === 0x2E8B57 || color === 0x3CB371) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: color,
                        roughness: 0.9,
                        metalness: 0.0
                    });
                    object.userData.enhanced = true;
                }
                
                // Tree trunks (brown)
                if (color === 0x8B4513) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: color,
                        roughness: 0.95,
                        metalness: 0.0
                    });
                    object.userData.enhanced = true;
                }
                
                // Buildings (gray colors)
                if (color === 0x505050 || color === 0x606060 || 
                    color === 0x4A5B6C || color === 0x5A6B7C) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: color,
                        roughness: 0.6,
                        metalness: 0.3,
                        envMapIntensity: 0.5
                    });
                    object.userData.enhanced = true;
                }
                
                // Mountains (dark gray)
                if (color === 0x4A4A4A) {
                    object.material = new THREE.MeshStandardMaterial({
                        color: color,
                        roughness: 0.9,
                        metalness: 0.1,
                        flatShading: true
                    });
                    object.userData.enhanced = true;
                }
            }
        });
    }
    
    addEnvironmentMap() {
        // Create simple environment map for reflections
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        const envScene = new THREE.Scene();
        
        // Add gradient to env scene
        const skyColor = new THREE.Color(0x87ceeb);
        const groundColor = new THREE.Color(0x545454);
        
        envScene.background = new THREE.Color().lerpColors(groundColor, skyColor, 0.5);
        
        const envMap = pmremGenerator.fromScene(envScene).texture;
        this.scene.environment = envMap;
        
        pmremGenerator.dispose();
        
        console.log('🌍 Environment map created for reflections');
    }
    
    enhanceRendererSettings() {
        // Better renderer settings
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        console.log('🎨 Renderer settings enhanced');
    }
    
    applyAllEnhancements() {
        console.log('🎨 Applying graphics enhancements...');
        
        this.enhanceLighting();
        this.enhanceSkybox();
        this.enhanceFog();
        this.enhanceRendererSettings();
        this.addEnvironmentMap();
        this.enhanceTrackMaterials();
        this.enhanceSceneryMaterials();
        
        console.log('✅ All graphics enhancements applied!');
    }
    
    update() {
        // Update dynamic enhancements each frame
        this.enhanceObstacleMaterials();
    }
}
