export class AchievementSystem {
    constructor() {
        this.achievements = {
            firstRace: { id: 'first_race', name: 'First Race', description: 'Complete your first race', unlocked: false, icon: '🏁' },
            speedDemon: { id: 'speed_demon', name: 'Speed Demon', description: 'Reach 250 km/h', unlocked: false, icon: '⚡' },
            boostMaster: { id: 'boost_master', name: 'Boost Master', description: 'Use boost 50 times', unlocked: false, icon: '🚀' },
            survivor: { id: 'survivor', name: 'Survivor', description: 'Travel 1000m without collision', unlocked: false, icon: '🛡️' },
            distanceKing: { id: 'distance_king', name: 'Distance King', description: 'Travel 5000m in one run', unlocked: false, icon: '👑' },
            perfectDodge: { id: 'perfect_dodge', name: 'Perfect Dodge', description: 'Avoid 100 obstacles', unlocked: false, icon: '🎯' },
            laneChanger: { id: 'lane_changer', name: 'Lane Changer', description: 'Change lanes 200 times', unlocked: false, icon: '↔️' },
            nightRacer: { id: 'night_racer', name: 'Night Racer', description: 'Race for 5 minutes', unlocked: false, icon: '🌙' },
            gesturePro: { id: 'gesture_pro', name: 'Gesture Pro', description: 'Complete a race using only gestures', unlocked: false, icon: '🖐️' },
            combo10: { id: 'combo_10', name: 'Combo Master', description: 'Reach 10x combo multiplier', unlocked: false, icon: '🔥' }
        };
        
        this.stats = {
            totalDistance: 0,
            maxSpeed: 0,
            boostCount: 0,
            obstaclesAvoided: 0,
            laneChanges: 0,
            totalPlayTime: 0,
            distanceWithoutCollision: 0,
            currentCombo: 0,
            maxCombo: 0,
            gestureOnlyRace: true
        };
        
        this.loadProgress();
    }
    
    updateStats(stat, value) {
        if (stat === 'currentDistance') {
            this.stats.distanceWithoutCollision += value;
            this.stats.totalDistance += value;
        } else if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat] = Math.max(this.stats[stat], value);
        }
        
        this.checkAchievements();
    }
    
    incrementStat(stat) {
        if (this.stats.hasOwnProperty(stat)) {
            this.stats[stat]++;
        }
        this.checkAchievements();
    }
    
    resetCollisionStreak() {
        this.stats.distanceWithoutCollision = 0;
    }
    
    checkAchievements() {
        // Check each achievement
        if (!this.achievements.firstRace.unlocked && this.stats.totalDistance > 100) {
            this.unlockAchievement('firstRace');
        }
        
        if (!this.achievements.speedDemon.unlocked && this.stats.maxSpeed >= 250) {
            this.unlockAchievement('speedDemon');
        }
        
        if (!this.achievements.boostMaster.unlocked && this.stats.boostCount >= 50) {
            this.unlockAchievement('boostMaster');
        }
        
        if (!this.achievements.survivor.unlocked && this.stats.distanceWithoutCollision >= 1000) {
            this.unlockAchievement('survivor');
        }
        
        if (!this.achievements.distanceKing.unlocked && this.stats.totalDistance >= 5000) {
            this.unlockAchievement('distanceKing');
        }
        
        if (!this.achievements.perfectDodge.unlocked && this.stats.obstaclesAvoided >= 100) {
            this.unlockAchievement('perfectDodge');
        }
        
        if (!this.achievements.laneChanger.unlocked && this.stats.laneChanges >= 200) {
            this.unlockAchievement('laneChanger');
        }
        
        if (!this.achievements.nightRacer.unlocked && this.stats.totalPlayTime >= 300) {
            this.unlockAchievement('nightRacer');
        }
        
        if (!this.achievements.combo10.unlocked && this.stats.maxCombo >= 10) {
            this.unlockAchievement('combo10');
        }
    }
    
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        this.showAchievementNotification(achievement);
        this.saveProgress();
    }
    
    showAchievementNotification(achievement) {
        console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 500);
        }, 4000);
    }
    
    getUnlockedCount() {
        return Object.values(this.achievements).filter(a => a.unlocked).length;
    }
    
    getTotalCount() {
        return Object.keys(this.achievements).length;
    }
    
    getProgress() {
        return (this.getUnlockedCount() / this.getTotalCount()) * 100;
    }
    
    saveProgress() {
        const data = {
            achievements: {},
            stats: this.stats
        };
        
        Object.keys(this.achievements).forEach(key => {
            data.achievements[key] = this.achievements[key].unlocked;
        });
        
        localStorage.setItem('gesturex_achievements', JSON.stringify(data));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('gesturex_achievements');
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            
            if (data.achievements) {
                Object.keys(data.achievements).forEach(key => {
                    if (this.achievements[key]) {
                        this.achievements[key].unlocked = data.achievements[key];
                    }
                });
            }
            
            if (data.stats) {
                Object.assign(this.stats, data.stats);
            }
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }
    
    getAllAchievements() {
        return Object.values(this.achievements);
    }
}
