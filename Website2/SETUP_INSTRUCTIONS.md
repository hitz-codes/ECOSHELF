# EcoMart Setup Instructions

## Overview
EcoMart is a complete ecommerce platform for near-expiry products. This guide will help you set up both the frontend and backend.

## Prerequisites

### Required Software
1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one option:
   - **Local MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Cloud) - [Sign up here](https://www.mongodb.com/atlas)
3. **Git** (optional) - [Download here](https://git-scm.com/)

### Check if Node.js is installed
```bash
node --version
npm --version
```

## Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd ESCN-main/PROTOTYPES/ESCN/Website2/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up Environment Variables
1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Edit the `.env` file with your settings:
   ```env
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/ecomart
   
   # For MongoDB Atlas (replace with your connection string)
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecomart
   
   JWT_SECRET=your_super_secret_jwt_key_make_it_long_and_random
   PORT=5000
   NODE_ENV=development
   ```

### Step 4: Start MongoDB (if using local)
- **Windows**: Start MongoDB service or run `mongod`
- **Mac/Linux**: Run `sudo systemctl start mongod` or `mongod`

### Step 5: Start the Backend Server
```bash
# Development mode (auto-restarts on changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

## Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd ESCN-main/PROTOTYPES/ESCN/Website2/frontend
```

### Step 2: Serve the Frontend
You can use any of these methods:

#### Option A: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option B: Python HTTP Server
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

#### Option C: Node.js HTTP Server
```bash
# Install globally
npm install -g http-server

# Run in frontend directory
http-server -p 3000
```

#### Option D: Any other web server
Just serve the frontend folder on any port (e.g., 3000)

## Testing the Application

### 1. Open your browser and go to:
```
http://localhost:3000
```

### 2. Test the flow:
1. **Homepage**: Click "I'm a Seller" or "I'm a Buyer"
2. **Sign Up**: Create accounts for both seller and buyer
3. **Seller Dashboard**: Add some products with images
4. **Buyer Home**: Browse products, add to cart
5. **Checkout**: Complete a purchase

## MongoDB Atlas Setup (Cloud Database)

If you prefer using MongoDB Atlas instead of local MongoDB:

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account

### Step 2: Create Cluster
1. Create a new cluster (free tier is fine)
2. Choose a cloud provider and region
3. Wait for cluster to be created

### Step 3: Set Up Database Access
1. Go to "Database Access"
2. Add a new database user
3. Choose "Password" authentication
4. Set username and password
5. Give "Read and write to any database" permissions

### Step 4: Set Up Network Access
1. Go to "Network Access"
2. Add IP Address
3. Choose "Allow access from anywhere" (0.0.0.0/0) for development

### Step 5: Get Connection String
1. Go to "Clusters"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Update your `.env` file with this connection string

## Troubleshooting

### Backend Issues

#### "Cannot connect to MongoDB"
- **Local MongoDB**: Make sure MongoDB service is running
- **Atlas**: Check your connection string and network access settings

#### "Port 5000 already in use"
- Change the PORT in your `.env` file to a different number (e.g., 5001)

#### "JWT_SECRET is required"
- Make sure you have a `.env` file with JWT_SECRET set

### Frontend Issues

#### "Network error" when signing up/logging in
- Make sure the backend server is running on port 5000
- Check the browser console for CORS errors
- Verify the API_BASE_URL in `api.js` matches your backend URL

#### Images not uploading
- Make sure the `uploads` folder exists in the backend directory
- Check file size (max 5MB) and format (images only)

### CORS Issues
If you get CORS errors, make sure your frontend URL is added to the CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500'], // Add your frontend URL here
  credentials: true
}));
```

## Production Deployment

### Backend (Heroku example)
1. Create Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git or GitHub integration

### Frontend (Netlify example)
1. Build the frontend (if using a build process)
2. Deploy the `frontend` folder to Netlify
3. Update API_BASE_URL to your production backend URL

## Features Included

### User Management
- ✅ Buyer and Seller registration
- ✅ JWT authentication
- ✅ Profile management

### Product Management
- ✅ Add/edit/delete products
- ✅ Image upload
- ✅ Category filtering
- ✅ Expiry date tracking
- ✅ Search functionality

### Order Management
- ✅ Shopping cart
- ✅ Checkout process
- ✅ Order tracking
- ✅ Payment method selection

### Dashboard
- ✅ Seller dashboard with stats
- ✅ Product management interface
- ✅ Order management

## Support

If you encounter any issues:
1. Check the console logs (both browser and server)
2. Verify all environment variables are set correctly
3. Make sure all required services are running
4. Check the troubleshooting section above

## Next Steps

Once everything is working:
1. Add more products as a seller
2. Test the complete buyer journey
3. Customize the styling and branding
4. Add additional features as needed
5. Deploy to production when ready

Happy coding! 🚀