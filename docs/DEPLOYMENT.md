# 🚀 Deployment Guide - Vercel

This guide will help you deploy GestureX Racing to Vercel for free hosting.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free) - [Sign up here](https://vercel.com/signup)
- Git installed locally

---

## 🔧 Step 1: Push to GitHub

1. **Create a new repository on GitHub**
   - Go to [GitHub](https://github.com/new)
   - Name it `gesturex-racing` (or your preferred name)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code**
   ```bash
   git remote add origin https://github.com/yourusername/gesturex-racing.git
   git branch -M main
   git push -u origin main
   ```

---

## 🌐 Step 2: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com)**
   - Log in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose your `gesturex-racing` repository

3. **Configure Project**
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** Leave empty (static site)
   - **Output Directory:** Leave empty (uses root)

4. **Environment Variables** (Optional)
   - No environment variables needed for this project

5. **Deploy**
   - Click "Deploy"
   - Wait 30-60 seconds for deployment to complete
   - Your app will be live at `https://your-project-name.vercel.app`

### Method 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name? `gesturex-racing`
   - In which directory? `./`
   - Want to override settings? `N`

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## ✅ Step 3: Verify Deployment

1. **Open your deployment URL**
   - Should be `https://gesturex-racing.vercel.app` (or similar)

2. **Test the following:**
   - ✅ Home page loads with 3D car preview
   - ✅ Camera permission request works
   - ✅ Car selection screen displays
   - ✅ Settings menu is accessible
   - ✅ Game starts and runs smoothly
   - ✅ Gesture controls work (after camera permission)

3. **Check Browser Console**
   - Press F12 → Console tab
   - Should see no critical errors
   - MediaPipe should load successfully

---

## 🔄 Step 4: Automatic Deployments

Every time you push to your GitHub repository, Vercel will automatically deploy:

1. **Make changes locally**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **Vercel auto-deploys**
   - Check deployment status at [vercel.com/dashboard](https://vercel.com/dashboard)
   - Usually takes 30-60 seconds

3. **Preview Deployments**
   - Each branch and PR gets a unique preview URL
   - Perfect for testing before merging

---

## 🎯 Custom Domain (Optional)

1. **Go to your project in Vercel Dashboard**
2. **Settings → Domains**
3. **Add your custom domain**
   - Example: `gesturex.com`
4. **Configure DNS** (Vercel provides instructions)
5. **SSL automatically provisioned** (free HTTPS)

---

## 🐛 Troubleshooting

### Camera Not Working

**Issue:** Camera permission denied or not loading

**Solutions:**
- Ensure you're on HTTPS (Vercel provides this automatically)
- Check browser permissions (Settings → Privacy → Camera)
- Try a different browser (Chrome recommended)

### 3D Models Not Loading

**Issue:** Cars not appearing or black screen

**Solutions:**
- Check browser console for CORS errors
- Verify all `.glb` files are in `assets/cars/` folder
- Clear browser cache (Ctrl+Shift+Delete)

### Performance Issues

**Issue:** Game running slowly or laggy

**Solutions:**
- Lower graphics quality in Settings → Graphics
- Close other browser tabs
- Update graphics drivers
- Use a device with better GPU

### Build Failed

**Issue:** Vercel deployment fails

**Solutions:**
- Check the build logs in Vercel Dashboard
- Ensure all files are committed to Git
- Verify `vercel.json` is properly formatted
- Try deploying from scratch

---

## 📊 Analytics & Monitoring

### Enable Vercel Analytics (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Analytics" tab
3. Enable "Web Analytics"
4. Free for hobby projects (500 events/month)

### Features:
- Page views and unique visitors
- Performance metrics (Web Vitals)
- Geographic distribution
- Device and browser stats

---

## 🔐 Security Headers

Our `vercel.json` includes security headers for:

```json
{
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin"
}
```

These headers ensure:
- MediaPipe works correctly
- Camera access is secure
- Proper isolation from other sites

---

## 💡 Pro Tips

1. **Use Environment Branches**
   - `main` branch → Production
   - `dev` branch → Development preview
   - Feature branches → Preview deployments

2. **Enable Build Caching**
   - Already configured in `vercel.json`
   - Speeds up subsequent deployments

3. **Monitor Performance**
   - Check Vercel Analytics for Core Web Vitals
   - Optimize assets if needed

4. **Set Up Status Page**
   - Consider using [Statuspage.io](https://statuspage.io) for uptime monitoring

---

## 📞 Support

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Project Issues:** [github.com/yourusername/gesturex-racing/issues](https://github.com/yourusername/gesturex-racing/issues)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Deployment successful
- [ ] Home page loads correctly
- [ ] Camera permission works
- [ ] 3D models display properly
- [ ] Gesture controls functional
- [ ] Settings persist correctly
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

---

**🎉 Congratulations! Your GestureX Racing game is now live!**

Share your deployment URL with friends and start racing! 🏎️💨
