import { useState, useEffect } from 'react';
import { Info, Database, Download, Image, Key, Cloud, HardDrive } from 'lucide-react';
import { getStorageInfo, getStorageSize, formatBytes } from '../utils/storage-info';
import { isNative } from '../utils/native';

export default function StorageInfo() {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [storageSize, setStorageSize] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInfo() {
      const info = await getStorageInfo();
      const size = await getStorageSize();
      setStorageInfo(info);
      setStorageSize(size);
      setLoading(false);
    }
    loadInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Storage Information</h1>
        <p className="text-gray-600 mt-1">Where your data is stored and how to access it</p>
      </div>

      {/* Storage Type Badge */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          {isNative ? (
            <>
              <HardDrive className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Native App</p>
                <p className="text-sm text-gray-600">Running as iOS/Android app</p>
              </div>
            </>
          ) : (
            <>
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Web Browser</p>
                <p className="text-sm text-gray-600">Running in browser</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Storage Size */}
      {storageSize && storageSize.available > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Used</span>
                <span>{formatBytes(storageSize.used)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(storageSize.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Available</span>
              <span>{formatBytes(storageSize.available)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Percentage Used</span>
              <span>{storageSize.percentage.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Data Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* App Data */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">App Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Site visits, notes, contacts
          </p>
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 font-mono whitespace-pre-wrap">
            {storageInfo?.dataLocation || 'Loading...'}
          </div>
          {storageInfo?.canAccess && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Access via: DevTools → Application → IndexedDB
            </p>
          )}
        </div>

        {/* Exported Files */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Exported Files</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            PNG, PDF exports
          </p>
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-700">
            {isNative ? (
              <>
                <p>📱 iOS: Photos app / Files app</p>
                <p>🤖 Android: Downloads / Files app</p>
              </>
            ) : (
              <>
                <p>💻 Windows: C:\Users\&lt;You&gt;\Downloads\</p>
                <p>🍎 macOS: ~/Downloads/</p>
                <p>🐧 Linux: ~/Downloads/</p>
              </>
            )}
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Site visit photos
          </p>
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-700">
            {storageInfo?.photosLocation || 'Loading...'}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Configure S3 for cloud storage
          </p>
        </div>

        {/* Auth Tokens */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Key className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Auth Tokens</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Authentication tokens
          </p>
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-700">
            {isNative ? (
              <>
                <p>🔒 iOS: Keychain</p>
                <p>🔒 Android: KeyStore</p>
              </>
            ) : (
              <>
                <p>🌐 Browser: LocalStorage</p>
                <p>💡 View: DevTools → Application → Local Storage</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900">How to Access Your Data</h3>
            
            {isNative ? (
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>View App Data:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Data is stored in the app's sandbox (not directly accessible)</li>
                  <li>Use the app's export features to access data</li>
                  <li>Exported files appear in Photos app or Files app</li>
                </ul>
                <p className="mt-3"><strong>Backup Data:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Enable device backup (iCloud/Google Backup)</li>
                  <li>Export important documents regularly</li>
                  <li>Use S3 for cloud storage</li>
                </ul>
              </div>
            ) : (
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>View App Data:</strong></p>
                <ol className="list-decimal list-inside ml-2 space-y-1">
                  <li>Open browser DevTools (F12)</li>
                  <li>Go to <strong>Application</strong> tab (Chrome) or <strong>Storage</strong> tab (Firefox)</li>
                  <li>Expand <strong>IndexedDB</strong> → <strong>buildflow-db</strong></li>
                  <li>Browse tables: siteVisits, notepadNotes, contacts</li>
                </ol>
                <p className="mt-3"><strong>Backup Data:</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Export important notes as PDF</li>
                  <li>Download photos regularly</li>
                  <li>Don't clear browser data without exporting first</li>
                  <li>Consider using S3 for cloud backup</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Storage */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cloud Storage (AWS S3)</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Configure S3 for persistent cloud storage. Photos and documents uploaded to S3 are accessible from any device and automatically backed up.
        </p>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-xs text-gray-700 font-mono">
            Storage Path: your-bucket/photos/&lt;userId&gt;/&lt;filename&gt;
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 Configure S3 in <code className="bg-gray-100 px-1 rounded">server/.env</code>
        </p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li><strong>Web:</strong> Clearing browser data will delete all stored information</li>
              <li><strong>Native:</strong> Uninstalling the app will delete all data (unless backed up)</li>
              <li>Export important data regularly</li>
              <li>Use S3 for cloud storage in production</li>
              <li>Enable device backups for native apps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

