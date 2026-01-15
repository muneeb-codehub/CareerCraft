# CareerCraft Backend - Production Deployment Guide

## Prerequisites

1. **Node.js** - v18 or higher
2. **MongoDB Atlas Account** - [cloud.mongodb.com](https://cloud.mongodb.com)
3. **Hosting Platform** - Choose one:
   - Heroku
   - Railway
   - Render
   - DigitalOcean
   - AWS EC2
   - Google Cloud Platform

## Step 1: MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster (Free tier available)
3. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Choose password authentication
   - Save credentials
4. Whitelist IP addresses:
   - Go to Network Access
   - Add IP Address
   - Allow access from anywhere (0.0.0.0/0) for production
5. Get connection string:
   - Go to Clusters > Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 2: Environment Variables

Create `.env.production` file with these variables:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/careercraft
JWT_SECRET=<generate-strong-secret-64-chars>
GROQ_API_KEY=<your-groq-api-key>
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-gmail-app-password>
FRONTEND_URL=https://your-frontend-domain.com
REDIS_URL=<optional-redis-url>
```

### Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 3: Deployment Options

### Option A: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
cd CareerCraftBackend/server
heroku create your-app-name
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set GROQ_API_KEY="your-groq-key"
heroku config:set EMAIL_USER="your-email"
heroku config:set EMAIL_PASSWORD="your-password"
heroku config:set FRONTEND_URL="your-frontend-url"
```

5. **Deploy**
```bash
git add .
git commit -m "Prepare for deployment"
git push heroku main
```

6. **Open App**
```bash
heroku open
```

### Option B: Railway

1. **Sign up at** [railway.app](https://railway.app)
2. **New Project > Deploy from GitHub**
3. **Select your repository**
4. **Add Environment Variables** in Railway dashboard
5. **Deploy automatically**

### Option C: Render

1. **Sign up at** [render.com](https://render.com)
2. **New > Web Service**
3. **Connect your GitHub repository**
4. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**
6. **Create Web Service**

### Option D: DigitalOcean App Platform

1. **Sign up at** [digitalocean.com](https://www.digitalocean.com)
2. **Apps > Create App**
3. **Choose GitHub repository**
4. **Configure**:
   - HTTP Port: 5000
   - Build Command: `npm install`
   - Run Command: `npm start`
5. **Add Environment Variables**
6. **Deploy**

## Step 4: Production Configuration

### Update package.json

Add production scripts:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "npm install",
    "test": "jest"
  }
}
```

### Add Procfile (for Heroku)

Create `Procfile` in server directory:
```
web: node index.js
```

### Security Checklist

- ✅ Strong JWT secret (64+ characters)
- ✅ MongoDB IP whitelist configured
- ✅ Environment variables secured
- ✅ CORS configured for production domain
- ✅ Rate limiting enabled
- ✅ File upload limits set
- ✅ Email credentials using app passwords
- ✅ .env files in .gitignore

## Step 5: Redis Setup (Optional - For Caching)

### Redis Cloud (Free Tier)

1. Sign up at [redis.com/try-free](https://redis.com/try-free/)
2. Create a database
3. Get connection URL
4. Add to environment variables:
```bash
REDIS_URL=redis://username:password@host:port
```

### Alternative: Upstash Redis

1. Sign up at [upstash.com](https://upstash.com)
2. Create database
3. Copy REST URL
4. Add to environment variables

## Step 6: Monitoring & Logging

### Option 1: Sentry (Error Tracking)

1. Sign up at [sentry.io](https://sentry.io)
2. Create project
3. Install Sentry:
```bash
npm install @sentry/node
```
4. Add to index.js:
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Option 2: LogRocket

1. Sign up at [logrocket.com](https://logrocket.com)
2. Install LogRocket
3. Configure monitoring

## Step 7: Domain & SSL

### Custom Domain

1. **Purchase domain** from Namecheap, GoDaddy, etc.
2. **Configure DNS** to point to your deployment platform
3. **Enable SSL** (Most platforms auto-configure)

### SSL Certificate

Most platforms (Heroku, Railway, Render) provide free SSL certificates automatically.

## Step 8: Performance Optimization

1. **Enable Compression**
```bash
npm install compression
```

```javascript
import compression from 'compression';
app.use(compression());
```

2. **Enable Helmet for Security**
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

3. **Enable Redis Caching** (if not already)

## Step 9: Health Check Endpoint

Add health check for monitoring:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

## Step 10: CI/CD Pipeline (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd CareerCraftBackend/server && npm install
      - run: cd CareerCraftBackend/server && npm test
      # Add deployment steps based on your platform
```

## Useful Commands

```bash
# Check logs
heroku logs --tail

# Restart app
heroku restart

# Scale dynos
heroku ps:scale web=1

# MongoDB shell
mongosh "mongodb+srv://cluster.mongodb.net" --username <user>

# Test production locally
NODE_ENV=production node index.js
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check MongoDB IP whitelist
   - Verify connection string
   - Check firewall settings

2. **Environment Variables Not Loading**
   - Verify .env file location
   - Check dotenv configuration
   - Ensure platform env vars are set

3. **CORS Errors**
   - Update CORS_ORIGINS in .env
   - Verify frontend domain is whitelisted

4. **Rate Limit Too Strict**
   - Adjust RATE_LIMIT_MAX_REQUESTS
   - Consider IP-based limits

## Support Resources

- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Heroku: [devcenter.heroku.com](https://devcenter.heroku.com)
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)

## Security Best Practices

1. Never commit `.env` files
2. Use strong passwords & secrets
3. Enable 2FA on all services
4. Regular dependency updates
5. Monitor for vulnerabilities
6. Implement rate limiting
7. Use HTTPS only
8. Sanitize user inputs
9. Implement proper logging
10. Regular backups

## Post-Deployment

1. Test all endpoints
2. Monitor error rates
3. Check performance metrics
4. Setup alerts
5. Document API endpoints
6. Share Swagger docs URL
