# 🎮 Keyboard Controls - Complete Guide

## ✅ Current Control Scheme

Your game has full WASD + Arrow Keys controls with camera switching!

### Control Mapping:

| Action | Keys | Description |
|--------|------|-------------|
| **Forward (Accelerate)** | `W` or `↑` | Move forward and gain speed |
| **Brake** | `S` or `↓` | Slow down or reverse |
| **Turn Left** | `A` or `←` | Switch to left lane |
| **Turn Right** | `D` or `→` | Switch to right lane |
| **Boost** | `Shift` | Speed boost (if implemented) |
| **Toggle Camera** | `V` | Switch between Chase and Hood camera views |

## 📍 Implementation Location

**File:** `js/gameManager.js`  
**Function:** `getKeyboardState()`

```javascript
return {
    up: window.keys['KeyW'] || window.keys['ArrowUp'],      // W or ↑
    down: window.keys['KeyS'] || window.keys['ArrowDown'],  // S or ↓
    left: window.keys['KeyA'] || window.keys['ArrowLeft'],  // A or ←
    right: window.keys['KeyD'] || window.keys['ArrowRight'], // D or →
    shift: window.keys['ShiftLeft'] || window.keys['ShiftRight'],
    toggleCamera: window.keys['KeyV']                        // V key
};
```

## ✨ Features

- ✅ **Dual Input Support** - Both WASD and Arrow Keys work simultaneously
- ✅ **Keyboard Fallback** - Works even if gesture controls are disabled
- ✅ **Standard Gaming Layout** - WASD is the industry standard for PC games
- ✅ **Responsive** - Key events handled via event listeners for instant response

## 🎯 How It Works

1. **Event Listeners**: The game sets up `keydown` and `keyup` event listeners
2. **Key State Tracking**: Stores which keys are currently pressed in `window.keys`
3. **Dual Detection**: Checks for both WASD and Arrow Keys using OR logic (`||`)
4. **Control Translation**: Converts key states to game controls (accelerate, brake, left, right)

## 🧪 Testing Your Controls

1. Start the game
2. Press `W` to accelerate forward
3. Press `S` to brake
4. Press `A` to move left lane
5. Press `D` to move right lane
6. Press `V` to switch camera view (Chase ↔ Hood)
7. **Alternative**: Use Arrow Keys (↑↓←→) for movement

## 📷 Camera Views

### Chase Camera (Default)
- Camera positioned behind and above the car
- Looks slightly ahead for better visibility
- Best for general racing

### Hood Camera (Press V)
- Camera fixed to the car's hood
- First-person perspective
- More immersive racing experience

## 💡 Additional Notes

- Controls are displayed in console when game starts (lines 64-68)
- Both input methods work at the same time (you can use W↑ and Arrow Keys interchangeably)
- The game also supports gesture controls via webcam as an alternative input method

---

**Status:** ✅ ALREADY WORKING - No changes needed!
