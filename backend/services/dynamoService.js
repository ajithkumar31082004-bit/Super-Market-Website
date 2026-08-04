const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamoDocClient } = require('../config/aws');

const CARTS_TABLE = process.env.AWS_DYNAMODB_CARTS_TABLE || 'SuperMarket_Carts';
const LOGS_TABLE = process.env.AWS_DYNAMODB_LOGS_TABLE || 'SuperMarket_Logs';

/**
 * Saves or updates a user's shopping cart in AWS DynamoDB.
 * @param {string|number} userId - The user ID
 * @param {Array} items - Array of cart items
 */
async function saveCartState(userId, items) {
    const params = {
        TableName: CARTS_TABLE,
        Item: {
            userId: String(userId),
            items: items,
            updatedAt: new Date().toISOString(),
            ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days TTL
        }
    };

    try {
        await dynamoDocClient.send(new PutCommand(params));
        return { success: true, userId, itemCount: items.length };
    } catch (error) {
        console.error('[AWS DynamoDB Error] Failed to save cart state:', error);
        throw error;
    }
}

/**
 * Retrieves a user's shopping cart from AWS DynamoDB.
 * @param {string|number} userId - The user ID
 * @returns {Promise<Array>} List of cart items
 */
async function getCartState(userId) {
    const params = {
        TableName: CARTS_TABLE,
        Key: {
            userId: String(userId)
        }
    };

    try {
        const data = await dynamoDocClient.send(new GetCommand(params));
        return data.Item ? data.Item.items : [];
    } catch (error) {
        console.error('[AWS DynamoDB Error] Failed to retrieve cart state:', error);
        throw error;
    }
}

/**
 * Clears a user's shopping cart in AWS DynamoDB.
 * @param {string|number} userId - The user ID
 */
async function clearCartState(userId) {
    const params = {
        TableName: CARTS_TABLE,
        Key: {
            userId: String(userId)
        }
    };

    try {
        await dynamoDocClient.send(new DeleteCommand(params));
        return { success: true };
    } catch (error) {
        console.error('[AWS DynamoDB Error] Failed to clear cart state:', error);
        throw error;
    }
}

/**
 * Logs user action or audit metadata to AWS DynamoDB.
 * @param {string|number} userId - The user ID
 * @param {string} action - Action identifier (e.g. ORDER_PLACED, LOGIN)
 * @param {Object} metadata - Additional payload
 */
async function logActivity(userId, action, metadata = {}) {
    const params = {
        TableName: LOGS_TABLE,
        Item: {
            logId: `LOG_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: String(userId),
            action: action,
            metadata: metadata,
            timestamp: new Date().toISOString()
        }
    };

    try {
        await dynamoDocClient.send(new PutCommand(params));
    } catch (error) {
        // Non-blocking log attempt error
        console.warn('[AWS DynamoDB Warning] Failed to save audit log:', error.message);
    }
}

module.exports = {
    saveCartState,
    getCartState,
    clearCartState,
    logActivity
};
