@echo off
echo ========================================
echo   EcoMart Backend Restart Script
echo ========================================
echo.

echo [1/3] Stopping any existing server on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo       Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo [2/3] Waiting for port to be released...
timeout /t 1 /nobreak >nul

echo [3/3] Starting backend server...
echo.
cd /d "%~dp0backend"
node server.js
