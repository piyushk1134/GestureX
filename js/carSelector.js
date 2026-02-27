import * as THREE from 'three';

export class CarSelector {
    constructor(game, vehicles) {
        this.game = game;
        this.vehicles = vehicles;
        this.currentIndex = 0;
        this.previewCar = null;
        this.rotationSpeed = 0.5;
        
        console.log('🏎️ Car Selector initialized with', vehicles.length, 'vehicles');
    }

    showMenuPreview() {
        // Remove existing preview first
        this.removePreview();
        
        // Create rotating car preview for main menu
        const vehicle = this.vehicles[this.currentIndex];
        if (!vehicle || !vehicle.model) {
            console.warn('No vehicle model available for menu preview');
            return;
        }
        
        this.previewCar = vehicle.model.clone();
        this.previewCar.position.set(0, 1, 0); // Slightly elevated
        this.previewCar.rotation.y = Math.PI * 0.25; // Better angle
        this.previewCar.scale.set(1.2, 1.2, 1.2); // Smaller scale
        
        this.previewCar.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false; // Disabled for 60fps
                child.receiveShadow = false; // Disabled for 60fps
            }
        });
        
        this.game.scene.add(this.previewCar);
    }

    showCarousel() {
        // Remove menu preview first
        this.removePreview();
        
        // Create car preview for selection screen
        const vehicle = this.vehicles[this.currentIndex];
        if (!vehicle || !vehicle.model) {
            console.warn('No vehicle model available for carousel');
            return;
        }
        
        this.previewCar = vehicle.model.clone();
        this.previewCar.position.set(0, 1, 0);
        this.previewCar.rotation.y = Math.PI * 0.25;
        this.previewCar.scale.set(1.5, 1.5, 1.5);
        
        this.previewCar.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false; // Disabled for 60fps
                child.receiveShadow = false; // Disabled for 60fps
            }
        });
        
        this.game.scene.add(this.previewCar);
        
        // Update UI
        this.updateCarInfo();
    }

    nextCar() {
        this.currentIndex = (this.currentIndex + 1) % this.vehicles.length;
        this.game.selectedVehicleIndex = this.currentIndex;
        
        if (this.game.state === 'car_select') {
            this.showCarousel();
        } else {
            this.showMenuPreview();
        }
        
        console.log(`Selected: ${this.vehicles[this.currentIndex].name}`);
    }

    previousCar() {
        this.currentIndex = (this.currentIndex - 1 + this.vehicles.length) % this.vehicles.length;
        this.game.selectedVehicleIndex = this.currentIndex;
        
        if (this.game.state === 'car_select') {
            this.showCarousel();
        } else {
            this.showMenuPreview();
        }
        
        console.log(`Selected: ${this.vehicles[this.currentIndex].name}`);
    }

    updateCarInfo() {
        const vehicle = this.vehicles[this.currentIndex];
        if (!vehicle) return;
        
        // Update car name and category
        const nameEl = document.getElementById('car-name');
        const categoryEl = document.getElementById('car-category');
        
        if (nameEl) nameEl.textContent = vehicle.name;
        if (categoryEl) nameEl.textContent = vehicle.category;
        
        // Update stats bars
        this.updateStatBar('speed', vehicle.speed, 350); // Max F1 speed
        this.updateStatBar('accel', vehicle.acceleration, 10); // Max accel
        this.updateStatBar('handling', vehicle.handling, 10); // Max handling
        
        // Update stat values
        document.getElementById('stat-speed-value').textContent = vehicle.speed;
        document.getElementById('stat-accel-value').textContent = vehicle.acceleration;
        document.getElementById('stat-handling-value').textContent = vehicle.handling;
    }

    updateStatBar(statName, value, maxValue) {
        const barEl = document.getElementById(`stat-${statName}`);
        if (!barEl) return;
        
        const percentage = (value / maxValue) * 100;
        barEl.style.width = percentage + '%';
        
        // Color based on value
        if (percentage >= 90) {
            barEl.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
        } else if (percentage >= 70) {
            barEl.style.background = 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)';
        } else {
            barEl.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
        }
    }

    updateMenuPreview(delta) {
        if (this.previewCar) {
            this.previewCar.rotation.y += delta * this.rotationSpeed;
        }
    }

    updateCarousel(delta) {
        if (this.previewCar) {
            // Gentle bobbing animation
            const time = Date.now() * 0.001;
            this.previewCar.position.y = Math.sin(time) * 0.1;
            this.previewCar.rotation.y += delta * 0.3;
        }
    }

    removePreview() {
        if (this.previewCar) {
            this.game.scene.remove(this.previewCar);
            this.previewCar = null;
        }
    }

    getSelectedVehicle() {
        return this.vehicles[this.currentIndex];
    }
}
