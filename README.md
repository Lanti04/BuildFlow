# BuildFlow - Construction Site Management App

BuildFlow is a modern web/iPad application for construction, interior, and exterior business owners to manage daily site visits, photos, client information, and signable notes.

## Features

### 📅 Calendar Dashboard
- Month, week, and day views for site visits
- Visual day cards with thumbnails and previews
- Easy navigation between dates

### 📸 Site Visit Management
- Upload multiple photos from camera or gallery
- Add job descriptions and notes
- Attach client contact information
- Track estimated cost and duration
- View and manage attachments inline

### 📝 Notepad with Two Modes

#### Default Notepad Mode
- Clean, lined A4-style paper background
- Handwriting input support (Apple Pencil & touch)
- Auto-aligned text formatting (optional handwriting recognition)
- Signature capture at bottom
- Export to PNG or PDF

#### Custom Template Mode
- Upload your own paper template (image or PDF)
- Write directly into custom fields
- No auto-alignment - strokes stay exactly where drawn
- Zoom and pan functionality
- Export filled templates as image or PDF

### 👥 Contact Management
- Add and manage client contacts
- Import from device contacts (requires native implementation)
- Link contacts to site visits

### 📊 Projects Overview
- View all site visits in one place
- Track total costs and hours
- Quick access to visit details

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS
- **Drawing Canvas**: react-sketch-canvas
- **Routing**: React Router v6
- **Storage**: IndexedDB (via idb library)
- **PDF Export**: jsPDF + html2canvas
- **Date Utilities**: date-fns
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern browser with IndexedDB support

### Installation

1. Clone the repository:
```bash
cd "C:\Users\taula\Rafa New App"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   └── DayCard.tsx     # Day visit card component
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard with calendar
│   ├── Calendar.tsx    # Calendar view
│   ├── Contacts.tsx    # Contact management
│   ├── Projects.tsx    # Projects overview
│   └── Notepad.tsx     # Notepad with drawing canvas
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── storage.ts      # IndexedDB operations
│   ├── s3.ts           # AWS S3 upload utilities
│   └── export.ts       # PDF/image export functions
├── App.tsx             # Main app component with routing
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Key Features Implementation

### Offline Storage
All data is stored locally using IndexedDB, allowing the app to work offline. Data syncs when online (S3 upload integration ready).

### Drawing & Canvas
- Uses `react-sketch-canvas` for smooth drawing with Apple Pencil and touch support
- Supports pen and eraser modes
- Configurable stroke color and width
- Undo/redo functionality
- Zoom and pan controls

### Export Functionality
- Export notepad notes as high-resolution PNG
- Export as PDF with signature embedded
- Save to device or upload to AWS S3

### AWS S3 Integration
S3 upload utilities are included but require backend configuration for secure signed URLs. See `src/utils/s3.ts` for implementation details.

## Enhancements (Implemented)

### ✅ Handwriting Recognition
- Azure Ink Recognizer API integration
- Available in Default Notepad mode
- Converts handwriting to text
- See `ENHANCEMENTS.md` for setup

### ✅ Native Features (Capacitor)
- iOS/Android native app support
- Photos app integration
- Contacts API integration
- Files app integration
- See `ENHANCEMENTS.md` for setup

### ✅ Backend API Server
- Node.js/Express server
- JWT authentication
- AWS S3 signed URL generation
- User management
- See `server/README.md` for setup

### ✅ Authentication
- JWT-based authentication
- Protected routes
- Login/Register UI
- User profile management
- See `ENHANCEMENTS.md` for setup

## Quick Start with Enhancements

1. **Start Backend Server:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   npm install
   # Create .env file with VITE_API_BASE_URL=http://localhost:3001/api
   npm run dev
   ```

3. **For Native iOS App:**
   ```bash
   npm run build
   npm run cap:sync
   npm run cap:open:ios
   ```

See `ENHANCEMENTS.md` for detailed setup instructions for all enhancements.

## Browser Support

- Chrome/Edge (latest)
- Safari (latest) - Best for iPad
- Firefox (latest)

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## License

MIT License - feel free to use this project for your business.

## Notes

- The app is designed to work as a Progressive Web App (PWA) on iPad
- For full native device integration (Photos app, Contacts API), consider using Capacitor
- AWS S3 upload requires backend setup for secure signed URLs
- Handwriting recognition is optional and can be integrated later

