import express from 'express';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const S3_BUCKET = process.env.AWS_S3_BUCKET;

// Get signed URL for uploading
router.post('/signed-url', authenticateToken, async (req, res) => {
  try {
    const { filename, fileType, folder = 'uploads' } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({ error: 'Filename and fileType are required' });
    }

    if (!S3_BUCKET) {
      return res.status(500).json({ error: 'S3 bucket not configured' });
    }

    const key = `${folder}/${req.user.userId}/${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    res.json({
      uploadUrl,
      key,
      url: `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// Get signed URL for reading
router.post('/signed-read-url', authenticateToken, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    if (!S3_BUCKET) {
      return res.status(500).json({ error: 'S3 bucket not configured' });
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const readUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    res.json({ url: readUrl });
  } catch (error) {
    console.error('Error generating read URL:', error);
    res.status(500).json({ error: 'Failed to generate read URL' });
  }
});

// Delete file from S3
router.delete('/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;

    if (!S3_BUCKET) {
      return res.status(500).json({ error: 'S3 bucket not configured' });
    }

    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;

