# BuildFlow Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - For iPad testing, use your local IP address (e.g., `http://192.168.1.x:3000`)

## Development

### Project Structure
- `src/components/` - Reusable UI components
- `src/pages/` - Page components (Dashboard, Notepad, Contacts, etc.)
- `src/utils/` - Utility functions (storage, export, S3)
- `src/types/` - TypeScript type definitions

### Key Features

#### Calendar Dashboard
- Week and Day views implemented
- Month view placeholder (can be enhanced)
- Click on any day to view/edit site visit details

#### Site Visit Management
- Upload multiple photos
- Add notes and descriptions
- Add client contact information
- Track estimated cost and duration
- All data stored locally in IndexedDB

#### Notepad
- **Default Mode**: Lined paper background with drawing support
- **Custom Template Mode**: Upload your own template and write on it
- Signature capture
- Export as PNG or PDF
- Zoom and pan controls
- Touch support for iPad

#### Contacts
- Add and manage client contacts
- Link contacts to site visits
- Device contact import (requires native implementation)

## iPad/Apple Pencil Support

The app is designed to work on iPad with Apple Pencil:

1. **Touch Support**: All canvas interactions support touch input
2. **Apple Pencil**: Works with the drawing canvas for natural handwriting
3. **PWA Support**: Can be installed as a Progressive Web App on iPad

### Installing as PWA on iPad

1. Open the app in Safari on iPad
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will launch in standalone mode

## AWS S3 Configuration

To enable cloud uploads, configure S3 in `src/utils/s3.ts`:

```typescript
import { setS3Config } from './utils/s3';

setS3Config({
  bucket: 'your-bucket-name',
  region: 'us-east-1',
  // Access keys should come from your backend for security
});
```

**Important**: For production, never expose AWS credentials in the frontend. Use a backend API to generate signed URLs.

## Handwriting Recognition (Optional)

To add handwriting recognition:

1. **MyScript Interactive Ink**
   - Sign up at https://webdemo.myscript.com/
   - Add the SDK to your project
   - Integrate in `Notepad.tsx`

2. **Azure Ink Recognizer**
   - Set up Azure Cognitive Services
   - Add the SDK
   - Integrate recognition in Default mode only

## Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Native Features (Capacitor)

To add native device features (Photos app, Contacts API):

1. Install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init
   ```

2. Add iOS platform:
   ```bash
   npx cap add ios
   npx cap sync
   ```

3. Open in Xcode:
   ```bash
   npx cap open ios
   ```

## Troubleshooting

### Canvas not drawing on iPad
- Ensure touch events are not being prevented
- Check browser console for errors
- Try using Safari (best compatibility)

### Photos not uploading
- Check browser permissions for file access
- Verify IndexedDB is available
- Check console for errors

### Export not working
- Ensure html2canvas and jsPDF are installed
- Check browser console for CORS errors
- Try a different browser

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Safari (latest) - Best for iPad
- ✅ Firefox (latest)
- ⚠️ Older browsers may have limited IndexedDB support

## Next Steps

1. Add authentication (JWT)
2. Implement backend API for S3 uploads
3. Add handwriting recognition
4. Enhance month view calendar
5. Add project grouping/organization
6. Implement search functionality
7. Add notifications/reminders

