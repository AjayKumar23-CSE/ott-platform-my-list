# 🚀 Deployment Guide

This guide will help you deploy the OTT Platform My List application to GitHub and free hosting platforms.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Node.js 16+ installed

## 🔧 Step 1: GitHub Deployment

### 1.1 Initialize Git Repository

```bash
# Navigate to project root
cd "untitled folder 2"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: OTT Platform My List with Authentication"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `ott-platform-my-list`
3. Keep it public for free hosting
4. Don't initialize with README (we already have one)

### 1.3 Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ott-platform-my-list.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Backend Deployment (Railway - Free Tier)

### 2.1 Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `ott-platform-my-list` repository
5. Choose the `backend` folder as root directory

### 2.2 Configure Environment Variables

In Railway dashboard, go to Variables tab and add:

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
PORT=5001
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 2.3 Custom Start Command

In Railway Settings → Deploy, set:
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 2.4 Get Backend URL

After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

## 🎨 Step 3: Frontend Deployment (Vercel - Free Tier)

### 3.1 Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `ott-platform-my-list` repository
5. Set **Root Directory** to `frontend`

### 3.2 Configure Environment Variables

In Vercel dashboard, go to Settings → Environment Variables:

```bash
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
NODE_ENV=production
```

### 3.3 Build Settings

Vercel should auto-detect, but verify:
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🔄 Step 4: Update CORS Configuration

After getting your frontend URL, update the backend environment:

1. Go to Railway dashboard
2. Update `FRONTEND_URL` variable with your Vercel URL
3. Redeploy the backend

## 🧪 Step 5: Test Deployment

### 5.1 Backend Health Check

Visit: `https://your-backend-url.railway.app/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-12-04T...",
  "uptime": "..."
}
```

### 5.2 Frontend Test

1. Visit your Vercel URL
2. Try logging in with demo users:
   - Username: `john_doe`, Password: `password123`
   - Username: `jane_smith`, Password: `password123`
3. Test adding/removing items from My List

## 🎯 Alternative Hosting Options

### Backend Alternatives
- **Render** (Free tier): Similar to Railway
- **Heroku** (Paid): More features but no free tier
- **Fly.io** (Free tier): Good performance

### Frontend Alternatives
- **Netlify** (Free tier): Similar to Vercel
- **GitHub Pages** (Free): For static sites
- **Surge.sh** (Free): Simple deployment

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is correctly set in backend
2. **Build Failures**: Check Node.js version compatibility
3. **Environment Variables**: Verify all required variables are set
4. **File Storage**: Railway provides ephemeral storage (files reset on redeploy)

### Production Considerations

1. **Database**: Consider upgrading to PostgreSQL for production
2. **File Storage**: Use cloud storage (AWS S3, Cloudinary) for persistence
3. **Monitoring**: Add application monitoring (Sentry, LogRocket)
4. **CDN**: Use CDN for better performance
5. **SSL**: Ensure HTTPS is enabled (automatic on Vercel/Railway)

## 📊 Free Tier Limitations

### Railway (Backend)
- 500 hours/month execution time
- 1GB RAM
- 1GB storage (ephemeral)
- Custom domains available

### Vercel (Frontend)
- 100GB bandwidth/month
- Unlimited static sites
- Custom domains available
- Edge functions included

## 🎉 Success!

Your OTT Platform is now live! 🚀

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **GitHub**: `https://github.com/YOUR_USERNAME/ott-platform-my-list`

Share your deployed application and enjoy your fully functional OTT Platform with authentication and My List features!
