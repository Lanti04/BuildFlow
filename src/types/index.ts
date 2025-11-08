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
  canvasData: string; // JSON string of canvas state
  signature?: string; // Base64 image
  exported?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasStroke {
  type: 'pen' | 'erase';
  points: { x: number; y: number; pressure?: number }[];
  color: string;
  width: number;
  timestamp: number;
}

