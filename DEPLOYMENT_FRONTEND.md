# CareerCraft Frontend Deployment Guide

## Deploy to Vercel

### Step 1: Update API URL
Before deploying, update the API base URL in your frontend.

In `career-craft-frontend/src/services/api.js`, the baseURL should point to your Render backend URL.

### Step 2: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `muneeb-codehub/CareerCraft`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `career-craft-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Environment Variables (Optional)
If you want to use environment variables for API URL:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 4: Deploy
- Click "Deploy"
- Wait for build (2-3 minutes)
- Get your frontend URL (e.g., `https://careercraft.vercel.app`)

### Step 5: Update Backend CORS
After deployment, update your backend's CORS settings to allow your Vercel frontend URL.

## Production Checklist
- ✅ Backend deployed on Render
- ✅ Frontend deployed on Vercel
- ✅ MongoDB Atlas configured
- ✅ Environment variables set
- ✅ CORS configured
- ✅ API URL updated in frontend
- ✅ Test all features
