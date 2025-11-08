import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SiteVisit, NotepadNote, Contact } from '../types';

interface BuildFlowDB extends DBSchema {
  siteVisits: {
    key: string;
    value: SiteVisit;
    indexes: { 'by-date': string };
  };
  notepadNotes: {
    key: string;
    value: NotepadNote;
    indexes: { 'by-date': string };
  };
  contacts: {
    key: string;
    value: Contact;
    indexes: { 'by-name': string };
  };
}

let db: IDBPDatabase<BuildFlowDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<BuildFlowDB>> {
  if (db) return db;

  db = await openDB<BuildFlowDB>('buildflow-db', 1, {
    upgrade(db) {
      // Site visits store
      if (!db.objectStoreNames.contains('siteVisits')) {
        const siteVisitsStore = db.createObjectStore('siteVisits', {
          keyPath: 'id',
        });
        siteVisitsStore.createIndex('by-date', 'date');
      }

      // Notepad notes store
      if (!db.objectStoreNames.contains('notepadNotes')) {
        const notepadStore = db.createObjectStore('notepadNotes', {
          keyPath: 'id',
        });
        notepadStore.createIndex('by-date', 'date');
      }

      // Contacts store
      if (!db.objectStoreNames.contains('contacts')) {
        const contactsStore = db.createObjectStore('contacts', {
          keyPath: 'id',
        });
        contactsStore.createIndex('by-name', 'name');
      }
    },
  });

  return db;
}

// Site Visits
export async function saveSiteVisit(visit: SiteVisit): Promise<void> {
  const database = await initDB();
  await database.put('siteVisits', visit);
}

export async function getSiteVisit(date: string): Promise<SiteVisit | undefined> {
  const database = await initDB();
  const tx = database.transaction('siteVisits', 'readonly');
  const index = tx.store.index('by-date');
  const visits = await index.getAll(date);
  return visits[0];
}

export async function getAllSiteVisits(): Promise<SiteVisit[]> {
  const database = await initDB();
  return database.getAll('siteVisits');
}

// Notepad Notes
export async function saveNotepadNote(note: NotepadNote): Promise<void> {
  const database = await initDB();
  await database.put('notepadNotes', note);
}

export async function getNotepadNote(date: string): Promise<NotepadNote | undefined> {
  const database = await initDB();
  const tx = database.transaction('notepadNotes', 'readonly');
  const index = tx.store.index('by-date');
  const notes = await index.getAll(date);
  return notes[0];
}

export async function getAllNotepadNotes(): Promise<NotepadNote[]> {
  const database = await initDB();
  return database.getAll('notepadNotes');
}

// Contacts
export async function saveContact(contact: Contact): Promise<void> {
  const database = await initDB();
  await database.put('contacts', contact);
}

export async function getAllContacts(): Promise<Contact[]> {
  const database = await initDB();
  return database.getAll('contacts');
}

export async function deleteContact(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('contacts', id);
}

