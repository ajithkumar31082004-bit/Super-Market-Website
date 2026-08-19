const express = require('express');
const router = express.Router();
const db = require('../config/db');

const sampleProducts = [
    { id: 1, name: 'Organic Apples', description: 'Fresh organic apples from Himachal Pradesh orchards', price: 120, original_price: 140, category: 'Fruits', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', stock: 45, featured: true },
    { id: 2, name: 'Fresh Cow Milk', description: 'Pure pasteurized cow milk, rich in calcium', price: 60, original_price: null, category: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', stock: 120, featured: true },
    { id: 3, name: 'Brown Bread', description: 'Whole wheat brown bread for sandwiches', price: 40, original_price: null, category: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', stock: 75, featured: true },
    { id: 4, name: 'Fresh Potatoes', description: 'Fresh farm potatoes', price: 30, original_price: null, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', stock: 200, featured: false },
    { id: 5, name: 'Orange Juice', description: '100% pure orange juice', price: 90, original_price: null, category: 'Beverages', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', stock: 50, featured: true }
];

// @route   GET /api/products
// @desc    Get all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.json({ success: true, data: rows.length > 0 ? rows : sampleProducts });
    } catch (error) {
        console.warn('[Products API Warning] MySQL DB query failed, returning fallback products:', error.message);
        res.json({ success: true, data: sampleProducts });
    }
});

// @route   GET /api/products/featured
// @desc    Get featured products
router.get('/featured', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE featured = true LIMIT 8');
        res.json({ success: true, data: rows.length > 0 ? rows : sampleProducts.filter(p => p.featured) });
    } catch (error) {
        console.warn('[Products Featured API Warning] MySQL DB query failed, returning fallback featured products:', error.message);
        res.json({ success: true, data: sampleProducts.filter(p => p.featured) });
    }
});

module.exports = router;
