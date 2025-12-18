# 🚀 Render Deployment Guide - Manual Configuration

If the automatic render.yaml deployment isn't working, follow these manual steps:

## 1. Create New Web Service

1. Go to [Render Dashboard](https://render.com/dashboard)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `hitz-codes/ECOSHELF`

## 2. Configure Service Settings

### Basic Settings:
```
Name: ecoshelf-backend
Region: Oregon (US West)
Branch: main
Runtime: Node
```

### Build & Deploy Settings:
```
Root Directory: (leave empty)
Build Command: npm install && cd backend && npm install
Start Command: node server.js
```

### Advanced Settings:
```
Auto-Deploy: Yes
```

## 3. Environment Variables

Add these in the Environment section:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your-username:password@cluster.mongodb.net/ecomart
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
```

## 4. Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Check logs for any errors

## 5. Test Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-render-url.onrender.com/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

## 6. Update Frontend

After successful deployment, update the API URL in `Website2/frontend/api.js`:

```javascript
// Replace this line:
return 'https://ecoshelf-backend.onrender.com/api';

// With your actual Render URL:
return 'https://your-actual-render-url.onrender.com/api';
```

## Troubleshooting

### Common Issues:

1. **Module not found errors**
   - Ensure build command includes: `cd backend && npm install`
   - Check that all dependencies are in backend/package.json

2. **Port binding errors**
   - Ensure PORT environment variable is set
   - Server should listen on `process.env.PORT || 5000`

3. **Database connection errors**
   - Verify MONGODB_URI is correct
   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0

4. **CORS errors**
   - Update CORS origins in backend/server.js
   - Add your Vercel frontend URL

### Logs Location:
- Go to your service dashboard
- Click "Logs" tab to see real-time deployment logs

### Manual Redeploy:
- Go to service dashboard
- Click "Manual Deploy" → "Deploy latest commit"