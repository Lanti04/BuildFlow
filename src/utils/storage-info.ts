// Utility to show storage information to users

export interface StorageInfo {
  type: 'web' | 'native';
  dataLocation: string;
  exportLocation: string;
  photosLocation: string;
  canAccess: boolean;
  canBackup: boolean;
}

export async function getStorageInfo(): Promise<StorageInfo> {
  const isNative = typeof window !== 'undefined' && 
    (window as any).Capacitor?.isNativePlatform();

  if (isNative) {
    return {
      type: 'native',
      dataLocation: 'App sandbox (IndexedDB) - Not directly accessible',
      exportLocation: 'Photos app / Files app',
      photosLocation: 'S3 (if configured) or App sandbox',
      canAccess: false,
      canBackup: true,
    };
  }

  // Web version
  const browserName = getBrowserName();
  let dataLocation = 'Browser IndexedDB';
  
  if (browserName === 'Chrome' || browserName === 'Edge') {
    dataLocation = `Chrome/Edge IndexedDB\nView: DevTools → Application → IndexedDB → buildflow-db`;
  } else if (browserName === 'Firefox') {
    dataLocation = `Firefox IndexedDB\nView: DevTools → Storage → IndexedDB → buildflow-db`;
  } else if (browserName === 'Safari') {
    dataLocation = `Safari IndexedDB\nView: DevTools → Storage → IndexedDB → buildflow-db`;
  }

  return {
    type: 'web',
    dataLocation,
    exportLocation: 'Downloads folder',
    photosLocation: 'Browser IndexedDB (base64) or S3',
    canAccess: true,
    canBackup: false,
  };
}

function getBrowserName(): string {
  if (typeof window === 'undefined') return 'Unknown';
  
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  return 'Unknown';
}

export async function getStorageSize(): Promise<{
  used: number;
  available: number;
  percentage: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const available = estimate.quota || 0;
    const percentage = available > 0 ? (used / available) * 100 : 0;
    
    return {
      used,
      available,
      percentage,
    };
  }
  
  return {
    used: 0,
    available: 0,
    percentage: 0,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

