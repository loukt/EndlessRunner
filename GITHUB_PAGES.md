# GitHub Pages Deployment Guide

## Prerequisites
- GitHub account
- Git installed

## Steps to Deploy

### 1. Initialize Git Repository (if not already done)
```powershell
git init
git add .
git commit -m "Initial commit - Endless Runner game"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `EndlessRunner` (must match the name in vite.config.js)
3. Keep it **Public** (required for free GitHub Pages)
4. **Don't** initialize with README (you already have files)
5. Click "Create repository"

### 3. Push Your Code to GitHub
```powershell
# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/EndlessRunner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - Source: Select **GitHub Actions**
5. That's it! The workflow will run automatically

### 5. Wait for Deployment
- Go to the **Actions** tab in your repository
- Watch the "Deploy to GitHub Pages" workflow run
- Takes about 2-3 minutes
- Green checkmark = success! ✅

### 6. Access Your Game
Your game will be live at:
```
https://YOUR_USERNAME.github.io/EndlessRunner/
```

Example: `https://johndoe.github.io/EndlessRunner/`

## Updating Your Game

Every time you push changes to GitHub, it will automatically rebuild and deploy:

```powershell
git add .
git commit -m "Added new features"
git push
```

## Troubleshooting

**404 Error?**
- Make sure repository name is exactly `EndlessRunner`
- Check that GitHub Pages is enabled in Settings
- Wait a few minutes after first deployment

**Build Fails?**
- Check the Actions tab for error messages
- Make sure `npm run build` works locally
- Verify all dependencies are in package.json

**Game not loading assets?**
- The base path is set to `/EndlessRunner/` in vite.config.js
- If you renamed the repo, update the base path

## Custom Domain (Optional)

Want `yourgame.com` instead of `username.github.io/EndlessRunner`?

1. Buy a domain (Namecheap, Google Domains, etc.)
2. Add a `CNAME` file to `/public` with your domain
3. Update DNS settings (GitHub provides instructions)
4. Change `base: '/EndlessRunner/'` to `base: '/'` in vite.config.js

## What Happens Automatically

✅ Builds your game with Vite
✅ Optimizes all assets
✅ Deploys to GitHub Pages
✅ Updates on every push
✅ Free hosting forever!

## Next Steps

Once deployed:
1. Share the URL with friends! 🎮
2. Test on different devices
3. Add it to your home screen (PWA)
4. Keep improving the game!

---

**Ready?** Just follow steps 1-3 above to push your code to GitHub!
