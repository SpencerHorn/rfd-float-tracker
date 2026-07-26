# RFD Float Tracker - Render Deployment Guide

This guide will help you deploy the RFD Float Tracker to [Render](https://render.com).

## Prerequisites

- A Render account (free tier available at https://render.com)
- A GitHub repository with this code
- GitHub account linked to Render

## Deployment Steps

### 1. Push Code to GitHub

Make sure your code is pushed to a GitHub repository:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Connect GitHub to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" button and select "Blueprint"
3. Select your GitHub repository `rfd-float-tracker`
4. Render will automatically detect the `render.yaml` configuration file

### 3. Configure Environment Variables

The `render.yaml` file already includes:
- `NODE_ENV`: Set to `production`
- `DATABASE_PATH`: Set to `/var/data/rfd-float-tracker.db` (persistent disk)

No additional configuration needed - Render will use the blueprint settings automatically.

### 4. Deploy

1. Click "Create Blueprint" on Render
2. Render will automatically:
   - Install dependencies (`npm install`)
   - Build the application (`npm run build`)
   - Run database migrations on first deploy
   - Start the application (`npm start`)

### 5. Monitor Deployment

- Check the deployment logs in the Render dashboard
- Your app will be live at `https://your-app-name.onrender.com`

## Database Persistence

The app uses SQLite with a persistent disk on Render:
- Database file: `/var/data/rfd-float-tracker.db`
- Disk size: 1 GB (free tier limit)
- Data persists across deployments and server restarts

## Local Development

For local development, continue using:

```bash
npm run dev
```

The app will use `./data/rfd-float-tracker.dev.db` locally.

## Manual Deployment (Alternative)

If you prefer to manually deploy without Blueprint:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add a persistent disk:
   - Mount path: `/var/data`
   - Size: 1 GB
6. Add environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_PATH`: `/var/data/rfd-float-tracker.db`

## Troubleshooting

### Database Not Persisting

Ensure the persistent disk is mounted at `/var/data` in Render's settings.

### Build Fails

Check the build logs in Render dashboard. Common issues:
- Missing Node.js version (should be 24+ as per `.nvmrc`)
- Dependencies not installing

### App Crashes on Startup

- Check that the `/var/data` directory is writable
- Verify DATABASE_PATH environment variable is set correctly
- Review logs in Render dashboard for error messages

## Updating Your App

After updating code locally:

```bash
git add .
git commit -m "Update features"
git push origin main
```

Render will automatically detect the change and redeploy.

## Scaling Beyond Free Tier

When ready for production:
1. Upgrade to a paid plan for better performance
2. Consider migrating to PostgreSQL for better scalability
3. Add environment-specific configurations

## Support

For Render-specific issues, see:
- [Render Documentation](https://render.com/docs)
- [Render Support](https://render.com/support)
