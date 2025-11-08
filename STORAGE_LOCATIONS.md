# BuildFlow - Data Storage Locations

## Overview

BuildFlow stores data in different locations depending on whether you're using the web version or the native app. This document explains where everything is saved.

---

## 🌐 Web Version (Browser)

### 1. **App Data (Site Visits, Notes, Contacts)**

**Location:** Browser's IndexedDB  
**Database Name:** `buildflow-db`  
**Browser Storage Path:**

#### Chrome/Edge (Windows):
```
C:\Users\<YourUsername>\AppData\Local\Google\Chrome\User Data\Default\IndexedDB\http_localhost_3000.indexeddb.leveldb\
```

#### Firefox (Windows):
```
C:\Users\<YourUsername>\AppData\Roaming\Mozilla\Firefox\Profiles\<profile>\storage\default\http+++localhost+3000\idb\
```

#### Safari (macOS):
```
~/Library/Safari/LocalStorage/IndexedDB/
```

**What's Stored:**
- ✅ Site visits (photos, notes, contacts, costs)
- ✅ Notepad notes (canvas data, signatures)
- ✅ Contacts
- ✅ All app data

**Access:**
- Open browser DevTools (F12)
- Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
- Expand **IndexedDB** → `buildflow-db`
- View/edit data directly

**Persistence:**
- Data persists until you clear browser data
- Survives browser restarts
- **Warning:** Clearing browser cache/data will delete all stored information
- Data is **per-browser** (Chrome data ≠ Firefox data)

---

### 2. **Exported Files (PNG/PDF)**

**Location:** Browser's default download folder

#### Windows:
```
C:\Users\<YourUsername>\Downloads\
```

#### macOS:
```
~/Downloads/
```

#### Linux:
```
~/Downloads/
```

**What's Saved:**
- ✅ Exported notepad notes (PNG)
- ✅ Exported PDFs
- ✅ Any files downloaded from the app

**Access:**
- Files appear in your Downloads folder
- Browser shows download notification
- Files can be moved, shared, or uploaded to cloud

**Note:** 
- Files are saved with the filename you specify (e.g., `notepad-2024-01-15.png`)
- Each export creates a new file
- Files remain on your computer until manually deleted

---

### 3. **Uploaded Photos (Site Visit Photos)**

**Current Implementation:**
- Photos are stored as **Blob URLs** in IndexedDB
- Blob URLs are temporary and point to in-memory data
- Photos are converted to base64 and stored in the database

**Storage Size:**
- IndexedDB has size limits (typically 50% of available disk space)
- Large photos can quickly fill up storage
- Recommended: Use S3 cloud storage for production

**Location in Database:**
- Stored as part of `SiteVisit` objects
- In the `photos` array as base64 data URLs

---

### 4. **Authentication Tokens**

**Location:** Browser's LocalStorage  
**Key:** `authToken`

**Browser Storage Path:**
- Chrome: `Application` tab → `Local Storage` → `http://localhost:3000`
- Firefox: `Storage` tab → `Local Storage` → `http://localhost:3000`

**What's Stored:**
- ✅ JWT authentication token
- Token expires after 7 days (configurable)

**Security:**
- Tokens are stored in plain text (visible in DevTools)
- **Never** store sensitive data in LocalStorage
- Tokens are automatically removed on logout

---

## 📱 Native App (iOS/Android with Capacitor)

### 1. **App Data (Site Visits, Notes, Contacts)**

**Location:** Device's SQLite Database (via Capacitor)  
**Database:** IndexedDB (same as web, but stored in app's sandbox)

#### iOS:
```
/var/mobile/Containers/Data/Application/<AppID>/Library/WebKit/WebsiteData/IndexedDB/
```

#### Android:
```
/data/data/com.buildflow.app/databases/
```

**What's Stored:**
- ✅ Same as web version
- ✅ Site visits, notes, contacts
- ✅ All app data

**Access:**
- Data is in the app's sandbox (not directly accessible)
- Use app's export functionality to access data
- Data persists across app updates
- Data is deleted when app is uninstalled

---

### 2. **Exported Files (PNG/PDF)**

#### iOS:
**Photos App:**
- Saved to **Photos Library**
- Accessible via Photos app
- Organized in "BuildFlow" album (if implemented)

**Files App:**
- Saved to app's **Documents** directory
- Accessible via Files app
- Path: `Files` app → `On My iPhone` → `BuildFlow`

#### Android:
**Downloads:**
- Saved to device's **Downloads** folder
- Accessible via Files app
- Path: `/storage/emulated/0/Download/`

**Files App:**
- Saved to app's **Documents** directory
- Accessible via file manager apps

---

### 3. **Uploaded Photos**

**Current Implementation:**
- Photos can be uploaded to **AWS S3** (if configured)
- Or stored locally in IndexedDB (same as web)

**S3 Storage (Recommended):**
- Photos are uploaded to your S3 bucket
- Organized by user ID and date
- Path: `photos/<userId>/<timestamp>-<filename>`
- Accessible via signed URLs

**Local Storage:**
- Same as web version (IndexedDB)
- Limited by device storage

---

### 4. **Authentication Tokens**

**Location:** App's secure storage (Keychain on iOS, KeyStore on Android)

**Security:**
- Tokens stored in device's secure storage
- More secure than web LocalStorage
- Survives app updates
- Cleared on app uninstall

---

## 📊 Storage Comparison

| Data Type | Web Version | Native App |
|-----------|-------------|------------|
| **App Data** | IndexedDB (browser) | IndexedDB (app sandbox) |
| **Exported PNG/PDF** | Downloads folder | Photos app / Files app |
| **Uploaded Photos** | IndexedDB (base64) | S3 or IndexedDB |
| **Auth Tokens** | LocalStorage | Secure Storage (Keychain/KeyStore) |
| **Persistence** | Until browser data cleared | Until app uninstalled |
| **Accessibility** | Via browser DevTools | Via app export/share |

---

## 🔍 How to View/Export Data

### Web Version:

1. **View IndexedDB Data:**
   - Open DevTools (F12)
   - Go to **Application** tab
   - Expand **IndexedDB** → `buildflow-db`
   - Browse tables: `siteVisits`, `notepadNotes`, `contacts`

2. **Export Data:**
   - Use the app's export features
   - Or manually export from DevTools
   - Data is stored as JSON

3. **Backup Data:**
   - Export all data before clearing browser cache
   - Data cannot be easily restored after deletion

### Native App:

1. **View Data:**
   - Data is in app's sandbox (not directly accessible)
   - Use app's built-in export features
   - Or use device backup (iCloud/Google Backup)

2. **Export Data:**
   - Use "Export" buttons in the app
   - Files are saved to Photos/Files app
   - Can be shared via standard iOS/Android sharing

3. **Backup Data:**
   - Use device backup (automatic on iOS/Android)
   - Or manually export important files
   - S3 uploads are automatically backed up

---

## 💾 Backup Recommendations

### For Web Users:
1. **Regular Exports:**
   - Export important notes as PDF
   - Download photos regularly
   - Keep backups of exported files

2. **Browser Data:**
   - Don't clear browser data without exporting first
   - Use browser sync (Chrome Sync, Firefox Sync) to backup data
   - Consider using S3 for cloud backup

### For Native App Users:
1. **Device Backup:**
   - Enable iCloud backup (iOS)
   - Enable Google Backup (Android)
   - App data is included in backups

2. **Cloud Storage:**
   - Use S3 for photo storage
   - Export important documents
   - Share files to cloud storage (iCloud Drive, Google Drive)

---

## 🚀 Cloud Storage (AWS S3)

### Configuration:
- Requires backend server setup
- Configure AWS credentials in `server/.env`
- Photos and documents uploaded to S3

### Storage Structure:
```
your-bucket/
├── photos/
│   └── <userId>/
│       └── <timestamp>-<filename>
├── notepad/
│   └── <userId>/
│       └── <timestamp>-<filename>.pdf
└── uploads/
    └── <userId>/
        └── <timestamp>-<filename>
```

### Benefits:
- ✅ Persistent storage (not lost on device/browser)
- ✅ Accessible from multiple devices
- ✅ Scalable storage
- ✅ Automatic backups (if configured)
- ✅ Shareable URLs

---

## ⚠️ Important Notes

### Data Loss Prevention:
1. **Web Version:**
   - Clearing browser data = data loss
   - Use S3 for important data
   - Export regularly

2. **Native App:**
   - Uninstalling app = data loss (unless backed up)
   - Use device backup
   - Use S3 for cloud storage

### Storage Limits:
- **IndexedDB:** Typically 50% of available disk space
- **Browser:** Varies by browser and device
- **S3:** Unlimited (pay per usage)

### Privacy & Security:
- **Web:** Data stored locally on your device
- **Native:** Data in app's sandbox (isolated)
- **S3:** Data stored in your AWS account (secure)
- **Tokens:** Stored securely (Keychain/KeyStore in native app)

---

## 🔧 Troubleshooting

### Can't Find Exported Files:
1. **Web:** Check Downloads folder
2. **Native:** Check Photos app or Files app
3. **Check:** Browser/app permissions for file access

### Data Not Persisting:
1. **Web:** Check if browser allows IndexedDB
2. **Native:** Check app permissions
3. **Check:** Storage space available

### Want to Clear Data:
1. **Web:** Clear browser data (Application tab → Clear storage)
2. **Native:** Uninstall and reinstall app
3. **S3:** Delete files from S3 bucket manually

---

## 📝 Summary

**Web Version:**
- Data: Browser IndexedDB
- Exports: Downloads folder
- Photos: IndexedDB (base64) or S3
- Tokens: LocalStorage

**Native App:**
- Data: App sandbox (IndexedDB)
- Exports: Photos app / Files app
- Photos: S3 or IndexedDB
- Tokens: Secure Storage (Keychain/KeyStore)

**Best Practice:**
- Use S3 for cloud storage
- Export important data regularly
- Enable device backups (native app)
- Don't rely solely on local storage

