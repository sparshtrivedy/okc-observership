import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET = process.env.S3_BUCKET;

const hasS3Env = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && AWS_REGION && S3_BUCKET);

const s3Client = hasS3Env
  ? new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })
  : null;

function sanitizePathPart(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function assertConfigured() {
  if (!s3Client || !S3_BUCKET) {
    throw new Error('S3 is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET');
  }
}

export function isS3Configured() {
  return Boolean(s3Client && S3_BUCKET);
}

export function buildApplicantDocumentKey(applicantId, docType, fileName) {
  const safeDocType = sanitizePathPart(docType);
  const safeFileName = sanitizePathPart(fileName) || 'document.pdf';
  return `uploads/${sanitizePathPart(applicantId)}/${Date.now()}-${safeDocType}-${safeFileName}`;
}

export async function createDocumentUploadUrl({ key, contentType }) {
  assertConfigured();
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType || 'application/pdf'
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 });
  return uploadUrl;
}

export async function createDocumentDownloadUrl({ key }) {
  assertConfigured();
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key
  });

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return downloadUrl;
}
