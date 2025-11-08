// AWS S3 upload utilities using backend API for secure signed URLs

import { uploadAPI } from './api';

export async function uploadToS3(
  file: File,
  folder: string = 'uploads',
  metadata?: Record<string, string>
): Promise<string> {
  try {
    // Get signed URL from backend
    const { uploadUrl, url, key } = await uploadAPI.getSignedUploadUrl(
      file.name,
      file.type,
      folder
    );

    // Upload file to S3 using signed URL
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }

    // Return public URL
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    // Fallback to local storage if backend is not available
    throw error;
  }
}

export async function uploadImageToS3(
  imageFile: File,
  folder: string = 'photos',
  metadata?: Record<string, string>
): Promise<string> {
  return uploadToS3(imageFile, folder, metadata);
}

export async function uploadPDFToS3(
  pdfFile: File,
  folder: string = 'notepad',
  metadata?: Record<string, string>
): Promise<string> {
  return uploadToS3(pdfFile, folder, metadata);
}

export async function getSignedReadUrl(key: string): Promise<string> {
  try {
    const { url } = await uploadAPI.getSignedReadUrl(key);
    return url;
  } catch (error) {
    console.error('Error getting signed read URL:', error);
    throw error;
  }
}

export async function deleteFromS3(key: string): Promise<void> {
  try {
    await uploadAPI.deleteFile(key);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
}

