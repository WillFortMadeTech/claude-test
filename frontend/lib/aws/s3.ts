import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure S3 client for LocalStack
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
  forcePathStyle: true, // Required for LocalStack
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'reminder-images';
export const S3_PUBLIC_ENDPOINT = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:4566';

/**
 * Generate a presigned URL for uploading an image to S3
 */
export async function generateUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Generate a presigned URL for downloading/viewing an image from S3
 */
export async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

/**
 * Get the public URL for an object in S3 (for LocalStack)
 */
export function getPublicUrl(key: string): string {
  return `${S3_PUBLIC_ENDPOINT}/${BUCKET_NAME}/${key}`;
}

/**
 * Delete an object from S3
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}
