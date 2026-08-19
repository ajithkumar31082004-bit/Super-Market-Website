const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/reviews/:productId
// @desc    Get reviews for a product
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const [reviews] = await db.query(
            'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
            [productId]
        );
        res.json({ success: true, data: reviews });
    } catch (err) {
        // Fallback for when table doesn't exist yet
        res.json({ success: true, data: [] });
    }
});

// @route   POST /api/reviews
// @desc    Add a new product review
router.post('/', async (req, res) => {
    const { productId, userName, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
        return res.status(400).json({ success: false, message: 'Rating and review comment are required.' });
    }

    const ratingNum = Math.min(5, Math.max(1, parseFloat(rating) || 5));
    const reviewerName = userName || 'Verified Customer';

    try {
        // Ensure reviews table exists
        await db.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                user_name VARCHAR(100) DEFAULT 'Verified Customer',
                rating DECIMAL(2,1) NOT NULL,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);

        const [result] = await db.query(
            'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
            [productId, reviewerName, ratingNum, comment.trim()]
        );

        // Compute updated average rating
        const [avgRows] = await db.query(
            'SELECT AVG(rating) as avgRating, COUNT(id) as totalReviews FROM reviews WHERE product_id = ?',
            [productId]
        );

        const newAvg = parseFloat(avgRows[0].avgRating || ratingNum).toFixed(1);
        const totalRev = avgRows[0].totalReviews || 1;

        res.json({
            success: true,
            message: 'Thank you! Your review has been submitted.',
            data: {
                id: result.insertId,
                productId,
                userName: reviewerName,
                rating: ratingNum,
                comment: comment.trim(),
                newAverageRating: newAvg,
                totalReviews: totalRev
            }
        });
    } catch (err) {
        console.error('[Reviews Error]:', err.message);
        res.status(500).json({ success: false, message: 'Failed to submit review', error: err.message });
    }
});

module.exports = router;
