# 🔧 Troubleshooting Guide - GestureX Racing v0.13

## ✅ LATEST UPDATE: Initialization Fix Applied!

**The "stuck on initializing" issue has been fixed!**

New features added:
- ✅ Step-by-step console logging (see exactly where initialization is)
- ✅ Timeout protection (won't hang forever - 30 sec max)
- ✅ Better error messages with solutions
- ✅ Per-model timeout (10 seconds per car)

**To use the new diagnostic tools:**
1. Open browser console (F12) to see detailed initialization steps
2. Use `CHECK_INITIALIZATION.html` for real-time monitoring
3. Use `tmp_rovodev_debug_init.html` for full diagnostics

---

# 🔧 Troubleshooting Guide - GestureX Racing v0.13

## 🚨 Game Stuck at "Initializing..."

### **Problem:** Loading screen shows "Initializing..." forever

### **Solutions:**

#### ✅ Solution 1: Use Local Server (REQUIRED)
The game MUST run on a local server, not by opening index.html directly.

**Why?** 3D car models (.glb files) require HTTP protocol to load.

**How to fix:**
1. Close the browser tab
2. Double-click `LAUNCH_GAME_NOW.bat`
3. Wait for browser to open automatically

#### ✅ Solution 2: Check Browser Console
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for RED error messages
4. Common errors:
   - `Failed to fetch` → Not using local server
   - `CORS error` → Not using local server
   - `Module not found` → File path issue
   - `Unexpected token` → JavaScript syntax error

#### ✅ Solution 3: Clear Cache
1. Press **Ctrl+Shift+Delete**
2. Select "Cached images and files"
3. Click "Clear data"
4. Reload page (**Ctrl+F5**)

#### ✅ Solution 4: Try Different Browser
- ✅ Chrome (Recommended)
- ✅ Edge (Recommended)
- ⚠️ Firefox (Should work)
- ❌ Internet Explorer (Not supported)

---

## 📦 Car Models Not Loading

### **Problem:** "Loaded 0 vehicles" in console

### **Solutions:**

#### ✅ Check Files Exist
1. Open `GestureXv0.13/assets/cars/` folder
2. You should see 5 .glb files:
   - 2020 F1 McLaren MCL35.glb
   - 2020 F1 Mercedes-Benz W11.glb
   - 2020 F1 Red Bull RB16.glb
   - 2020 F1 SF1000.glb
   - 2020 McLaren 765LT.glb

#### ✅ Check File Paths
The game looks for: `assets/cars/filename.glb`

If files are in different location, update paths in `js/main.js`

---

## 🖐️ Gesture Detection Not Working

### **Problem:** Camera shows but no hand detection

### **Current Status:** Gesture detection is **simulated** in v0.13

**Why?** Real MediaPipe integration is planned for v0.14

**Workaround:** Use keyboard controls:
- **W / ↑** - Accelerate
- **S / ↓** - Brake
- **A / ←** - Turn Left
- **D / →** - Turn Right

---

## 📷 Camera Permission Denied

### **Solutions:**

#### ✅ Allow Camera Access
1. Click camera icon in browser address bar
2. Select "Allow"
3. Reload page

#### ✅ Check HTTPS/Localhost
Browsers require HTTPS or localhost for camera access.

Using `http://localhost:8000` ✅ (Works)  
Using `file:///C:/...` ❌ (Won't work)

---

## 🎮 Controls Not Responding

### **Problem:** Keyboard doesn't control car

### **Solutions:**

#### ✅ Enable Keyboard Fallback
1. Go to **Settings**
2. Click **Controls** tab
3. Check **"Keyboard Fallback"**
4. Click **SAVE**

#### ✅ Click on Game Window
Make sure the browser window has focus (click on it first)

---

## 🖥️ Black Screen / Nothing Visible

### **Solutions:**

#### ✅ Check Graphics Settings
1. Go to **Settings → Graphics**
2. Try **"Low"** quality
3. Disable shadows
4. Save and restart

#### ✅ Update Graphics Drivers
Outdated GPU drivers can cause rendering issues.

#### ✅ Check WebGL Support
Open: https://get.webgl.org/
If you see a spinning cube, WebGL works.

---

## ⚡ Performance Issues / Low FPS

### **Solutions:**

#### ✅ Lower Graphics Quality
Settings → Graphics → Quality: **Low**

#### ✅ Disable Shadows
Settings → Graphics → Shadows: **Off**

#### ✅ Close Other Programs
Free up system resources

#### ✅ Use Different Browser
Chrome/Edge have better WebGL performance than Firefox

---

## 🔊 No Sound

### **Current Status:** Sound system is **not implemented** in v0.13

Planned for v0.14:
- Engine sounds
- UI click sounds
- Background music

---

## 📝 Settings Not Saving

### **Solutions:**

#### ✅ Check LocalStorage
1. Press F12 → Application tab → Local Storage
2. Look for `gesturex_settings`
3. If missing, browser may block localStorage

#### ✅ Enable Cookies/Storage
Some browsers block localStorage in private mode.

---

## 🚫 Common Error Messages

### **"Failed to load module specifier"**
**Cause:** Not using a local server  
**Fix:** Use `LAUNCH_GAME_NOW.bat`

### **"Cannot read property of undefined"**
**Cause:** JavaScript file missing or failed to load  
**Fix:** Check all .js files exist in `js/` folder

### **"CORS policy blocked"**
**Cause:** Opening index.html directly  
**Fix:** Use local server (localhost:8000)

### **"THREE is not defined"**
**Cause:** THREE.js CDN failed to load  
**Fix:** Check internet connection, or use local THREE.js

---

## 📊 Debug Information

### **View Console Logs**
Press **F12** → Console tab

Look for these messages:
- ✅ Green = Success
- 🔵 Blue = Info
- ⚠️ Yellow = Warning
- ❌ Red = Error

### **Check Network Tab**
F12 → Network tab → Reload

Failed requests appear in red.

---

## 🆘 Still Not Working?

### **Collect Debug Info:**
1. Browser name and version
2. Operating system
3. Console error messages
4. Network tab status
5. Steps that lead to the issue

### **Quick Reset:**
1. Close browser completely
2. Delete browser cache
3. Restart computer
4. Run `LAUNCH_GAME_NOW.bat`

---

## ✅ Checklist Before Asking for Help

- [ ] Using local server (not file://)
- [ ] Browser console checked (F12)
- [ ] All files exist in correct folders
- [ ] Cache cleared (Ctrl+Shift+Delete)
- [ ] Tried different browser
- [ ] Graphics settings set to Low
- [ ] Keyboard fallback enabled
- [ ] Camera permission granted
- [ ] Internet connection active (for CDN)

---

## 🎯 Known Limitations (v0.13)

1. ⚠️ Gesture detection is simulated (not real MediaPipe)
2. ⚠️ No sound effects or music
3. ⚠️ Basic track (single ground plane)
4. ⚠️ No AI opponents
5. ⚠️ Simple collision detection

These will be addressed in future updates!

---

**Still stuck?** Check the browser console for specific error messages and refer to the solutions above.

**Game working?** Enjoy racing! 🏁🎮
