// Debug helper to show loading progress
export function showDebugInfo(message, type = 'info') {
    const colors = {
        info: '#3498db',
        success: '#2ecc71',
        error: '#e74c3c',
        warning: '#f39c12'
    };
    
    console.log(`%c${message}`, `color: ${colors[type]}; font-weight: bold;`);
}

export function createErrorOverlay(error) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        font-family: 'Courier New', monospace;
        padding: 40px;
    `;
    
    overlay.innerHTML = `
        <div style="max-width: 800px; text-align: left;">
            <h1 style="color: #e74c3c; font-size: 32px; margin-bottom: 20px;">⚠️ Loading Error</h1>
            <p style="font-size: 18px; margin-bottom: 20px;">The game encountered an error while loading:</p>
            <div style="background: #000; padding: 20px; border-radius: 8px; margin-bottom: 20px; overflow-x: auto;">
                <pre style="margin: 0; color: #e74c3c;">${error.toString()}</pre>
            </div>
            <h3 style="color: #f39c12; margin-bottom: 10px;">Common Solutions:</h3>
            <ul style="font-size: 16px; line-height: 1.8;">
                <li>✓ Make sure you're running on a local server (http://localhost:8000)</li>
                <li>✓ Don't open index.html directly (file:// won't work)</li>
                <li>✓ Check browser console (F12) for more details</li>
                <li>✓ Try a different browser (Chrome or Edge recommended)</li>
                <li>✓ Clear browser cache and reload</li>
            </ul>
            <button onclick="location.reload()" style="
                margin-top: 30px;
                padding: 15px 30px;
                font-size: 18px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
            ">Reload Page</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}
