@echo off
echo Checking for existing server on port 5000...

REM Find and kill any process using port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Killing existing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo Starting EcoMart Backend Server...
node server.js
