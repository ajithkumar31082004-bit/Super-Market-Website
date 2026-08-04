const { PublishCommand } = require('@aws-sdk/client-sns');
const { snsClient } = require('../config/aws');

const TOPIC_ARN = process.env.AWS_SNS_TOPIC_ARN;

/**
 * Publishes an order notification to the AWS SNS Topic.
 * @param {Object} orderDetails - Information about the placed order
 * @returns {Promise<Object>} AWS SNS Publish Result
 */
async function publishOrderNotification(orderDetails) {
    if (!TOPIC_ARN) {
        console.warn('[AWS SNS Warning] AWS_SNS_TOPIC_ARN is not configured in .env file.');
        return { success: false, reason: 'SNS Topic ARN missing' };
    }

    const messagePayload = {
        default: `New Order Placed! Order ID: ${orderDetails.id || 'N/A'}, Total: $${orderDetails.total_amount}`,
        orderId: orderDetails.id,
        userId: orderDetails.user_id,
        totalAmount: orderDetails.total_amount,
        itemsCount: orderDetails.items ? orderDetails.items.length : 0,
        timestamp: new Date().toISOString()
    };

    const command = new PublishCommand({
        TopicArn: TOPIC_ARN,
        Subject: `🛒 SuperMarket Alert: Order #${orderDetails.id || 'NEW'} Placed`,
        Message: JSON.stringify(messagePayload),
        MessageStructure: 'json'
    });

    try {
        const response = await snsClient.send(command);
        console.log(`[AWS SNS Success] Notification sent. MessageId: ${response.MessageId}`);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('[AWS SNS Error] Failed to publish notification:', error);
        throw error;
    }
}

/**
 * Sends a direct SMS to a mobile phone number via AWS SNS.
 * @param {string} phoneNumber - Recipient phone number in E.164 format (e.g., +1234567890)
 * @param {string} message - Text message content
 */
async function sendDirectSMS(phoneNumber, message) {
    const command = new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message
    });

    try {
        const response = await snsClient.send(command);
        console.log(`[AWS SNS SMS Success] Sent SMS to ${phoneNumber}. MessageId: ${response.MessageId}`);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('[AWS SNS SMS Error] Failed to send SMS:', error);
        throw error;
    }
}

module.exports = {
    publishOrderNotification,
    sendDirectSMS
};
