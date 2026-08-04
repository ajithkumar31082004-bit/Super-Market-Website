const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToS3, getPresignedUrl } = require('../services/s3Service');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   POST /api/upload
// @desc    Upload an image file directly to AWS S3
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file uploaded' });
        }

        const imageUrl = await uploadToS3(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        res.json({
            success: true,
            message: 'Image uploaded successfully to AWS S3',
            url: imageUrl
        });
    } catch (error) {
        console.error('[Upload Route Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to upload image to S3', error: error.message });
    }
});

// @route   POST /api/upload/presigned
// @desc    Get a presigned upload URL for direct client S3 upload
router.post('/presigned', async (req, res) => {
    try {
        const { fileName, mimeType } = req.body;
        if (!fileName || !mimeType) {
            return res.status(400).json({ success: false, message: 'fileName and mimeType are required' });
        }

        const data = await getPresignedUrl(fileName, mimeType);
        res.json({ success: true, ...data });
    } catch (error) {
        console.error('[Presigned URL Route Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to generate presigned URL', error: error.message });
    }
});

module.exports = router;
