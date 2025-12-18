# MongoDB Setup Guide for EcoMart

## Option 1: MongoDB Atlas (Cloud) - Recommended for Beginners

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

### Step 2: Create a Cluster
1. Choose "Build a Database"
2. Select "FREE" tier (M0 Sandbox)
3. Choose your preferred cloud provider and region
4. Name your cluster (e.g., "ecomart-cluster")
5. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username: `ecomart-user`
5. Set password: `your-secure-password` (save this!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, use specific IP addresses
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `ecomart`

Example connection string:
```
mongodb+srv://ecomart-user:your-secure-password@ecomart-cluster.abc123.mongodb.net/ecomart?retryWrites=true&w=majority
```

### Step 6: Update .env File
```env
MONGODB_URI=mongodb+srv://ecomart-user:your-secure-password@ecomart-cluster.abc123.mongodb.net/ecomart?retryWrites=true&w=majority
```

---

## Option 2: Local MongoDB Installation

### Windows
1. **Download MongoDB Community Server**
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select "Windows" and "msi" package
   - Download and run the installer

2. **Installation Steps**
   - Run the .msi file as Administrator
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```cmd
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```cmd
   net start MongoDB
   ```

### macOS
1. **Using Homebrew (Recommended)**
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start MongoDB
   brew services start mongodb/brew/mongodb-community
   ```

2. **Manual Installation**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Extract and follow installation instructions

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Verify Local Installation
```bash
# Check if MongoDB is running
mongod --version

# Connect to MongoDB shell
mongosh
# or for older versions:
mongo
```

---

## Quick Setup Commands

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env file with your MongoDB URI
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/ecomart
# For Local: mongodb://localhost:27017/ecomart
```

### 3. Initialize Database
```bash
# Interactive setup wizard
npm run setup-db

# Or direct initialization with sample data
npm run init-db
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## Troubleshooting

### Connection Issues

#### "MongoNetworkError: failed to connect to server"
- **Atlas**: Check network access settings and connection string
- **Local**: Ensure MongoDB service is running

#### "Authentication failed"
- **Atlas**: Verify username/password in connection string
- **Local**: Check if authentication is enabled

#### "Database does not exist"
- MongoDB creates databases automatically when first document is inserted
- Run `npm run init-db` to create sample data

### Common Commands

```bash
# Check database stats
npm run db-stats

# Reinitialize database with fresh sample data
npm run init-db

# Test connection only
node -e "require('mongoose').connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomart').then(() => console.log('✅ Connected')).catch(err => console.log('❌ Failed:', err.message))"
```

### MongoDB Compass (GUI Tool)
- Download from [MongoDB Compass](https://www.mongodb.com/products/compass)
- Connect using your MongoDB URI
- Browse collections, run queries, and manage data visually

---

## Database Schema Overview

### Collections Created:
- **users** - Buyer and seller accounts
- **products** - Product listings with expiry dates
- **orders** - Purchase orders and tracking

### Sample Data Includes:
- 3 test users (1 buyer, 2 sellers)
- 8 sample products with different categories and expiry dates
- 1 completed order for testing

### Test Accounts:
- **Buyer**: buyer@example.com / password123
- **Seller 1**: seller@example.com / password123  
- **Seller 2**: seller2@example.com / password123

---

## Production Considerations

### Security
- Use specific IP addresses in Network Access (not 0.0.0.0/0)
- Use strong passwords for database users
- Enable MongoDB authentication
- Use environment variables for sensitive data

### Performance
- Create appropriate indexes (handled automatically)
- Monitor database performance
- Set up database backups
- Consider connection pooling for high traffic

### Monitoring
- Use MongoDB Atlas monitoring tools
- Set up alerts for performance issues
- Monitor disk usage and connection limits