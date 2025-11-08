// Native device features using Capacitor
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const isNative = Capacitor.isNativePlatform();

// Save image to device Photos app (iOS/Android)
export async function saveImageToPhotos(blob: Blob, filename: string): Promise<void> {
  if (!isNative) {
    // Fallback for web
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  try {
    // For native, we'll use the Filesystem API to save to a location
    // that can be accessed by the Photos app
    // Note: For full Photos app integration, you may need to use a plugin
    // like @capacitor-community/photo-library (requires Capacitor 3)
    // or implement native code
    
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    const base64String = base64Data.split(',')[1];

    // Save to Documents directory (can be accessed by Photos app via Files)
    await Filesystem.writeFile({
      path: filename,
      data: base64String,
      directory: Directory.Documents,
      recursive: true,
    });

    console.log('Image saved to Documents (accessible via Files app)');
  } catch (error) {
    console.error('Error saving image:', error);
    // Fallback to download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Save PDF to device Files app
export async function savePDFToFiles(blob: Blob, filename: string): Promise<void> {
  if (!isNative) {
    // Fallback for web
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  try {
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    const base64String = base64Data.split(',')[1];

    // Save to Documents directory
    await Filesystem.writeFile({
      path: filename,
      data: base64String,
      directory: Directory.Documents,
      recursive: true,
    });

    console.log('PDF saved to Files app');
  } catch (error) {
    console.error('Error saving PDF to Files:', error);
    throw error;
  }
}

// Get contacts from device
export async function getDeviceContacts(): Promise<Array<{
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}>> {
  if (!isNative) {
    // Fallback for web - Contacts API is not available
    console.warn('Contacts API not available on web. Use native app for contact access.');
    return [];
  }

  try {
    // Note: Contacts API requires a plugin that's compatible with Capacitor 5
    // For now, we'll return an empty array and show a message
    // To implement contacts, you can:
    // 1. Use a Capacitor 5-compatible contacts plugin
    // 2. Implement native code directly
    // 3. Use the Web Contacts API (limited browser support)
    
    console.warn('Contacts API requires additional setup. Please implement native contacts access.');
    return [];
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
}

// Helper: Convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Check if platform is iOS
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

// Check if platform is Android
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

