// src/types/index.ts

export interface SiteVisit {
  id: string;
  date: string; // ISO date string
  photos: Photo[];
  notes: string;
  contact: Contact | null;
  estimatedCost: number | null;
  estimatedDuration: number | null; // in hours
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface NotepadNote {
  id: string;
  date: string;
  mode: 'default' | 'custom';
  templateUrl?: string;
  canvasData: string;
  signature?: string;
  images?: ImageOverlay[];   // Only saved data
  exported?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImageOverlay {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// NEW: Runtime-only state (not saved)
export interface ImageOverlayWithState extends ImageOverlay {
  isDragging?: boolean;
  isResizing?: boolean;
  resizeHandle?: 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r';
  originalX?: number;
  originalY?: number;
  originalWidth?: number;
  originalHeight?: number;
}