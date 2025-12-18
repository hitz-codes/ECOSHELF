# 🚀 Quick MongoDB Atlas Setup (5 minutes)

## Step 1: Create Free Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free"
3. Sign up with email/Google/GitHub
4. Verify your email

## Step 2: Create Database
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox - $0/month)
3. Select any cloud provider (AWS/Google/Azure)
4. Choose region closest to you
5. Cluster Name: `ecomart-cluster` (or any name)
6. Click "Create Cluster" (takes 2-3 minutes)

## Step 3: Create Database User
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Authentication Method: **Password**
4. Username: `ecomart`
5. Password: `ecomart123` (or your choice)
6. Database User Privileges: **Read and write to any database**
7. Click "Add User"

## Step 4: Allow Network Access
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Clusters" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string
6. It looks like: `mongodb+srv://ecomart:<password>@ecomart-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## Step 6: Update Your .env File
Replace the connection string in your `.env` file:

```env
# Replace this line:
MONGODB_URI=mongodb://localhost:27017/ecomart

# With your Atlas connection string:
MONGODB_URI=mongodb+srv://ecomart:ecomart123@ecomart-cluster.xxxxx.mongodb.net/ecomart?retryWrites=true&w=majority
```

**Important**: Replace `<password>` with your actual password and add `/ecomart` before the `?` to specify the database name.

## Step 7: Test Connection
```powershell
cd backend
node database/init-db.js
```

Should show: ✅ Connected to MongoDB and create sample data.

## Step 8: Start Your Server
```powershell
npm run dev
```

🎉 **Done! Your database is now in the cloud and accessible from anywhere!**