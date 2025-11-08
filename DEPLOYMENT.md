# GitHub Pages Deployment Guide

This guide explains how to deploy BuildFlow to GitHub Pages.

## Configuration Changes Made

The following files have been updated to support GitHub Pages deployment at `/BuildFlow/`:

1. **`vite.config.ts`** - Added `base: '/BuildFlow/'` to configure Vite's base path
2. **`src/App.tsx`** - Added `basename="/BuildFlow"` to React Router
3. **`public/manifest.json`** - Updated `start_url` and icon paths to include `/BuildFlow/` prefix

## Building and Deploying

### Step 1: Build the Application

```bash
npm run build
```

This will:
- Compile TypeScript
- Build the React app with all assets
- Output everything to the `dist/` folder
- Automatically rewrite all asset paths to include `/BuildFlow/` prefix

### Step 2: Deploy to GitHub Pages

The `package.json` already includes deployment scripts. Simply run:

```bash
npm run deploy
```

This command will:
1. Run `predeploy` script (which runs `npm run build`)
2. Deploy the `dist/` folder to the `gh-pages` branch
3. GitHub Pages will automatically serve the app from that branch

### Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Build the app:
   ```bash
   npm run build
   ```

2. Commit and push the `dist/` folder to the `gh-pages` branch:
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```

   Or use the `gh-pages` package:
   ```bash
   npx gh-pages -d dist
   ```

## Verifying the Deployment

After deployment, your app should be accessible at:
- **Production URL**: `https://lanti04.github.io/BuildFlow/`

All assets (JS, CSS, images, manifest) should load correctly with the `/BuildFlow/` prefix.

## Local Development

For local development, the app still works normally:
```bash
npm run dev
```

The base path configuration only affects the production build.

## Troubleshooting

### If assets still don't load:

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check GitHub Pages settings** - Ensure the repository is set to serve from `gh-pages` branch
3. **Verify paths** - Check browser console Network tab to see if paths are correct
4. **Rebuild** - Run `npm run build` again to ensure latest changes are included

### If routes don't work:

- Ensure React Router `basename` is set to `/BuildFlow` (already configured)
- Check that all internal links use relative paths or React Router's `Link` component

## Changing the Repository Name

If you rename your GitHub repository, update:
1. `base` in `vite.config.ts` to match the new repository name
2. `basename` in `src/App.tsx` to match the new repository name
3. `start_url` and icon paths in `public/manifest.json`

Then rebuild and redeploy.

