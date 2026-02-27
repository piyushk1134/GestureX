@echo off
cls
color 0A
echo.
echo ========================================
echo    GestureX Racing v0.13
echo    Quick Launcher
echo ========================================
echo.
echo Starting game server...
echo.

REM Try Python first
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python found
    echo [INFO] Starting server on http://localhost:8000
    echo.
    echo ========================================
    echo  Opening browser in 3 seconds...
    echo  Press Ctrl+C to stop the server
    echo ========================================
    echo.
    
    REM Wait 2 seconds then open browser
    timeout /t 2 /nobreak >nul
    start http://localhost:8000
    
    REM Start server
    cd /d "%~dp0"
    python -m http.server 8000
    goto :end
)

REM Try Node.js if Python not found
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js found
    echo [INFO] Starting server on http://localhost:8000
    echo.
    
    timeout /t 2 /nobreak >nul
    start http://localhost:8000
    
    cd /d "%~dp0"
    npx http-server -p 8000
    goto :end
)

REM Neither found
echo [ERROR] Neither Python nor Node.js found!
echo.
echo Please install one of:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
echo OR try opening index.html directly (may not work for 3D models)
echo.
pause
goto :end

:end
