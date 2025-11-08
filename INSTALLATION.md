# BuildFlow - Installation Guide

## Quick Installation

### Step 1: Install Frontend Dependencies

```bash
npm install
```

This will install all frontend dependencies including:
- React and React DOM
- TailwindCSS
- React Router
- Drawing canvas libraries
- Capacitor (for native features)
- And more...

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

This will install all backend dependencies including:
- Express (web server)
- JWT (authentication)
- AWS SDK (S3 uploads)
- bcryptjs (password hashing)
- And more...

### Step 3: Configure Environment Variables

#### Frontend (.env file in root directory)

Create a `.env` file in the root directory:

```env
# API Base URL (required for authentication and S3 uploads)
VITE_API_BASE_URL=http://localhost:3001/api

# Azure Ink Recognizer (optional - only if you want handwriting recognition)
VITE_AZURE_INK_RECOGNIZER_KEY=your-azure-api-key-here
VITE_AZURE_INK_RECOGNIZER_ENDPOINT=https://your-region.api.cognitive.microsoft.com
```

#### Backend (server/.env file)

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Then edit `server/.env` and configure:

```env
# Server Port
PORT=3001

# JWT Secret (change this to a random string in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AWS S3 Configuration (optional - only if you want cloud storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

**Note:** 
- For basic functionality (without S3), you can skip AWS configuration
- The app will fall back to local storage if S3 is not configured
- Authentication will work without AWS (but file uploads will be local only)

### Step 4: Start the Application

#### Option A: Development Mode (Recommended)

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

#### Option B: Production Mode

**Build Frontend:**
```bash
npm run build
```

**Start Backend:**
```bash
cd server
npm start
```

### Step 5: (Optional) Set Up Native iOS App

If you want to build a native iOS app:

```bash
# Build the frontend first
npm run build

# Add iOS platform
npm run cap:add:ios

# Sync Capacitor
npm run cap:sync

# Open in Xcode
npm run cap:open:ios
```

**Requirements:**
- macOS with Xcode installed
- Apple Developer account (for device testing)

## What Gets Installed

### Frontend Dependencies
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **React Sketch Canvas** - Drawing canvas
- **jsPDF & html2canvas** - PDF/image export
- **Capacitor** - Native mobile features
- **Lucide React** - Icons
- And more...

### Backend Dependencies
- **Express** - Web server
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **AWS SDK** - S3 cloud storage
- **CORS** - Cross-origin requests
- And more...

## Troubleshooting

### "npm install" fails
- Make sure you have Node.js 18+ installed
- Try deleting `node_modules` and `package-lock.json` and run `npm install` again
- Check your internet connection

### Backend won't start
- Make sure port 3001 is not in use
- Check that `.env` file exists in `server/` directory
- Verify Node.js version is 18+

### Frontend won't start
- Make sure port 3000 is not in use
- Check that all dependencies installed correctly
- Try `npm install` again

### Capacitor errors
- Make sure you've run `npm install` first
- For iOS: Requires macOS and Xcode
- For Android: Requires Android Studio (not set up yet)

## Minimum Requirements

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **Operating System**: Windows, macOS, or Linux
- **For iOS Development**: macOS with Xcode
- **For Android Development**: Android Studio (future)

## Quick Start (Minimal Setup)

If you just want to test the app without backend:

1. Install frontend: `npm install`
2. Start frontend: `npm run dev`
3. The app will work in "offline mode" (local storage only)
4. Authentication won't work without backend
5. File uploads will use local storage

## Next Steps

After installation:
1. Start the backend server
2. Start the frontend
3. Register a new account
4. Start using the app!

See `README.md` for usage instructions.

