# Quick setup script for EcoMart with MongoDB Atlas
Write-Host "🚀 EcoMart Quick Setup" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green

Write-Host ""
Write-Host "Since MongoDB is not installed locally, let's use MongoDB Atlas (cloud database)." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Please follow these steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open your browser and go to: https://www.mongodb.com/atlas" -ForegroundColor White
Write-Host "2. Click 'Try Free' and create an account" -ForegroundColor White
Write-Host "3. Create a FREE cluster (M0 Sandbox)" -ForegroundColor White
Write-Host "4. Create a database user: username=ecomart, password=ecomart123" -ForegroundColor White
Write-Host "5. Allow network access from anywhere (0.0.0.0/0)" -ForegroundColor White
Write-Host "6. Get your connection string" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Have you completed the Atlas setup? (y/n)"

if ($continue -eq 'y') {
    Write-Host ""
    Write-Host "Great! Now let's update your .env file..." -ForegroundColor Green
    
    $connectionString = Read-Host "Please paste your MongoDB Atlas connection string here"
    
    if ($connectionString) {
        # Ensure the connection string has the database name
        if (-not $connectionString.Contains("/ecomart")) {
            $connectionString = $connectionString -replace "\?", "/ecomart?"
        }
        
        # Update .env file
        $envPath = "backend\.env"
        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath
            $newContent = $envContent -replace "MONGODB_URI=.*", "MONGODB_URI=$connectionString"
            $newContent | Set-Content $envPath
            
            Write-Host "✅ Updated .env file with your Atlas connection string" -ForegroundColor Green
        } else {
            Write-Host "❌ .env file not found. Creating one..." -ForegroundColor Red
            
            $envContent = @"
MONGODB_URI=$connectionString
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0
PORT=5000
NODE_ENV=development
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
"@
            $envContent | Set-Content $envPath
            Write-Host "✅ Created .env file" -ForegroundColor Green
        }
        
        # Test connection and initialize database
        Write-Host ""
        Write-Host "🔄 Testing connection and initializing database..." -ForegroundColor Yellow
        
        Set-Location "backend"
        
        try {
            node database/init-db.js
            Write-Host ""
            Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🚀 Starting the server..." -ForegroundColor Green
            Write-Host "   Backend will be available at: http://localhost:5000" -ForegroundColor Cyan
            Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
            Write-Host ""
            
            npm run dev
        } catch {
            Write-Host "❌ Database initialization failed. Please check your connection string." -ForegroundColor Red
        }
    }
} else {
    Write-Host ""
    Write-Host "📖 Please complete the MongoDB Atlas setup first." -ForegroundColor Yellow
    Write-Host "   Detailed instructions are in: setup-atlas.md" -ForegroundColor Cyan
    Write-Host "   Then run this script again." -ForegroundColor Cyan
}