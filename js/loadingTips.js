export const loadingTips = [
    "💡 Use hand gestures for an immersive racing experience!",
    "⚡ Hold SHIFT or use Thumbs Up 👍 gesture to activate boost!",
    "🏎️ Each car has unique stats - try them all!",
    "🎯 Avoid obstacles to maintain your combo multiplier!",
    "🔥 Combo multipliers can reach up to 10x for massive scores!",
    "📷 Press V to switch between camera angles!",
    "🌙 Toggle day/night mode for different racing atmospheres!",
    "🏆 Unlock achievements by completing challenges!",
    "💨 Higher speeds create intense visual effects!",
    "🛣️ Stay in the center lane for better maneuverability!",
    "⏸️ Press ESC to pause during gameplay!",
    "🎨 Boost creates a cyan trail effect!",
    "🌄 Mountains and clouds use parallax for depth!",
    "💡 Street lamps light up your night races!",
    "🏢 Buildings create an urban racing environment!",
    "🎯 Perfect dodging builds your combo streak!",
    "⚡ Speed demon achievement unlocks at 250 km/h!",
    "🚀 Boost increases your max speed to 299 km/h!",
    "🎮 Calibrate your gestures for best control!",
    "🏁 Distance traveled earns you achievements!",
    "💯 Try to beat your high score each run!",
    "🌟 Smooth parallax creates realistic depth!",
    "🎵 More features coming in future updates!",
    "⭐ Share your high scores with friends!",
    "🔧 Performance optimized for smooth 60fps!"
];

export function getRandomTip() {
    return loadingTips[Math.floor(Math.random() * loadingTips.length)];
}

export function startTipRotation(elementId, interval = 3000) {
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    // Set initial tip
    element.textContent = getRandomTip();
    
    // Rotate tips
    const intervalId = setInterval(() => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.textContent = getRandomTip();
            element.style.opacity = '1';
        }, 300);
    }, interval);
    
    return intervalId;
}
