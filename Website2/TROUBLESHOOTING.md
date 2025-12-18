# 🔧 EcoMart Troubleshooting Guide

## "Network error. Please check your connection and try again."

This error occurs when the frontend cannot connect to the backend server. Here's how to fix it:

### Step 1: Check Backend Server Status

1. **Open PowerShell/Terminal**
2. **Navigate to backend folder**:
   ```powershell
   cd "ESCN-main\PROTOTYPES\ESCN\Website2\backend"
   ```
3. **Check if server is running**:
   ```powershell
   npm run dev
   ```

You should see:
```
✅ Connected to MongoDB
Server running on port 5000
📊 Database Stats (mongodb) - Users: 3, Products: 8, Orders: 1
```

### Step 2: Test Backend API

1. **Open new PowerShell window**
2. **Test health endpoint**:
   ```powershell
   curl http://localhost:5000/api/health
   ```

Should return: `{"status":"OK","timestamp":"..."}`

### Step 3: Test Frontend Connection

1. **Open browser**
2. **Navigate to**: `frontend/test-connection.html`
3. **Click "Test Health Endpoint"**
4. **Should show**: ✅ Health endpoint working!

### Step 4: Fix Common Issues

#### Issue: "ECONNREFUSED" or "Cannot connect"
**Solution**: Backend server is not running
```powershell
cd backend
npm run dev
```

#### Issue: "CORS Error" in browser console
**Solution**: Updated CORS configuration (already fixed)
- Backend now accepts connections from any localhost port

#### Issue: "Port 5000 already in use"
**Solution**: Change port in `.env` file
```env
PORT=5001
```
Then update frontend `api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

#### Issue: Database connection failed
**Solution**: Database is not initialized
```powershell
cd backend
node database/init-db.js
```

---

## Registration/Login Issues

### "Validation failed" Errors

#### Mobile Number Validation
- **Error**: "Valid mobile number required"
- **Solution**: Use 10-15 digit numbers (no special characters)
- **Examples**: `1234567890`, `9876543210`

#### Email Validation
- **Error**: "Valid email required"
- **Solution**: Use proper email format
- **Examples**: `user@example.com`, `test@gmail.com`

#### Password Issues
- **Error**: "Password must be at least 6 characters"
- **Solution**: Use passwords with 6+ characters
- **Error**: "Passwords do not match"
- **Solution**: Ensure password and confirm password are identical

### "User already exists"
- **Solution**: Use a different email address
- **Or**: Use existing account to login

---

## Database Issues

### Empty Database (No Products Showing)
```powershell
cd backend
node database/init-db.js
```

### MongoDB Connection Issues

#### Local MongoDB Not Installed
**Option 1 - Use MongoDB Atlas (Cloud)**:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Get connection string
4. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecomart
   ```

**Option 2 - Install MongoDB Locally**:
```powershell
# Run as Administrator
.\install-mongodb-windows.ps1
```

### Database Stats Show 0 Users/Products
```powershell
cd backend
node database/init-db.js
npm run dev
```

---

## Frontend Issues

### Images Not Loading
- **Issue**: Product images show placeholder
- **Solution**: Images are loaded from external URLs (Unsplash)
- **Check**: Internet connection

### Shopping Cart Not Working
- **Issue**: Items not adding to cart
- **Solution**: Ensure JavaScript is enabled
- **Check**: Browser console for errors

### Login Redirects Not Working
- **Issue**: After login, page doesn't redirect
- **Solution**: Check browser console for errors
- **Ensure**: Backend is returning proper response

---

## Quick Diagnostic Commands

### Test Backend Health
```powershell
curl http://localhost:5000/api/health
```

### Test Database Connection
```powershell
cd backend
node -e "require('mongoose').connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomart').then(() => console.log('✅ DB Connected')).catch(err => console.log('❌ DB Error:', err.message))"
```

### Check Database Stats
```powershell
cd backend
npm run db-stats
```

### Reset Database
```powershell
cd backend
node database/init-db.js
```

---

## Complete Reset (Nuclear Option)

If nothing works, try this complete reset:

```powershell
# 1. Stop all Node processes
Get-Process -Name "node" | Stop-Process -Force

# 2. Navigate to backend
cd "ESCN-main\PROTOTYPES\ESCN\Website2\backend"

# 3. Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install

# 4. Reset database
node database/init-db.js

# 5. Start server
npm run dev
```

---

## Test Accounts (After Database Init)

- **Buyer**: buyer@example.com / password123
- **Seller 1**: seller@example.com / password123
- **Seller 2**: seller2@example.com / password123

---

## Getting Help

### Check Logs
1. **Backend logs**: Look at terminal where `npm run dev` is running
2. **Frontend logs**: Open browser Developer Tools → Console (F12)

### Common Log Messages

#### ✅ Good Signs:
- `✅ Connected to MongoDB`
- `Server running on port 5000`
- `📊 Database Stats - Users: 3, Products: 8`

#### ❌ Problem Signs:
- `ECONNREFUSED`
- `MongoNetworkError`
- `CORS error`
- `ValidationError`

### Still Having Issues?

1. **Check all steps above**
2. **Ensure both backend and frontend are running**
3. **Try the test connection page**: `frontend/test-connection.html`
4. **Check browser network tab** for failed requests
5. **Verify `.env` file** has correct settings

---

## Production Deployment Notes

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
PORT=5000
```

### CORS for Production
Update `server.js` with your production domain:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://yourdomain.com'] 
  : [/* development origins */]
```

### Security Checklist
- [ ] Use strong JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Restrict CORS to specific domains
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Set up proper error logging