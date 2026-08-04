const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { publishOrderNotification } = require('../services/snsService');
const { logActivity, clearCartState } = require('../services/dynamoService');
const { invokeLambdaFunction } = require('../services/lambdaService');

// @route   POST /api/orders
// @desc    Create a new order in RDS MySQL, alert SNS, log in DynamoDB, and trigger Lambda worker
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { userId, items, totalAmount } = req.body;

        if (!userId || !items || !items.length || !totalAmount) {
            connection.release();
            return res.status(400).json({ success: false, message: 'Invalid order parameters' });
        }

        await connection.beginTransaction();

        // 1. Insert order record into RDS MySQL
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'pending']
        );
        const orderId = orderResult.insertId;

        // 2. Insert order items into RDS MySQL
        const itemValues = items.map(item => [orderId, item.id || item.productId, item.quantity, item.price]);
        await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
            [itemValues]
        );

        await connection.commit();
        connection.release();

        const orderDetails = {
            id: orderId,
            user_id: userId,
            total_amount: totalAmount,
            items
        };

        // 3. AWS SNS: Publish real-time order notification (Async)
        publishOrderNotification(orderDetails).catch(err =>
            console.warn('[Order SNS Warning] Non-critical notification failure:', err.message)
        );

        // 4. AWS DynamoDB: Log audit trail and clear active DynamoDB cart
        logActivity(userId, 'ORDER_PLACED', { orderId, totalAmount, itemTypes: items.length });
        clearCartState(userId).catch(err =>
            console.warn('[Order DynamoDB Warning] Failed to clear cart after order:', err.message)
        );

        // 5. AWS Lambda: Trigger serverless background processing (e.g. invoice/email generation)
        const lambdaFunctionName = process.env.AWS_LAMBDA_BG_WORKER || 'supermarket-order-processor';
        invokeLambdaFunction(lambdaFunctionName, { orderId, userId, items, totalAmount }, true).catch(err =>
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
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('[Order Creation Error]:', error);
        res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
    }
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
