# 📦 GitHub Repository Setup Guide

Quick guide to push your GestureX Racing project to GitHub.

---

## 🚀 Quick Setup (First Time)

### 1. Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Fill in the details:
   - **Repository name:** `gesturex-racing`
   - **Description:** "🎮 Gesture-controlled F1 racing game with THREE.js and MediaPipe"
   - **Visibility:** Public (or Private)
   - **DO NOT** check "Initialize with README" (we already have one)
3. Click **"Create repository"**

### 2. Push Your Code

Copy your repository URL (will look like: `https://github.com/yourusername/gesturex-racing.git`)

Then run these commands in your project folder:

```bash
# Add the remote repository
git remote add origin https://github.com/yourusername/gesturex-racing.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

**Done!** 🎉 Your code is now on GitHub.

---

## 🔄 Making Updates

After making changes to your code:

```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Your commit message here"

# Push to GitHub
git push
```

---

## 📝 Commit Message Best Practices

Use clear, descriptive commit messages:

**Good examples:**
- `Add speed boost gesture control`
- `Fix camera permission error on Safari`
- `Update McLaren car textures`
- `Improve performance on low-end devices`

**Avoid:**
- `update`
- `fix stuff`
- `changes`

---

## 🌿 Working with Branches (Optional)

For new features or experiments:

```bash
# Create and switch to a new branch
git checkout -b feature/new-car-model

# Make your changes...

# Push the branch
git push -u origin feature/new-car-model

# Create a Pull Request on GitHub
# After approval, merge on GitHub website
```

---

## 🔍 Checking Your Status

```bash
# See what files have changed
git status

# See commit history
git log --oneline

# See what changed in files
git diff
```

---

## ⚙️ GitHub Repository Settings

### Enable GitHub Pages (Optional Alternative to Vercel)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select branch: `main`, folder: `/ (root)`
4. Click **Save**
5. Your site will be live at: `https://yourusername.github.io/gesturex-racing/`

**Note:** Vercel is recommended as it provides better performance and features.

### Repository Topics (Recommended)

Add topics to make your project discoverable:
1. Go to repository main page
2. Click ⚙️ next to "About"
3. Add topics: `racing-game`, `gesture-control`, `threejs`, `mediapipe`, `webgl`, `f1-racing`

### Create Repository Description

1. Click ⚙️ next to "About"
2. Description: "🎮 Gesture-controlled F1 racing game with THREE.js and MediaPipe"
3. Website: Add your Vercel URL once deployed
4. Add topics (as above)
5. Click **Save changes**

---

## 🔐 Setting Up Vercel Secrets for GitHub Actions (Advanced)

If you want automatic deployments via GitHub Actions:

1. Get your Vercel tokens from [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:
   - `VERCEL_TOKEN` - Your Vercel token
   - `VERCEL_ORG_ID` - Your Vercel org ID
   - `VERCEL_PROJECT_ID` - Your project ID

Now every push will automatically deploy to Vercel!

---

## 📊 Repository Badges

Add these to your README.md for a professional look:

```markdown
[![GitHub stars](https://img.shields.io/github/stars/yourusername/gesturex-racing?style=social)](https://github.com/yourusername/gesturex-racing/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/gesturex-racing?style=social)](https://github.com/yourusername/gesturex-racing/network/members)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/gesturex-racing)](https://github.com/yourusername/gesturex-racing/issues)
```

---

## 🐛 Common Issues

### "Permission denied (publickey)"

**Solution:** Use HTTPS URL instead of SSH, or set up SSH keys:
```bash
git remote set-url origin https://github.com/yourusername/gesturex-racing.git
```

### "Updates were rejected"

**Solution:** Pull first, then push:
```bash
git pull origin main --rebase
git push
```

### "Large files detected"

**Solution:** Git doesn't like files over 100MB. Use Git LFS:
```bash
git lfs install
git lfs track "*.glb"
git add .gitattributes
git commit -m "Add Git LFS"
```

---

## 📚 Next Steps

1. ✅ Push code to GitHub
2. ✅ Set up repository description and topics
3. ✅ Deploy to Vercel (see [DEPLOYMENT.md](./DEPLOYMENT.md))
4. ✅ Add deployment URL to repository
5. ✅ Share with the world! 🌍

---

**Need Help?**
- GitHub Docs: [docs.github.com](https://docs.github.com)
- GitHub Support: [support.github.com](https://support.github.com)
