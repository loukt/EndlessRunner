# Azure Deployment Guide

## Quick Deploy to Azure Static Web Apps

### Option 1: Using Azure Static Web Apps CLI (Recommended for testing)

1. **Install Azure Static Web Apps CLI globally**:
   ```powershell
   npm install -g @azure/static-web-apps-cli
   ```

2. **Build the production bundle**:
   ```powershell
   npm run build
   ```
   This creates a `dist/` folder with your production files.

3. **Deploy to Azure**:
   ```powershell
   swa deploy ./dist --env production
   ```
   
   - Follow the prompts to log in to Azure
   - Create a new Static Web App or select an existing one
   - The CLI will upload your files and give you a URL

### Option 2: Using Azure Portal (For permanent deployment)

1. **Build the production bundle**:
   ```powershell
   npm run build
   ```

2. **Go to [Azure Portal](https://portal.azure.com)**

3. **Create a new Static Web App**:
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"
   - Fill in:
     - **Resource Group**: Create new or use existing
     - **Name**: endless-runner (or your choice)
     - **Plan type**: Free
     - **Region**: Choose closest to you
     - **Source**: Other (for manual upload)
   - Click "Review + Create" then "Create"

4. **Deploy via Azure CLI**:
   ```powershell
   # Install Azure CLI if not already installed
   # Download from: https://aka.ms/installazurecliwindows
   
   # Login to Azure
   az login
   
   # Deploy the dist folder
   az staticwebapp upload --name endless-runner --resource-group <your-resource-group> --app-location ./dist --no-use-keyring
   ```

### Option 3: GitHub Actions (Automated CI/CD)

1. **Push your code to GitHub**

2. **Create a new Static Web App in Azure Portal**:
   - Select "GitHub" as source
   - Authorize Azure to access your GitHub
   - Select your repository
   - Build Details:
     - **App location**: `/`
     - **Output location**: `dist`
   
3. **Azure will automatically**:
   - Create a GitHub Actions workflow
   - Build and deploy on every push to main
   - Give you a production URL

## After Deployment

Your game will be available at:
- `https://<your-app-name>.azurestaticapps.net`

## Testing the Deployed Game

1. Open the URL in different browsers
2. Test on mobile devices
3. Try the "Add to Home Screen" feature (PWA)
4. Test offline functionality (disconnect internet after loading)

## Cost

- **Free Tier**: Includes:
  - 100 GB bandwidth/month
  - 0.5 GB storage
  - 2 custom domains
  - Free SSL certificates
  - Perfect for testing and small games!

## Troubleshooting

**Build fails?**
- Make sure all dependencies are in package.json
- Check that `npm run build` works locally first

**Game not loading?**
- Check browser console for errors (F12)
- Verify dist/ folder has index.html and assets

**Need to update?**
- Run `npm run build` again
- Redeploy using the same command

## Quick Commands Summary

```powershell
# 1. Build
npm run build

# 2. Install SWA CLI (one time)
npm install -g @azure/static-web-apps-cli

# 3. Deploy
swa deploy ./dist --env production
```

That's it! Your game will be live on Azure! 🚀
