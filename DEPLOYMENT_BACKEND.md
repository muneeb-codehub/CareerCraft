# CareerCraft Backend Deployment Guide

## Deploy to Render

### Step 1: Prepare MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if not already done)
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Get your connection string

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `muneeb-codehub/CareerCraft`
4. Configure:
   - **Name**: careercraft-backend
   - **Root Directory**: `CareerCraftBackend/server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Set Environment Variables
Add these in Render dashboard:
```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_string
GROQ_API_KEY=your_groq_api_key
```

### Step 4: Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Copy your backend URL (e.g., `https://careercraft-backend.onrender.com`)

## Next: Deploy Frontend
See frontend deployment guide for Vercel deployment.
