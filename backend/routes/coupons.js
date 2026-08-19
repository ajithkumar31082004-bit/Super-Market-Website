const express = require('express');
const router = express.Router();

// Pre-configured coupons
const AVAILABLE_COUPONS = [
    { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 200, description: '10% OFF on orders above ₹200' },
    { code: 'FRESH20', type: 'percentage', value: 20, minOrder: 500, description: '20% OFF on fresh orders above ₹500' },
    { code: 'SAVE50', type: 'flat', value: 50, minOrder: 300, description: 'Flat ₹50 OFF on orders above ₹300' },
    { code: 'FRUITS15', type: 'percentage', value: 15, minOrder: 250, description: '15% OFF on fruit baskets above ₹250' },
    { code: 'SUPER100', type: 'flat', value: 100, minOrder: 800, description: 'Flat ₹100 OFF on mega orders above ₹800' }
];

// @route   GET /api/coupons
// @desc    Get all available public coupons
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: AVAILABLE_COUPONS
    });
});

// @route   POST /api/coupons/validate
// @desc    Validate a promo code against cart total
router.post('/validate', (req, res) => {
    const { code, totalAmount } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS.find(c => c.code === cleanCode);

    if (!coupon) {
        return res.status(404).json({ 
            success: false, 
            message: `Coupon code "${cleanCode}" is invalid or expired.` 
        });
    }

    const orderTotal = parseFloat(totalAmount) || 0;
    if (orderTotal < coupon.minOrder) {
        return res.status(400).json({ 
            success: false, 
            message: `Minimum order amount of ₹${coupon.minOrder} required for coupon ${coupon.code}.` 
        });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = Math.round((orderTotal * coupon.value) / 100);
    } else if (coupon.type === 'flat') {
        discount = Math.min(coupon.value, orderTotal);
    }

    const finalAmount = Math.max(0, orderTotal - discount);

    res.json({
        success: true,
        message: `Coupon "${coupon.code}" applied successfully! You saved ₹${discount}.`,
        data: {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount,
            finalAmount,
            description: coupon.description
        }
    });
});

module.exports = router;
