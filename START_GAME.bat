@echo off
echo ========================================
echo    GestureX Racing v0.13
echo    Starting Local Server...
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting Python HTTP Server...
    echo.
    echo Game will be available at:
    echo http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    start http://localhost:8000
    python -m http.server 8000
) else (
    echo Python not found. Trying Node.js...
    node --version >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Starting Node.js HTTP Server...
        echo.
        echo Game will be available at:
        echo http://localhost:8000
        echo.
        start http://localhost:8000
        npx http-server -p 8000
    ) else (
        echo.
        echo ERROR: Neither Python nor Node.js found!
        echo.
        echo Please install one of the following:
        echo   - Python: https://www.python.org/downloads/
        echo   - Node.js: https://nodejs.org/
        echo.
        echo Or open index.html directly in your browser.
        echo.
        pause
    )
)
