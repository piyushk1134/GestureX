// Touch Controls for Mobile Devices
export class TouchControls {
    constructor() {
        this.controls = {
            accelerate: false,
            brake: false,
            left: false,
            right: false,
            boost: false,
            toggleCamera: false
        };
        
        this.touchElements = {};
        this.enabled = false;
        
        console.log('📱 Touch controls initialized');
    }

    init() {
        // Create touch control overlay
        this.createTouchOverlay();
        
        // Detect if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            this.show();
            console.log('📱 Mobile device detected - showing touch controls');
        } else {
            console.log('🖥️ Desktop detected - touch controls hidden');
        }
    }

    createTouchOverlay() {
        // Create container
        const container = document.createElement('div');
        container.id = 'touch-controls';
        container.className = 'touch-controls hidden';
        container.innerHTML = `
            <div class="touch-left-side">
                <div class="touch-dpad">
                    <button class="touch-btn touch-up" id="touch-up">↑</button>
                    <button class="touch-btn touch-left" id="touch-left">←</button>
                    <button class="touch-btn touch-down" id="touch-down">↓</button>
                    <button class="touch-btn touch-right" id="touch-right">→</button>
                </div>
            </div>
            
            <div class="touch-right-side">
                <button class="touch-btn touch-action" id="touch-camera">📷</button>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Store references
        this.touchElements = {
            container: container,
            up: document.getElementById('touch-up'),
            down: document.getElementById('touch-down'),
            left: document.getElementById('touch-left'),
            right: document.getElementById('touch-right'),
            camera: document.getElementById('touch-camera')
        };
        
        // Add event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Accelerate (Up)
        this.addTouchEvents(this.touchElements.up, () => {
            this.controls.accelerate = true;
        }, () => {
            this.controls.accelerate = false;
        });
        
        // Brake (Down)
        this.addTouchEvents(this.touchElements.down, () => {
            this.controls.brake = true;
        }, () => {
            this.controls.brake = false;
        });
        
        // Left
        this.addTouchEvents(this.touchElements.left, () => {
            this.controls.left = true;
        }, () => {
            this.controls.left = false;
        });
        
        // Right
        this.addTouchEvents(this.touchElements.right, () => {
            this.controls.right = true;
        }, () => {
            this.controls.right = false;
        });
        
        // Camera toggle (single tap)
        this.touchElements.camera.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.controls.toggleCamera = true;
            setTimeout(() => {
                this.controls.toggleCamera = false;
            }, 100);
        });
    }

    addTouchEvents(element, onStart, onEnd) {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            element.classList.add('active');
            onStart();
        });
        
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            element.classList.remove('active');
            onEnd();
        });
        
        element.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            element.classList.remove('active');
            onEnd();
        });
    }

    show() {
        if (this.touchElements.container) {
            this.touchElements.container.classList.remove('hidden');
            this.enabled = true;
        }
    }

    hide() {
        if (this.touchElements.container) {
            this.touchElements.container.classList.add('hidden');
            this.enabled = false;
        }
    }

    getControls() {
        return this.controls;
    }

    cleanup() {
        if (this.touchElements.container) {
            this.touchElements.container.remove();
        }
    }
}
