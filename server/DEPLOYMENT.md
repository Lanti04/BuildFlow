# Deploying BuildFlow Backend to Render.com

This guide will help you deploy the BuildFlow backend API to Render.com (free tier available).

## Prerequisites

1. A GitHub account
2. A Render.com account (sign up at https://render.com)
3. (Optional) AWS account for S3 storage

## Step 1: Push Backend to GitHub

1. Make sure your backend code is in a GitHub repository
2. If not already, create a new repository and push the `server/` folder

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Sign in to Render:**
   - Go to https://render.com
   - Sign in with your GitHub account

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

3. **Configure the Service:**
   - **Name:** `buildflow-api` (or any name you prefer)
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free (or choose a paid plan)

4. **Set Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=<generate a strong random string>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://lanti04.github.io
   ```
   
   **To generate JWT_SECRET:**
   - Use: `openssl rand -base64 32`
   - Or: https://randomkeygen.com/
   - Or: Any long random string

   **Optional (for S3 uploads):**
   ```
   AWS_ACCESS_KEY_ID=<your-aws-access-key>
   AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=<your-bucket-name>
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your service
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Get Your API URL:**
   - Once deployed, you'll get a URL like: `https://buildflow-api.onrender.com`
   - Copy this URL - you'll need it for the frontend

### Option B: Using render.yaml (Alternative)

If you prefer using the `render.yaml` file:

1. Make sure `render.yaml` is in your repository root
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and use `render.yaml`

## Step 3: Update Frontend to Use Backend

1. **Update Frontend Environment Variable:**
   
   In your frontend repository, you need to set the API URL. Since GitHub Pages doesn't support build-time environment variables easily, you have two options:

   **Option 1: Update vite.config.ts (Recommended)**
   
   Add this to your `vite.config.ts`:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/BuildFlow/',
     define: {
       'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
         process.env.VITE_API_BASE_URL || 'https://your-api-url.onrender.com/api'
       ),
     },
   })
   ```

   **Option 2: Build with Environment Variable**
   
   When building locally:
   ```bash
   VITE_API_BASE_URL=https://your-api-url.onrender.com/api npm run build
   npm run deploy
   ```

2. **Rebuild and Redeploy Frontend:**
   ```bash
   npm run build
   npm run deploy
   ```

## Step 4: Test the Deployment

1. Visit your frontend: `https://lanti04.github.io/BuildFlow/`
2. Try to register a new account
3. Try to login
4. Check that authentication works

## Troubleshooting

### CORS Errors

If you see CORS errors:
- Make sure `CORS_ORIGIN` environment variable is set correctly in Render
- Should be: `https://lanti04.github.io` (no trailing slash)

### Backend Not Responding

1. Check Render logs: Dashboard → Your Service → Logs
2. Verify environment variables are set correctly
3. Check that the service is running (not sleeping)

### Free Tier Limitations

- Render free tier services "sleep" after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to a paid plan for always-on service

## Alternative Hosting Options

### Railway.app
- Similar to Render
- Free tier available
- Easy deployment

### Heroku
- Requires credit card for free tier
- More established platform

### AWS/Google Cloud/Azure
- More complex setup
- More control and scalability
- Pay-as-you-go pricing

## Next Steps

1. Set up AWS S3 (if you want cloud storage)
2. Consider migrating from in-memory database to PostgreSQL/MongoDB
3. Add monitoring and logging
4. Set up automated backups

