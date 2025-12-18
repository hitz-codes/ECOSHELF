# Script to restart the backend server
Write-Host "🔄 Restarting EcoMart Backend Server..." -ForegroundColor Green

# Navigate to backend directory
Set-Location "backend"

# Check if server is already running and kill it
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" }
if ($processes) {
    Write-Host "🛑 Stopping existing server processes..." -ForegroundColor Yellow
    $processes | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Start the server
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Write-Host "   Backend will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev