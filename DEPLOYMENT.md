# 🚀 EcoShelf Deployment Guide

## Architecture
- **Frontend**: Vercel (Static hosting)
- **Backend**: Render (Node.js server)
- **Database**: MongoDB Atlas (Cloud)

## 📋 Deployment Steps

### 1. Backend Deployment (Render)

1. **Go to [Render Dashboard](https://render.com)**
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Connect your GitHub repository: `hitz-codes/ECOSHELF`
   - Choose "Web Service"

3. **Configure Service**
   ```
   Name: ecoshelf-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: Website2/backend
   Runtime: Node
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecomart
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
   PORT=10000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://ecoshelf-backend.onrender.com`

### 2. Frontend Deployment (Vercel)

1. **Update API URL**
   - In `Website2/frontend/api.js`, update the Render URL:
   ```javascript
   return 'https://your-actual-render-url.onrender.com/api';
   ```

2. **Go to [Vercel Dashboard](https://vercel.com)**
   - Sign up/Login with GitHub

3. **Import Project**
   - Click "New Project"
   - Import `hitz-codes/ECOSHELF`
   - Vercel auto-detects configuration

4. **Configure Build**
   ```
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty)
   Output Directory: Website2/frontend
   Install Command: (leave empty)
   ```

5. **Deploy**
   - Click "Deploy"
   - Get your frontend URL: `https://ecoshelf-xyz.vercel.app`

### 3. Update CORS (Important!)

After getting your Vercel URL, update backend CORS:

1. **In Render Dashboard**
   - Go to your backend service
   - Environment → Add Variable:
   ```
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   ```

2. **Or update server.js** and redeploy:
   ```javascript
   origin: [
     'https://your-actual-vercel-url.vercel.app'
   ]
   ```

## 🔧 Environment Variables

### Backend (Render)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=10000
```

### Frontend (Vercel)
No environment variables needed - API URL is hardcoded.

## 🧪 Testing

1. **Backend Health Check**
   ```
   GET https://your-render-url.onrender.com/api/health
   ```

2. **Frontend**
   ```
   https://your-vercel-url.vercel.app
   ```

3. **Test Login**
   - Buyer: buyer@example.com / password123
   - Seller: seller@example.com / password123

## 📝 Notes

- **Render Free Tier**: Service sleeps after 15 minutes of inactivity
- **Cold Starts**: First request after sleep takes 30-60 seconds
- **MongoDB Atlas**: Ensure IP whitelist includes 0.0.0.0/0 for Render
- **HTTPS Only**: Both services use HTTPS in production

## 🔄 Auto-Deployment

- **Backend**: Auto-deploys on push to main branch
- **Frontend**: Auto-deploys on push to main branch

## 🐛 Troubleshooting

### Backend Issues
- Check Render logs in dashboard
- Verify environment variables
- Test MongoDB connection

### Frontend Issues
- Check browser console for API errors
- Verify API URL in api.js
- Check CORS configuration

### CORS Errors
- Update backend CORS origins
- Ensure HTTPS URLs match exactly
- Check for trailing slashes