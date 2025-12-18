# MongoDB Installation Script for Windows
# Run this script as Administrator in PowerShell

Write-Host "🚀 EcoMart MongoDB Installation Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if MongoDB is already installed
try {
    $mongoVersion = mongod --version 2>$null
    if ($mongoVersion) {
        Write-Host "✅ MongoDB is already installed!" -ForegroundColor Green
        Write-Host "Version: $($mongoVersion[0])" -ForegroundColor Cyan
        
        $continue = Read-Host "Do you want to continue with database setup? (y/n)"
        if ($continue -ne 'y') {
            exit 0
        }
    }
} catch {
    Write-Host "📦 MongoDB not found. Starting installation..." -ForegroundColor Yellow
}

# Function to download file
function Download-File {
    param (
        [string]$Url,
        [string]$OutputPath
    )
    
    try {
        Write-Host "⬇️  Downloading from: $Url" -ForegroundColor Cyan
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
        return $true
    } catch {
        Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Create temp directory
$tempDir = "$env:TEMP\mongodb-install"
if (!(Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

Write-Host "📁 Using temp directory: $tempDir" -ForegroundColor Cyan

# MongoDB download URL (Community Server 7.0)
$mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.4-signed.msi"
$mongoInstaller = "$tempDir\mongodb-installer.msi"

Write-Host "⬇️  Downloading MongoDB Community Server..." -ForegroundColor Yellow
if (!(Download-File -Url $mongoUrl -OutputPath $mongoInstaller)) {
    Write-Host "❌ Failed to download MongoDB installer" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Download completed!" -ForegroundColor Green

# Install MongoDB
Write-Host "🔧 Installing MongoDB..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Cyan

try {
    $installArgs = @(
        "/i", $mongoInstaller,
        "/quiet",
        "INSTALLLOCATION=`"C:\Program Files\MongoDB\Server\7.0\`"",
        "ADDLOCAL=`"ServerService,Client,MongoDBCompass`""
    )
    
    Start-Process -FilePath "msiexec.exe" -ArgumentList $installArgs -Wait -NoNewWindow
    Write-Host "✅ MongoDB installation completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB installation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Add MongoDB to PATH
$mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

if ($currentPath -notlike "*$mongoPath*") {
    Write-Host "🔧 Adding MongoDB to system PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$mongoPath", "Machine")
    $env:PATH += ";$mongoPath"
    Write-Host "✅ MongoDB added to PATH!" -ForegroundColor Green
}

# Start MongoDB service
Write-Host "🚀 Starting MongoDB service..." -ForegroundColor Yellow
try {
    Start-Service -Name "MongoDB" -ErrorAction Stop
    Write-Host "✅ MongoDB service started!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB service start failed. Trying alternative method..." -ForegroundColor Yellow
    try {
        net start MongoDB
        Write-Host "✅ MongoDB service started!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start MongoDB service" -ForegroundColor Red
        Write-Host "   You may need to start it manually from Services" -ForegroundColor Yellow
    }
}

# Verify installation
Write-Host "🔍 Verifying MongoDB installation..." -ForegroundColor Yellow
try {
    $mongoVersion = & "$mongoPath\mongod.exe" --version 2>$null
    if ($mongoVersion) {
        Write-Host "✅ MongoDB verification successful!" -ForegroundColor Green
        Write-Host "Version: $($mongoVersion[0])" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  MongoDB verification failed, but installation may still be successful" -ForegroundColor Yellow
}

# Clean up
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 MongoDB installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Close and reopen your terminal/PowerShell" -ForegroundColor White
Write-Host "   2. Navigate to your project backend folder" -ForegroundColor White
Write-Host "   3. Run: npm install" -ForegroundColor White
Write-Host "   4. Run: npm run setup-db" -ForegroundColor White
Write-Host "   5. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔧 MongoDB Compass (GUI) should also be installed for database management" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"