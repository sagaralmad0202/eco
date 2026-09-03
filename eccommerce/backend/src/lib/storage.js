const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const env = require("../config/env");
const logger = require("./logger");

let s3ClientInstance = null;

function getS3Client() {
  if (s3ClientInstance) return s3ClientInstance;

  const config = {
    region: env.STORAGE_REGION || "us-east-1",
    forcePathStyle: true, // S3-compatible providers (Neon, MinIO, Ceph) require path-style addressing
  };

  if (env.STORAGE_ENDPOINT) {
    config.endpoint = env.STORAGE_ENDPOINT;
  }

  if (env.STORAGE_ACCESS_KEY && env.STORAGE_SECRET_KEY) {
    config.credentials = {
      accessKeyId: env.STORAGE_ACCESS_KEY,
      secretAccessKey: env.STORAGE_SECRET_KEY,
    };
  }

  s3ClientInstance = new S3Client(config);
  return s3ClientInstance;
}

/**
 * Derives the direct public HTTP URL for an object key in the bucket.
 *
 * @param {string} key - e.g. "products/leather-tote-bag.webp"
 * @returns {string} - e.g. "https://storage.neon.tech/ecommerce/products/leather-tote-bag.webp"
 */
function getPublicUrl(key) {
  const cleanKey = key.replace(/^\/+/, "");

  if (env.STORAGE_PUBLIC_URL) {
    return `${env.STORAGE_PUBLIC_URL.replace(/\/+$/, "")}/${cleanKey}`;
  }

  if (env.STORAGE_ENDPOINT && env.STORAGE_BUCKET) {
    return `${env.STORAGE_ENDPOINT.replace(/\/+$/, "")}/${env.STORAGE_BUCKET}/${cleanKey}`;
  }

  if (env.STORAGE_BUCKET) {
    return `https://${env.STORAGE_BUCKET}.s3.${env.STORAGE_REGION || "us-east-1"}.amazonaws.com/${cleanKey}`;
  }

  return `https://storage.neon.tech/ecommerce/${cleanKey}`;
}

/**
 * Checks if an object already exists in the bucket to prevent duplicate uploads (idempotency).
 *
 * @param {string} key
 * @returns {Promise<boolean>}
 */
async function objectExists(key) {
  if (!env.STORAGE_BUCKET) return false;

  const client = getS3Client();
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: key.replace(/^\/+/, ""),
      }),
    );
    return true;
  } catch (err) {
    if (
      err.name === "NotFound" ||
      err.$metadata?.httpStatusCode === 404 ||
      err.code === "NotFound"
    ) {
      return false;
    }
    // If permission or networking error, log warning and return false
    logger.warn({ err: err.message, key }, "Error checking object existence in S3");
    return false;
  }
}

/**
 * Uploads a file buffer or stream directly to Object Storage.
 *
 * @param {object} params
 * @param {string} params.key - Bucket object key (e.g. "products/iphone.webp")
 * @param {Buffer|Uint8Array|Blob|string} params.body - Binary data
 * @param {string} params.contentType - MIME type (e.g. "image/webp")
 * @param {boolean} [params.isPublic=true]
 * @returns {Promise<{ key: string, url: string, size: number }>}
 */
async function uploadObject({ key, body, contentType, isPublic = true }) {
  const cleanKey = key.replace(/^\/+/, "");
  const bucket = env.STORAGE_BUCKET || "ecommerce";
  const client = getS3Client();

  const commandParams = {
    Bucket: bucket,
    Key: cleanKey,
    Body: body,
    ContentType: contentType || "application/octet-stream",
  };

  await client.send(new PutObjectCommand(commandParams));

  const url = getPublicUrl(cleanKey);
  const size = Buffer.isBuffer(body) ? body.length : 0;

  logger.info({ key: cleanKey, bucket, url }, "Uploaded object to Object Storage");

  return {
    key: cleanKey,
    url,
    size,
    contentType,
  };
}

/**
 * Deletes an object from the bucket.
 *
 * @param {string} key
 * @returns {Promise<void>}
 */
async function deleteObject(key) {
  if (!env.STORAGE_BUCKET) return;
  const client = getS3Client();
  const cleanKey = key.replace(/^\/+/, "");

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: env.STORAGE_BUCKET,
        Key: cleanKey,
      }),
    );
    logger.info({ key: cleanKey }, "Deleted object from Object Storage");
  } catch (err) {
    logger.warn({ err: err.message, key: cleanKey }, "Failed to delete object from Object Storage");
  }
}

function _setStorageClientForTesting(client) {
  s3ClientInstance = client;
}

module.exports = {
  getS3Client,
  getPublicUrl,
  objectExists,
  uploadObject,
  deleteObject,
  _setStorageClientForTesting,
};
