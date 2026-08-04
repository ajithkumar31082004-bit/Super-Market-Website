const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET /api/products
// @desc    Get all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/products/featured
// @desc    Get featured products
router.get('/featured', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE featured = true LIMIT 8');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
