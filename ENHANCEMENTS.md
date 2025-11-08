# BuildFlow Enhancements Guide

This document describes the 4 optional enhancements that have been implemented.

## 1. Handwriting Recognition

### Implementation
- Integrated Azure Ink Recognizer API for handwriting recognition
- Available in Default Notepad mode only
- Converts canvas strokes to recognized text

### Setup
1. Get Azure Cognitive Services API key:
   - Go to https://portal.azure.com
   - Create a Cognitive Services resource
   - Enable Ink Recognizer
   - Copy the API key and endpoint

2. Configure environment variables:
   ```env
   VITE_AZURE_INK_RECOGNIZER_KEY=your-api-key
   VITE_AZURE_INK_RECOGNIZER_ENDPOINT=https://your-region.api.cognitive.microsoft.com
   ```

3. Use in Notepad:
   - Draw on the canvas in Default mode
   - Click the recognition button (sparkles icon)
   - View recognized text in the panel below

### Files
- `src/utils/handwriting.ts` - Handwriting recognition utilities
- `src/config/azure.ts` - Azure configuration
- `src/pages/Notepad.tsx` - Integration in Notepad component

## 2. Native Features (Capacitor)

### Implementation
- Capacitor setup for iOS/Android native features
- Photos app integration
- Contacts API integration
- Files app integration

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Add iOS platform:
   ```bash
   npm run cap:add:ios
   npm run cap:sync
   ```

3. Open in Xcode:
   ```bash
   npm run cap:open:ios
   ```

4. Configure permissions in `ios/App/App/Info.plist`:
   ```xml
   <key>NSPhotoLibraryAddUsageDescription</key>
   <string>BuildFlow needs access to save photos</string>
   <key>NSContactsUsageDescription</key>
   <string>BuildFlow needs access to your contacts</string>
   ```

### Features
- **Photos App**: Save notepad exports and site visit photos directly to Photos app
- **Contacts API**: Import contacts from device contacts
- **Files App**: Save PDFs to device Files app

### Files
- `capacitor.config.ts` - Capacitor configuration
- `src/utils/native.ts` - Native feature utilities
- `src/pages/Notepad.tsx` - Photos app integration
- `src/pages/Contacts.tsx` - Contacts API integration

## 3. Backend API Server

### Implementation
- Node.js/Express backend server
- JWT authentication
- AWS S3 signed URL generation
- User management

### Setup
1. Navigate to server directory:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   PORT=3001
   JWT_SECRET=your-secret-key
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   ```

3. Start server:
   ```bash
   npm run dev
   ```

### API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `POST /api/upload/signed-url` - Get S3 upload URL
- `POST /api/upload/signed-read-url` - Get S3 read URL
- `DELETE /api/upload/:key` - Delete file
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user

### Files
- `server/server.js` - Main server file
- `server/routes/auth.js` - Authentication routes
- `server/routes/upload.js` - Upload routes
- `server/routes/users.js` - User routes
- `server/db/users.js` - User database (in-memory)

## 4. Authentication

### Implementation
- JWT-based authentication
- Protected routes
- Login/Register UI
- User context

### Setup
1. Configure frontend API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

2. Start backend server (see Backend API Server section)

3. Use the app:
   - Register a new account or login
   - All routes are protected
   - User info displayed in sidebar

### Features
- Secure JWT token storage
- Automatic token verification
- Protected routes
- User profile in sidebar
- Logout functionality

### Files
- `src/contexts/AuthContext.tsx` - Auth context provider
- `src/pages/Login.tsx` - Login/Register page
- `src/components/ProtectedRoute.tsx` - Protected route component
- `src/utils/api.ts` - API client
- `src/components/Layout.tsx` - User info in sidebar

## Integration

All enhancements are integrated and work together:

1. **Authentication** protects all routes
2. **Backend API** provides secure S3 uploads
3. **Native features** enhance mobile experience
4. **Handwriting recognition** improves notepad functionality

## Development Workflow

1. Start backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start frontend:
   ```bash
   npm run dev
   ```

3. For native iOS development:
   ```bash
   npm run build
   npm run cap:sync
   npm run cap:open:ios
   ```

## Production Deployment

### Backend
1. Deploy to cloud (AWS, Heroku, etc.)
2. Set environment variables
3. Use real database (PostgreSQL, MongoDB)
4. Enable HTTPS
5. Set up monitoring

### Frontend
1. Build for production:
   ```bash
   npm run build
   ```

2. Deploy to static hosting (Vercel, Netlify, etc.)
3. Configure environment variables
4. Set up CORS properly

### Native App
1. Build iOS app in Xcode
2. Configure App Store Connect
3. Submit for review
4. Release to App Store

## Troubleshooting

### Handwriting Recognition
- Check Azure API key and endpoint
- Verify API quota
- Check browser console for errors

### Native Features
- Ensure permissions are configured
- Check Capacitor version compatibility
- Verify native plugins are installed

### Backend API
- Check environment variables
- Verify AWS credentials
- Check S3 bucket permissions
- Review server logs

### Authentication
- Verify backend server is running
- Check API URL configuration
- Review browser console for errors
- Check JWT token expiration

## Next Steps

- Add password reset functionality
- Implement email verification
- Add social login (Google, Apple)
- Enhance error handling
- Add rate limiting
- Implement audit logging
- Add multi-user collaboration
- Enhance security measures

