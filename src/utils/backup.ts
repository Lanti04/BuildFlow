// Automatic data backup to prevent data loss
// Syncs IndexedDB data to AWS S3 for cloud backup

import { getAllSiteVisits, getAllContacts, getAllNotepadNotes } from './storage';
import { SiteVisit, Contact, NotepadNote } from '../types';
import { uploadAPI } from './api';

export interface BackupData {
  siteVisits: SiteVisit[];
  contacts: Contact[];
  notepadNotes: NotepadNote[];
  backupDate: string;
  version: string;
}

const BACKUP_VERSION = '1.0.0';

// Create a complete backup of all data
export async function createBackup(): Promise<BackupData> {
  const [siteVisits, contacts, notepadNotes] = await Promise.all([
    getAllSiteVisits(),
    getAllContacts(),
    getAllNotepadNotes(),
  ]);

  return {
    siteVisits,
    contacts,
    notepadNotes,
    backupDate: new Date().toISOString(),
    version: BACKUP_VERSION,
  };
}

// Upload backup to S3
export async function uploadBackupToS3(backup: BackupData): Promise<string> {
  try {
    const backupJson = JSON.stringify(backup, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const file = new File([blob], `backup-${new Date().toISOString().split('T')[0]}.json`, {
      type: 'application/json',
    });

    // Get signed URL for upload
    const { uploadUrl, url } = await uploadAPI.getSignedUploadUrl(
      file.name,
      'application/json',
      'backups'
    );

    // Upload to S3
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload backup to S3');
    }

    return url;
  } catch (error) {
    console.error('Error uploading backup to S3:', error);
    throw error;
  }
}

// Download backup from S3
export async function downloadBackupFromS3(key: string): Promise<BackupData> {
  try {
    const { url } = await uploadAPI.getSignedReadUrl(key);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to download backup from S3');
    }

    const backup: BackupData = await response.json();
    return backup;
  } catch (error) {
    console.error('Error downloading backup from S3:', error);
    throw error;
  }
}

// Restore data from backup
export async function restoreFromBackup(backup: BackupData): Promise<void> {
  const { saveSiteVisit, saveContact, saveNotepadNote } = await import('./storage');

  // Restore site visits
  for (const visit of backup.siteVisits) {
    await saveSiteVisit(visit);
  }

  // Restore contacts
  for (const contact of backup.contacts) {
    await saveContact(contact);
  }

  // Restore notepad notes
  for (const note of backup.notepadNotes) {
    await saveNotepadNote(note);
  }
}

// Automatic backup (runs periodically)
export async function performAutomaticBackup(): Promise<boolean> {
  try {
    const backup = await createBackup();
    const backupUrl = await uploadBackupToS3(backup);
    
    // Store backup metadata in localStorage
    const backupMetadata = {
      url: backupUrl,
      date: backup.backupDate,
      itemCount: backup.siteVisits.length + backup.contacts.length + backup.notepadNotes.length,
    };
    
    localStorage.setItem('lastBackup', JSON.stringify(backupMetadata));
    
    console.log('Automatic backup completed:', backupUrl);
    return true;
  } catch (error) {
    console.error('Automatic backup failed:', error);
    return false;
  }
}

// Get last backup info
export function getLastBackupInfo(): { url: string; date: string; itemCount: number } | null {
  const lastBackup = localStorage.getItem('lastBackup');
  if (!lastBackup) return null;
  
  try {
    return JSON.parse(lastBackup);
  } catch {
    return null;
  }
}

// Check if backup is needed (if last backup was more than 24 hours ago)
export function shouldPerformBackup(): boolean {
  const lastBackup = getLastBackupInfo();
  if (!lastBackup) return true;
  
  const lastBackupDate = new Date(lastBackup.date);
  const now = new Date();
  const hoursSinceBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceBackup >= 24; // Backup if more than 24 hours old
}

// Export backup as downloadable file
export async function exportBackupAsFile(): Promise<void> {
  const backup = await createBackup();
  const backupJson = JSON.stringify(backup, null, 2);
  const blob = new Blob([backupJson], { type: 'application/json' });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `buildflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import backup from file
export async function importBackupFromFile(file: File): Promise<void> {
  const text = await file.text();
  const backup: BackupData = JSON.parse(text);
  
  if (!backup.siteVisits || !backup.contacts || !backup.notepadNotes) {
    throw new Error('Invalid backup file format');
  }
  
  await restoreFromBackup(backup);
}

