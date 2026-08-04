const express = require('express');
const router = express.Router();
const { saveCartState, getCartState, clearCartState } = require('../services/dynamoService');

// @route   GET /api/cart/:userId
// @desc    Get user's shopping cart state from AWS DynamoDB
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const items = await getCartState(userId);
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('[Cart GET Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cart from DynamoDB', error: error.message });
    }
});

// @route   POST /api/cart
// @desc    Save/Sync user's shopping cart state to AWS DynamoDB
router.post('/', async (req, res) => {
    try {
        const { userId, items } = req.body;
        if (!userId || !Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'userId and items array are required' });
        }

        const result = await saveCartState(userId, items);
        res.json({ success: true, message: 'Cart synced with AWS DynamoDB', data: result });
    } catch (error) {
        console.error('[Cart POST Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to save cart to DynamoDB', error: error.message });
    }
});

// @route   DELETE /api/cart/:userId
// @desc    Clear user cart in AWS DynamoDB
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await clearCartState(userId);
        res.json({ success: true, message: 'Cart cleared in DynamoDB' });
    } catch (error) {
        console.error('[Cart DELETE Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to clear cart in DynamoDB', error: error.message });
    }
});

module.exports = router;
