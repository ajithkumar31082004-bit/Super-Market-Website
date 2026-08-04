const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client } = require('../config/aws');

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'supermarket-product-images';

/**
 * Uploads a file buffer to AWS S3 bucket.
 * @param {Buffer} fileBuffer - File binary data
 * @param {string} fileName - Destination file name
 * @param {string} mimeType - File MIME type (e.g. image/jpeg)
 * @returns {Promise<string>} S3 Public or Direct Object URL
 */
async function uploadToS3(fileBuffer, fileName, mimeType) {
    const key = `products/${Date.now()}_${fileName.replace(/\s+/g, '_')}`;

    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const region = process.env.AWS_REGION || 'us-east-1';
    return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Generates a presigned URL for direct client-side S3 uploads.
 * @param {string} fileName - Destination file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{ uploadUrl: string, fileUrl: string, key: string }>}
 */
async function getPresignedUrl(fileName, mimeType) {
    const key = `uploads/${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: mimeType
    };

    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const region = process.env.AWS_REGION || 'us-east-1';
    const fileUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl, key };
}

module.exports = {
    uploadToS3,
    getPresignedUrl
};
