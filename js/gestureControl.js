// Real MediaPipe Hand Detection for GestureX Racing
export class GestureControl {
    constructor() {
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.handDetected = false;
        this.currentGesture = 'none';
        this.hands = null;
        this.camera = null;
        
        console.log('👋 Gesture Control initialized (MediaPipe Real Detection)');
    }
    
    async init() {
        console.log('🎬 GestureControl.init() called');
        
        // Get video and canvas elements
        this.videoElement = document.getElementById('gesture-video');
        this.canvasElement = document.getElementById('gesture-canvas');
        
        console.log('🔍 Looking for elements...');
        console.log('  Video element:', this.videoElement ? '✅ Found' : '❌ NOT FOUND');
        console.log('  Canvas element:', this.canvasElement ? '✅ Found' : '❌ NOT FOUND');
        
        if (!this.videoElement || !this.canvasElement) {
            console.error('❌ CRITICAL: Gesture elements not found!');
            console.error('  Looking for: gesture-video and gesture-canvas');
            console.error('  Current page:', window.location.href);
            console.log('💡 Make sure you are on the calibration screen');
            return false;
        }
        
        console.log('✅ Elements found, setting up canvas...');
        
        this.canvasCtx = this.canvasElement.getContext('2d');
        this.canvasElement.width = 640;
        this.canvasElement.height = 480;
        
        // Make sure canvas is visible
        this.canvasElement.style.display = 'block';
        
        // Load MediaPipe Hands
        try {
            console.log('📦 Loading MediaPipe Hands...');
            
            // Wait a bit for scripts to load
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if MediaPipe is loaded
            console.log('📋 Checking MediaPipe availability...');
            console.log('  typeof Hands:', typeof Hands);
            console.log('  typeof Camera:', typeof Camera);
            console.log('  typeof drawConnectors:', typeof drawConnectors);
            console.log('  typeof drawLandmarks:', typeof drawLandmarks);
            
            if (typeof Hands === 'undefined') {
                console.error('❌ MediaPipe Hands library not loaded!');
                console.error('  Check if CDN scripts loaded successfully');
                console.error('  Check browser network tab for failed requests');
                throw new Error('MediaPipe Hands not loaded');
            }
            
            console.log('✅ MediaPipe library confirmed loaded');
            
            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
            
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.hands.onResults((results) => this.onResults(results));
            
            // Initialize camera
            console.log('📷 Requesting camera access...');
            
            if (typeof Camera === 'undefined') {
                console.error('❌ MediaPipe Camera utility not loaded!');
                throw new Error('Camera utility not loaded');
            }
            
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.hands) {
                        await this.hands.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });
            
            console.log('🎥 Starting camera...');
            await this.camera.start();
            
            console.log('');
            console.log('════════════════════════════════════════════');
            console.log('✅ MEDIAPIPE HANDS INITIALIZED SUCCESSFULLY!');
            console.log('════════════════════════════════════════════');
            console.log('🖐️ Show your hand to the camera');
            console.log('💚 You should see green skeleton on your hand');
            console.log('📹 Camera feed should be visible in canvas');
            console.log('════════════════════════════════════════════');
            console.log('');
            
            // Test draw to canvas
            setTimeout(() => {
                if (this.canvasCtx) {
                    console.log('🎨 Testing canvas draw...');
                }
            }, 1000);
            
            return true;
        } catch (error) {
            console.error('');
            console.error('════════════════════════════════════════════');
            console.error('❌ MEDIAPIPE INITIALIZATION FAILED');
            console.error('════════════════════════════════════════════');
            console.error('Error:', error.message);
            console.error('Stack:', error.stack);
            console.error('════════════════════════════════════════════');
            console.log('💡 Falling back to keyboard controls (W/A/S/D)');
            console.log('');
            return false;
        }
    }
    
    onResults(results) {
        // Draw to both calibration canvas and game canvas
        this.drawToCanvas(this.canvasElement, results);
        
        // Also draw to game canvas if it exists
        const gameCanvas = document.getElementById('game-gesture-canvas');
        if (gameCanvas) {
            this.drawToCanvas(gameCanvas, results);
        }
        
        // Check if hand detected
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.handDetected = true;
            const landmarks = results.multiHandLandmarks[0];
            
            // Recognize gesture
            this.currentGesture = this.recognizeGesture(landmarks);
            
        } else {
            this.handDetected = false;
            this.currentGesture = 'none';
        }
        
        this.updateUI();
    }
    
    drawToCanvas(canvas, results) {
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw camera feed
        ctx.drawImage(
            results.image, 0, 0, 
            canvas.width, 
            canvas.height
        );
        
        // Draw hand landmarks if detected
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            if (typeof drawConnectors !== 'undefined') {
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 2
                });
                drawLandmarks(ctx, landmarks, {
                    color: '#00FF00',
                    lineWidth: 1,
                    radius: 3
                });
            }
        }
        
        ctx.restore();
    }
    
    recognizeGesture(landmarks) {
        // Extract key landmark positions
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const thumbBase = landmarks[2];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        const indexBase = landmarks[5];
        const middleBase = landmarks[9];
        const ringBase = landmarks[13];
        const pinkyBase = landmarks[17];
        
        // Calculate finger extensions
        const thumbExtended = Math.abs(thumbTip.y - thumbBase.y) > 0.1;
        const indexExtended = indexTip.y < indexBase.y;
        const middleExtended = middleTip.y < middleBase.y;
        const ringExtended = ringTip.y < ringBase.y;
        const pinkyExtended = pinkyTip.y < pinkyBase.y;
        
        const fingersExtended = {
            thumb: thumbExtended,
            index: indexExtended,
            middle: middleExtended,
            ring: ringExtended,
            pinky: pinkyExtended
        };
        
        const extendedCount = Object.values(fingersExtended).filter(v => v).length;
        
        // Gesture recognition (order matters - most specific first!)
        
        // Thumbs up (ONLY thumb extended, all others closed) = Boost
        if (fingersExtended.thumb && !indexExtended && !middleExtended && 
            !ringExtended && !pinkyExtended) {
            return 'thumbs_up';
        }
        
        // Peace sign (ONLY index and middle extended, others closed) = Pause
        if (indexExtended && middleExtended && 
            !ringExtended && !pinkyExtended && !thumbExtended) {
            return 'peace';
        }
        
        // Open Palm (4 or 5 fingers extended) = Accelerate
        if (extendedCount >= 4) {
            return 'open_palm';
        }
        
        // Fist (NO fingers extended) = Brake
        if (extendedCount === 0 || (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended)) {
            return 'fist';
        }
        
        // Tilt detection for steering
        const palmX = wrist.x;
        
        // Hand on RIGHT side of screen = Move RIGHT
        if (palmX > 0.6) {
            return 'tilt_right';
        }
        
        // Hand on LEFT side of screen = Move LEFT
        if (palmX < 0.4) {
            return 'tilt_left';
        }
        
        return 'none';
    }
    
    updateUI() {
        const gestureNames = {
            'open_palm': '🖐️ Accelerate',
            'fist': '✊ Brake',
            'tilt_left': '👈 Left',
            'tilt_right': '👉 Right',
            'thumbs_up': '👍 Boost',
            'peace': '✌️ Pause',
            'none': '' // Don't show "None"
        };
        
        // Update calibration screen gesture indicator
        const gestureText = document.getElementById('gesture-text');
        if (gestureText) {
            const gestureName = gestureNames[this.currentGesture] || '';
            gestureText.textContent = gestureName;
            // Hide if no gesture
            gestureText.style.display = gestureName ? 'block' : 'none';
        }
        
        // Update calibration screen hand detected status
        const statusEl = document.getElementById('hand-status');
        if (statusEl) {
            statusEl.textContent = this.handDetected ? '✅ Hand Detected' : '❌ No Hand';
            statusEl.style.color = this.handDetected ? '#00ff00' : '#ff0000';
        }
        
        // Update game screen gesture indicator (only show if there's an active gesture)
        const gameGestureStatus = document.getElementById('game-gesture-status');
        if (gameGestureStatus) {
            const gestureName = gestureNames[this.currentGesture] || '';
            if (gestureName) {
                gameGestureStatus.textContent = gestureName;
                gameGestureStatus.style.display = 'inline';
            } else {
                gameGestureStatus.style.display = 'none';
            }
        }
        
        // Update game screen hand detected status
        const gameHandStatus = document.getElementById('game-hand-status');
        if (gameHandStatus) {
            gameHandStatus.textContent = this.handDetected ? '✅ Hand' : '❌ No Hand';
        }
    }
    
    getGestureInput() {
        if (!this.handDetected) {
            return {
                handDetected: false,
                gesture: 'none',
                controls: {
                    accelerate: false,
                    brake: false,
                    left: false,
                    right: false,
                    boost: false
                }
            };
        }
        
        // Map gestures to controls (INVERTED for natural camera mirror effect)
        const controls = {
            accelerate: this.currentGesture === 'open_palm',
            brake: this.currentGesture === 'fist',
            left: this.currentGesture === 'tilt_right',  // Hand RIGHT → Turn LEFT
            right: this.currentGesture === 'tilt_left',  // Hand LEFT → Turn RIGHT
            boost: this.currentGesture === 'thumbs_up'
        };
        
        return {
            handDetected: true,
            gesture: this.currentGesture,
            controls: controls
        };
    }
    
    update() {
        // MediaPipe handles updates via callbacks (onResults)
        // This method exists for compatibility but doesn't need to do anything
        // The gesture detection happens automatically through the camera feed
    }
    
    startCamera(elementId) {
        // Camera is already started in init(), this is just for compatibility
        console.log('📷 Camera already running (started in init)');
        // Optionally could re-initialize or show/hide elements here
        return true;
    }
    
    stopCamera() {
        if (this.camera) {
            this.camera.stop();
            console.log('🛑 Camera stopped');
        }
    }
    
    cleanup() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.hands) {
            this.hands.close();
        }
        console.log('🛑 Gesture control stopped');
    }
}
