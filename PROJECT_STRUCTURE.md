# BuildFlow Project Structure

```
Rafa New App/
│
├── 📁 public/                          # Static assets (copied to dist/)
│   ├── manifest.json                  # PWA manifest
│   └── vite.svg                        # Favicon
│
├── 📁 src/                             # Source code
│   ├── 📁 components/                 # Reusable React components
│   │   ├── DayCard.tsx                 # Calendar day card component
│   │   ├── ErrorBoundary.tsx           # Error boundary wrapper
│   │   ├── Layout.tsx                  # Main app layout with sidebar
│   │   └── ProtectedRoute.tsx         # Auth-protected route wrapper
│   │
│   ├── 📁 pages/                      # Page components
│   │   ├── Backup.tsx                 # Backup & restore page
│   │   ├── Calendar.tsx               # Calendar view
│   │   ├── Contacts.tsx               # Contacts management
│   │   ├── Dashboard.tsx               # Main dashboard
│   │   ├── Login.tsx                  # Login/Register page
│   │   ├── Notepad.tsx                # Notepad with drawing
│   │   ├── Projects.tsx               # Projects overview
│   │   └── StorageInfo.tsx            # Storage information page
│   │
│   ├── 📁 utils/                       # Utility functions
│   │   ├── api.ts                     # API client (auth, upload, user)
│   │   ├── backup.ts                  # Backup/restore utilities
│   │   ├── export.ts                  # PDF/image export functions
│   │   ├── handwriting.ts             # Azure Ink Recognizer integration
│   │   ├── native.ts                  # Capacitor native features
│   │   ├── s3.ts                      # AWS S3 upload utilities
│   │   ├── storage-info.ts            # IndexedDB storage info
│   │   └── storage.ts                 # IndexedDB operations
│   │
│   ├── 📁 contexts/                    # React contexts
│   │   └── AuthContext.tsx            # Authentication context
│   │
│   ├── 📁 config/                      # Configuration files
│   │   └── azure.ts                   # Azure Ink Recognizer config
│   │
│   ├── 📁 types/                       # TypeScript type definitions
│   │   └── index.ts                   # Shared types (SiteVisit, Contact, etc.)
│   │
│   ├── App.tsx                         # Main app component (routing)
│   ├── main.tsx                        # App entry point
│   ├── index.css                      # Global styles
│   └── vite-env.d.ts                  # Vite type definitions
│
├── 📁 server/                          # Backend server (Node.js/Express)
│   ├── 📁 db/                          # Database layer
│   │   └── users.js                   # In-memory user database
│   │
│   ├── 📁 routes/                      # API routes
│   │   ├── auth.js                    # Authentication routes
│   │   ├── upload.js                  # S3 upload routes
│   │   └── users.js                   # User management routes
│   │
│   ├── server.js                       # Express server entry point
│   ├── package.json                    # Backend dependencies
│   └── README.md                       # Server documentation
│
├── 📁 dist/                            # Build output (generated)
│   ├── assets/                         # Compiled JS/CSS
│   ├── index.html                      # Built HTML
│   ├── manifest.json                   # Copied manifest
│   ├── vite.svg                        # Copied favicon
│   └── .nojekyll                       # GitHub Pages config
│
├── 📄 Configuration Files
│   ├── index.html                      # HTML template
│   ├── vite.config.ts                  # Vite configuration
│   ├── tsconfig.json                   # TypeScript config
│   ├── tsconfig.node.json              # TypeScript config for Node
│   ├── tailwind.config.js              # Tailwind CSS config
│   ├── postcss.config.js               # PostCSS config
│   ├── capacitor.config.ts             # Capacitor config
│   ├── package.json                    # Frontend dependencies & scripts
│   ├── .eslintrc.cjs                   # ESLint config
│   └── .gitignore                      # Git ignore rules
│
└── 📄 Documentation
    ├── README.md                       # Main documentation
    ├── SETUP.md                        # Setup instructions
    ├── INSTALLATION.md                 # Installation guide
    ├── DEPLOYMENT.md                   # Deployment guide
    ├── GITHUB_PAGES_SETUP.md          # GitHub Pages setup
    ├── ENHANCEMENTS.md                # Feature enhancements
    ├── IMPLEMENTATION_SUMMARY.md       # Implementation details
    ├── STORAGE_LOCATIONS.md            # Data storage info
    ├── AWS_SDK_MIGRATION.md           # AWS SDK v2→v3 migration
    └── LOGIN_INFO.md                   # Login credentials
```

## Key Directories

### Frontend (`src/`)
- **components/**: Reusable UI components
- **pages/**: Main application pages/routes
- **utils/**: Helper functions (API, storage, export, etc.)
- **contexts/**: React context providers
- **config/**: Configuration files
- **types/**: TypeScript type definitions

### Backend (`server/`)
- **db/**: Database layer (currently in-memory)
- **routes/**: Express API routes
- **server.js**: Main server file

### Static Assets (`public/`)
- Files here are copied to `dist/` during build
- Used for manifest, favicon, and other static files

### Build Output (`dist/`)
- Generated by `npm run build`
- Deployed to GitHub Pages via `npm run deploy`
- Contains optimized production build

## Important Files

### Entry Points
- `src/main.tsx` - React app entry point
- `src/App.tsx` - Main app component with routing
- `server/server.js` - Backend server entry point

### Configuration
- `vite.config.ts` - Vite build config (base path, plugins)
- `package.json` - Dependencies and npm scripts
- `capacitor.config.ts` - Capacitor mobile app config

### Data Storage
- `src/utils/storage.ts` - IndexedDB operations
- `src/utils/backup.ts` - Backup/restore functionality
- `server/db/users.js` - User database

