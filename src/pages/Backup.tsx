import { useState, useEffect } from 'react';
import { Upload, Download, Cloud, HardDrive, RefreshCw, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
import {
  createBackup,
  uploadBackupToS3,
  exportBackupAsFile,
  importBackupFromFile,
  getLastBackupInfo,
  shouldPerformBackup,
  performAutomaticBackup,
} from '../utils/backup';

export default function Backup() {
  const [lastBackup, setLastBackup] = useState<any>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backupNeeded, setBackupNeeded] = useState(false);

  useEffect(() => {
    loadBackupInfo();
    checkBackupNeeded();
  }, []);

  const loadBackupInfo = () => {
    const info = getLastBackupInfo();
    setLastBackup(info);
  };

  const checkBackupNeeded = () => {
    setBackupNeeded(shouldPerformBackup());
  };

  const handleCreateBackup = async (uploadToS3: boolean = false) => {
    setIsBackingUp(true);
    setMessage(null);

    try {
      if (uploadToS3) {
        // Create and upload to S3
        const backup = await createBackup();
        const backupUrl = await uploadBackupToS3(backup);
        setMessage({
          type: 'success',
          text: `Backup uploaded to S3 successfully! URL: ${backupUrl}`,
        });
      } else {
        // Export as file
        await exportBackupAsFile();
        setMessage({
          type: 'success',
          text: 'Backup file downloaded to your Downloads folder',
        });
      }

      loadBackupInfo();
      checkBackupNeeded();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create backup. Make sure S3 is configured for cloud backup.',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleAutomaticBackup = async () => {
    setIsBackingUp(true);
    setMessage(null);

    try {
      const success = await performAutomaticBackup();
      if (success) {
        setMessage({
          type: 'success',
          text: 'Automatic backup completed successfully!',
        });
        loadBackupInfo();
        checkBackupNeeded();
      } else {
        setMessage({
          type: 'error',
          text: 'Automatic backup failed. Check S3 configuration.',
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Automatic backup failed.',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setMessage(null);

    try {
      await importBackupFromFile(file);
      setMessage({
        type: 'success',
        text: 'Backup restored successfully! All data has been imported.',
      });
      // Reload page to show restored data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to restore backup. Please check the file format.',
      });
    } finally {
      setIsRestoring(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
        <p className="text-gray-600 mt-1">Protect your data with automatic cloud backups</p>
      </div>

      {/* Status Alert */}
      {backupNeeded && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-900">Backup Recommended</p>
            <p className="text-sm text-yellow-800">
              Your last backup was more than 24 hours ago. Create a backup to protect your data.
            </p>
          </div>
        </div>
      )}

      {/* Last Backup Info */}
      {lastBackup && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Last Backup</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">
                {new Date(lastBackup.date).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items Backed Up:</span>
              <span className="text-gray-900">{lastBackup.itemCount}</span>
            </div>
            {lastBackup.url && (
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="text-gray-900 text-xs font-mono truncate max-w-md">
                  {lastBackup.url}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Backup - Download */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Download Backup</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Create a backup file and download it to your computer. Store it safely for data recovery.
          </p>
          <button
            onClick={() => handleCreateBackup(false)}
            disabled={isBackingUp}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FileJson className="w-5 h-5" />
            {isBackingUp ? 'Creating Backup...' : 'Download Backup File'}
          </button>
        </div>

        {/* Create Backup - S3 Upload */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Upload to Cloud</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Upload backup to AWS S3 for cloud storage. Requires S3 configuration.
          </p>
          <button
            onClick={() => handleCreateBackup(true)}
            disabled={isBackingUp}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Cloud className="w-5 h-5" />
            {isBackingUp ? 'Uploading...' : 'Upload to S3'}
          </button>
        </div>

        {/* Automatic Backup */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Automatic Backup</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Manually trigger automatic backup to S3. Backups run automatically every 24 hours.
          </p>
          <button
            onClick={handleAutomaticBackup}
            disabled={isBackingUp}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {isBackingUp ? 'Backing Up...' : 'Run Automatic Backup'}
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Restore Backup</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Import a backup file to restore all your data. This will replace current data.
          </p>
          <label className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            {isRestoring ? 'Restoring...' : 'Import Backup File'}
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={isRestoring}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <HardDrive className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900">How Backup Works</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Automatic Backups:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Backups run automatically every 24 hours (if S3 is configured)</li>
                <li>All site visits, contacts, and notepad notes are backed up</li>
                <li>Backups are stored in your S3 bucket under the "backups" folder</li>
                <li>Backup metadata is stored locally to track last backup time</li>
              </ul>
              <p className="mt-3"><strong>Manual Backups:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Download backup files to store on your computer or cloud storage</li>
                <li>Upload backups to S3 for cloud storage</li>
                <li>Backup files are JSON format and can be opened in any text editor</li>
              </ul>
              <p className="mt-3"><strong>Restore:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Import backup files to restore all your data</li>
                <li>Restore will replace current data with backup data</li>
                <li>Always create a backup before restoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Backups include all site visits, contacts, and notepad notes</li>
              <li>Photos are stored separately (in IndexedDB or S3)</li>
              <li>Restoring will replace all current data</li>
              <li>Keep backup files in a safe location</li>
              <li>S3 backups require backend server and AWS configuration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

