# 📋 Manual Setup Guide - No MongoDB Installation Required

Since MongoDB is not installed on your system, let's use **MongoDB Atlas** (free cloud database). This is actually better than local installation!

## 🚀 Step-by-Step Setup (10 minutes)

### Step 1: Create MongoDB Atlas Account
1. **Open browser** and go to: https://www.mongodb.com/atlas
2. **Click "Try Free"**
3. **Sign up** with email or Google account
4. **Verify your email** (check inbox)

### Step 2: Create Free Database
1. **Click "Build a Database"**
2. **Choose "M0 FREE"** (the free tier)
3. **Select any cloud provider** (AWS/Google/Azure - doesn't matter)
4. **Choose region** closest to you
5. **Cluster Name**: `ecomart-cluster` (or any name you like)
6. **Click "Create Cluster"** (takes 2-3 minutes)

### Step 3: Create Database User
1. **Go to "Database Access"** (left sidebar)
2. **Click "Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `ecomart`
5. **Password**: `ecomart123`
6. **Database User Privileges**: "Read and write to any database"
7. **Click "Add User"**

### Step 4: Allow Network Access
1. **Go to "Network Access"** (left sidebar)
2. **Click "Add IP Address"**
3. **Click "Allow access from anywhere"** (0.0.0.0/0)
4. **Click "Confirm"**

### Step 5: Get Connection String
1. **Go to "Clusters"** (left sidebar)
2. **Click "Connect"** on your cluster
3. **Choose "Connect your application"**
4. **Driver**: Node.js, **Version**: 4.1 or later
5. **Copy the connection string**

It will look like:
```
mongodb+srv://ecomart:<password>@ecomart-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 6: Update Your Project
1. **Open your project folder**: `ESCN-main\PROTOTYPES\ESCN\Website2\backend`
2. **Open the `.env` file** in a text editor
3. **Replace the MongoDB line**:

**Change this:**
```env
MONGODB_URI=mongodb://localhost:27017/ecomart
```

**To this (use YOUR connection string):**
```env
MONGODB_URI=mongodb+srv://ecomart:ecomart123@ecomart-cluster.xxxxx.mongodb.net/ecomart?retryWrites=true&w=majority
```

**Important**: 
- Replace `<password>` with `ecomart123`
- Add `/ecomart` before the `?` to specify database name
- Replace `xxxxx` with your actual cluster ID

### Step 7: Initialize Database
1. **Open PowerShell**
2. **Navigate to backend folder**:
   ```powershell
   cd "C:\Users\hithaishi hrushikesh\Downloads\ESCN-main (1)\ESCN-main\PROTOTYPES\ESCN\Website2\backend"
   ```
3. **Initialize database with sample data**:
   ```powershell
   node database/init-db.js
   ```

You should see:
```
✅ Connected to MongoDB
👥 Users created: 3
📦 Products created: 8
🛒 Orders created: 1
```

### Step 8: Start Backend Server
```powershell
npm run dev
```

You should see:
```
✅ Connected to MongoDB
Server running on port 5000
📊 Database Stats (mongodb) - Users: 3, Products: 8, Orders: 1
```

### Step 9: Test Your Website
1. **Open browser**
2. **Navigate to your frontend folder**
3. **Open `index.html`** (or use Live Server in VS Code)
4. **Try creating an account** - should work now!

## 🔐 Test Accounts Created
- **Buyer**: buyer@example.com / password123
- **Seller**: seller@example.com / password123

## ✅ What You Now Have
- ✅ Cloud database (accessible from anywhere)
- ✅ 3 test user accounts
- ✅ 8 sample products with expiry dates
- ✅ 1 sample order
- ✅ Working backend API
- ✅ No local MongoDB installation needed!

## 🆘 If Something Goes Wrong

### Connection String Issues
Make sure your connection string:
- Has the correct password (replace `<password>`)
- Includes `/ecomart` before the `?`
- Doesn't have extra spaces

**Example of correct format:**
```
mongodb+srv://ecomart:ecomart123@cluster0.abc123.mongodb.net/ecomart?retryWrites=true&w=majority
```

### Network Access Issues
- Make sure you added IP address `0.0.0.0/0` in Network Access
- Wait a few minutes for changes to take effect

### Database User Issues
- Username: `ecomart`
- Password: `ecomart123`
- Permissions: "Read and write to any database"

## 🎉 Advantages of MongoDB Atlas
- ✅ No local installation required
- ✅ Automatic backups
- ✅ Always accessible
- ✅ Free tier (512MB storage)
- ✅ Professional database hosting
- ✅ Built-in monitoring

Your database is now in the cloud and much more reliable than a local installation!