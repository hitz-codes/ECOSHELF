# 🚀 Quick Database Setup for EcoMart

## Option 1: MongoDB Atlas (Cloud) - Fastest Setup ⭐

### Step 1: Create Free MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and sign up
3. Verify your email

### Step 2: Create Database
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select any cloud provider/region
4. Click "Create Cluster" (wait 2-3 minutes)

### Step 3: Create User & Get Connection String
1. **Database Access** → "Add New Database User"
   - Username: `ecomart`
   - Password: `password123` (or your choice)
   - Permissions: "Read and write to any database"

2. **Network Access** → "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)

3. **Clusters** → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `ecomart`

### Step 4: Setup Backend
```bash
cd ESCN-main/PROTOTYPES/ESCN/Website2/backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb+srv://ecomart:password123@cluster0.xxxxx.mongodb.net/ecomart?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_random_12345
PORT=5000
NODE_ENV=development
```

### Step 5: Initialize Database
```bash
npm run setup-db
```

### Step 6: Start Server
```bash
npm run dev
```

---

## Option 2: Local MongoDB (If you want local database)

### For Windows (Easiest Method):
1. **Run PowerShell as Administrator**
2. **Navigate to project folder**:
   ```powershell
   cd "C:\path\to\your\ESCN-main\PROTOTYPES\ESCN\Website2"
   ```
3. **Run installation script**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\install-mongodb-windows.ps1
   ```

### Manual Windows Installation:
1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Run installer, choose "Complete" installation
3. Install as Windows Service
4. Add `C:\Program Files\MongoDB\Server\7.0\bin` to PATH

### For Mac:
```bash
# Install Homebrew if needed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### For Linux:
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

---

## 🎯 Complete Setup Commands (After MongoDB is Ready)

```bash
# 1. Navigate to backend
cd ESCN-main/PROTOTYPES/ESCN/Website2/backend

# 2. Install dependencies
npm install

# 3. Setup database (interactive wizard)
npm run setup-db

# 4. Start the server
npm run dev
```

## 🧪 Test Your Setup

### Backend Test:
1. Server should show: `✅ Connected to MongoDB`
2. Visit: http://localhost:5000/api/health
3. Should return: `{"status":"OK","timestamp":"..."}`

### Frontend Test:
1. Open `frontend/index.html` in browser (or use Live Server)
2. Try signing up as a buyer: `test@example.com / password123`
3. Login and browse products

### Sample Accounts (Created Automatically):
- **Buyer**: buyer@example.com / password123
- **Seller**: seller@example.com / password123

---

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
**Atlas**: Check connection string and network access
**Local**: Ensure MongoDB service is running:
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

### "Port 5000 already in use"
Change PORT in `.env` file to 5001 or another port

### "CORS Error" in browser
Make sure backend is running on port 5000 and frontend is served properly

### Database is empty
Run: `npm run init-db` to add sample data

---

## 📊 Database Management

### View Database Stats:
```bash
npm run db-stats
```

### Reset Database:
```bash
npm run init-db
```

### MongoDB Compass (GUI):
- Download from [MongoDB Compass](https://www.mongodb.com/products/compass)
- Connect with your MongoDB URI
- Browse data visually

---

## 🚀 Production Deployment

### Backend (Heroku):
1. Create Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy via Git

### Frontend (Netlify):
1. Upload frontend folder to Netlify
2. Update `api.js` with production backend URL

---

## 📞 Need Help?

### Check Logs:
- Backend: Look at terminal where `npm run dev` is running
- Frontend: Open browser Developer Tools → Console

### Common Issues:
1. **MongoDB not installed**: Use MongoDB Atlas (cloud option)
2. **Port conflicts**: Change PORT in .env file
3. **CORS errors**: Ensure backend is running on correct port
4. **Authentication errors**: Check JWT_SECRET in .env file

### Quick Health Check:
```bash
# Test MongoDB connection
node -e "require('mongoose').connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomart').then(() => console.log('✅ DB OK')).catch(err => console.log('❌ DB Error:', err.message))"

# Test server
curl http://localhost:5000/api/health
```

---

**🎉 Once everything is working, you'll have a complete ecommerce platform with user authentication, product management, shopping cart, and order processing!**