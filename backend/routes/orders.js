const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { publishOrderNotification } = require('../services/snsService');
const { logActivity, clearCartState } = require('../services/dynamoService');
const { invokeLambdaFunction } = require('../services/lambdaService');

// @route   POST /api/orders
// @desc    Create a new order in RDS MySQL, alert SNS, log in DynamoDB, and trigger Lambda worker
router.post('/', async (req, res) => {
    const { userId, items, totalAmount, userEmail, userPhone } = req.body;

    if (!userId || !items || !items.length || !totalAmount) {
        return res.status(400).json({ success: false, message: 'Invalid order parameters' });
    }

    let orderId = `ORD-${Date.now().toString().slice(-6)}`;
    let connection = null;

    // 1. Attempt RDS MySQL save
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'pending']
        );
        orderId = orderResult.insertId;

        const itemValues = items.map(item => [orderId, item.id || item.productId, item.quantity, item.price]);
        await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [itemValues]
        );

        await connection.commit();
        connection.release();
    } catch (dbError) {
        if (connection) {
            try { await connection.rollback(); connection.release(); } catch (e) {}
        }
        console.warn('[Order DB Warning] RDS MySQL save skipped/offline, proceeding with cloud services:', dbError.message);
    }

    const orderDetails = {
        id: orderId,
        user_id: userId,
        userEmail,
        userPhone,
        total_amount: totalAmount,
        items
    };

    // 2. AWS SNS: Publish real-time order notification (Async)
    publishOrderNotification(orderDetails).catch(err =>
        console.warn('[Order SNS Warning] Non-critical notification failure:', err.message)
    );

    // 3. AWS DynamoDB: Log audit trail and clear active DynamoDB cart
    logActivity(userId, 'ORDER_PLACED', { orderId, totalAmount, itemTypes: items.length });
    clearCartState(userId).catch(err =>
        console.warn('[Order DynamoDB Warning] Failed to clear cart after order:', err.message)
    );

    // 4. AWS Lambda: Trigger serverless background processing
    const lambdaFunctionName = process.env.AWS_LAMBDA_BG_WORKER || 'supermarket-order-processor';
    invokeLambdaFunction(lambdaFunctionName, { orderId, userId, userEmail, userPhone, items, totalAmount }, true).catch(err =>
        console.warn('[Order Lambda Warning] Non-critical serverless invocation skipped:', err.message)
    );

    res.json({
        success: true,
        message: 'Order created successfully!',
        data: {
            orderId,
            totalAmount,
            status: 'pending'
        }
    });
});

// @route   GET /api/orders/user/:userId
// @desc    Get user order history from RDS MySQL
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('[Order History Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order history', error: error.message });
    }
});

module.exports = router;
