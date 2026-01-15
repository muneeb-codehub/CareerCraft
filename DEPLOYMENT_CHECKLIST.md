# 🚀 CareerCraft Deployment Checklist

## Prerequisites
- [ ] GitHub repository pushed (✅ Done)
- [ ] MongoDB Atlas account (create at https://www.mongodb.com/cloud/atlas)
- [ ] Render account (create at https://render.com)
- [ ] Vercel account (create at https://vercel.com)
- [ ] Groq API key ready

---

## Part 1: Backend Deployment on Render

### 1.1 Setup MongoDB Atlas
- [ ] Go to https://cloud.mongodb.com/
- [ ] Create a free cluster (M0)
- [ ] Create database user with password
- [ ] Network Access: Add IP `0.0.0.0/0` (allow from anywhere)
- [ ] Get connection string (replace `<password>` with your password)

### 1.2 Deploy Backend on Render
1. [ ] Go to https://dashboard.render.com/
2. [ ] Click "New +" → "Web Service"
3. [ ] Connect GitHub: Select `muneeb-codehub/CareerCraft`
4. [ ] Configure:
   - **Name**: `careercraft-backend`
   - **Root Directory**: `CareerCraftBackend/server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. [ ] Add Environment Variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<your_mongodb_atlas_connection_string>
   JWT_SECRET=<generate_random_string_here>
   GROQ_API_KEY=<your_groq_api_key>
   ```

6. [ ] Click "Create Web Service"
7. [ ] Wait 5-10 minutes for deployment
8. [ ] Copy your backend URL (e.g., `https://careercraft-backend.onrender.com`)

---

## Part 2: Frontend Deployment on Vercel

### 2.1 Deploy Frontend on Vercel
1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New" → "Project"
3. [ ] Import: Select `muneeb-codehub/CareerCraft`
4. [ ] Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `career-craft-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. [ ] Add Environment Variable:
   ```
   VITE_API_BASE_URL=<your_render_backend_url>
   ```
   Example: `https://careercraft-backend.onrender.com`

6. [ ] Click "Deploy"
7. [ ] Wait 2-3 minutes
8. [ ] Copy your frontend URL (e.g., `https://careercraft.vercel.app`)

---

## Part 3: Final Configuration

### 3.1 Update Backend CORS
1. [ ] Go to Render Dashboard → Your Web Service
2. [ ] Go to "Environment" tab
3. [ ] Add new environment variable:
   ```
   FRONTEND_URL=<your_vercel_frontend_url>
   ```
   Example: `https://careercraft.vercel.app`
4. [ ] Save changes (Render will auto-redeploy)

### 3.2 Test Your Application
- [ ] Visit your Vercel URL
- [ ] Test signup/login
- [ ] Test resume builder
- [ ] Test interview simulator
- [ ] Test skill gap analysis
- [ ] Test career roadmap
- [ ] Test all features end-to-end

---

## 🎉 Deployment Complete!

**Your Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`

---

## Troubleshooting

### Issue: Frontend can't connect to backend
**Solution**: Check CORS settings and VITE_API_BASE_URL

### Issue: Backend fails to start
**Solution**: Check MongoDB connection string and environment variables

### Issue: API calls return 500
**Solution**: Check Render logs for errors

### Issue: MongoDB connection fails
**Solution**: Ensure IP whitelist includes 0.0.0.0/0

---

## Notes
- Render free tier sleeps after 15 min inactivity (first request takes ~30 seconds)
- Vercel has instant wake-up
- Consider upgrading for production use
