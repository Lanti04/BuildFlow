# Quick Guide: Deploy Backend to Render.com

## Step 1: Prepare Your Backend

1. Make sure your `server/` folder is in a GitHub repository
2. The backend is ready to deploy!

## Step 2: Deploy to Render

1. **Go to Render.com:**
   - Visit https://render.com
   - Sign up/Login with GitHub

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repo with your backend

3. **Configure:**
   - **Name:** `buildflow-api`
   - **Root Directory:** `server` (important!)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Add Environment Variables:**
   Click "Advanced" → Add these:
   
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=<generate-random-string-here>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://lanti04.github.io
   ```
   
   **Generate JWT_SECRET:**
   - Visit: https://randomkeygen.com/
   - Copy a "CodeIgniter Encryption Keys" (64 characters)
   - Or run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-5 minutes for deployment
   - Copy your API URL (e.g., `https://buildflow-api.onrender.com`)

## Step 3: Update Frontend

After deployment, you'll get a URL like: `https://buildflow-api.onrender.com`

1. **Build frontend with API URL:**
   ```bash
   VITE_API_BASE_URL=https://buildflow-api.onrender.com/api npm run build
   npm run deploy
   ```

2. **Or update `vite.config.ts` temporarily:**
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/BuildFlow/',
     define: {
       'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://buildflow-api.onrender.com/api'),
     },
   })
   ```
   Then: `npm run build && npm run deploy`

## Step 4: Test

1. Visit: https://lanti04.github.io/BuildFlow/
2. Try registering a new account
3. Login should work!

## Optional: Add AWS S3 (for cloud storage)

If you want S3 uploads to work:

1. **Get AWS Credentials:**
   - Sign up at https://aws.amazon.com
   - Create an S3 bucket
   - Create IAM user with S3 permissions
   - Get Access Key ID and Secret Access Key

2. **Add to Render Environment Variables:**
   ```
   AWS_ACCESS_KEY_ID=<your-key>
   AWS_SECRET_ACCESS_KEY=<your-secret>
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=<your-bucket-name>
   ```

3. **Redeploy** (Render will auto-redeploy when env vars change)

## Troubleshooting

**Backend not responding?**
- Check Render logs: Dashboard → Your Service → Logs
- Make sure service is "Live" (not sleeping)

**CORS errors?**
- Verify `CORS_ORIGIN=https://lanti04.github.io` is set (no trailing slash)

**Free tier sleeping?**
- Free tier services sleep after 15 min inactivity
- First request takes ~30 seconds to wake up
- Consider paid plan for always-on

## Need Help?

See `server/DEPLOYMENT.md` for detailed instructions.

