# How to Start EcoMart
wwwwwww
## Quick Start

### Option 1: Using Batch Files (Easiest)
1. Double-click `START_BACKEND.bat` to start the backend server
2. Open `frontend/consumer_home.html` with Live Server in VS Code

### Option 2: Using Command Line

**Terminal 1 - Backend:**
```bash
cd Website2/backend
npm start
```

**Terminal 2 - Frontend:**
Open `Website2/frontend/consumer_home.html` with Live Server extension in VS Code

## Important Notes

### ⚠️ Common Mistakes

**DON'T do this:**
```bash
cd Website2
npm start  # ❌ This will fail - no package.json here
```

**DO this instead:**
```bash
cd Website2/backend
npm start  # ✅ Correct - package.json is in backend folder
```

### Backend Server
- **Location:** `Website2/backend/`
- **Command:** `npm start` (from backend folder)
- **Port:** 5000
- **URL:** http://10.100.8.238:5000

### Frontend
- **Location:** `Website2/frontend/`
- **Method:** Use Live Server extension in VS Code
- **Port:** 3000 (or whatever Live Server assigns)
- **URL:** http://10.100.8.238:3000

## Checking if Backend is Running

Open browser and go to:
```
http://10.100.8.238:5000/api/health
```

You should see:
```json
{"status":"OK","timestamp":"2024-..."}
```

## Stopping the Servers

### Backend
- Press `Ctrl+C` in the terminal where backend is running

### Frontend (Live Server)
- Click "Port: 3000" in VS Code status bar and select "Stop Live Server"

## Troubleshooting

### "Port 5000 already in use"
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace XXXX with PID from above)
taskkill /F /PID XXXX
```

### "Cannot find module"
```bash
cd Website2/backend
npm install
```

### Images not loading
1. Make sure backend is running on port 5000
2. Check browser console for errors
3. Open `frontend/test-image-loading.html` to test images
4. Verify CORS is working (no CORS errors in console)

## Test Accounts

### Buyer Account
- Email: buyer@example.com
- Password: password123

### Seller Account
- Email: seller@example.com
- Password: password123

## Pages to Access

### For Buyers
- Home/Shop: `consumer_home.html`
- Orders: `orders.html`
- Checkout: `checkout.html`
- Account: `account.html`

### For Sellers
- Dashboard: `seller_dashboard.html`

### Testing
- Image Loading Test: `test-image-loading.html`
- Debug Images: `debug-image-urls.html`
