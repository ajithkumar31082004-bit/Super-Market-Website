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

    const orderId = orderDetails.id || orderDetails.orderId || `ORD-${Date.now()}`;
    const userEmail = orderDetails.userEmail || orderDetails.email || 'customer@example.com';
    const userPhone = orderDetails.userPhone || orderDetails.phone || 'N/A';
    const totalAmount = parseFloat(orderDetails.total_amount || orderDetails.totalAmount || 0).toFixed(2);
    const items = orderDetails.items || [];
    const itemCount = items.length;
    const formattedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Format item list for email body
    let itemsText = '  (No items specified)';
    if (items.length > 0) {
        itemsText = items.map((item, idx) => {
            const name = item.name || item.title || `Item #${item.id || idx + 1}`;
            const qty = item.quantity || item.qty || 1;
            const price = parseFloat(item.price || 0).toFixed(2);
            return `   ${idx + 1}. ${name} (x${qty}) - Rs. ${price}`;
        }).join('\n');
    }

    // Rich formatted email body matching aesthetic standards
    const formattedEmailMessage = `🚨 NEW ORDER ALERT 🚨
🛒 SuperMarketPRO Store

A new order has been successfully placed. Details below:

_______________________________________________

📁 ORDER DETAILS
_______________________________________________

🔑 Order ID      : ${orderId}
👤 Customer ID   : ${orderDetails.user_id || orderDetails.userId || 'GUEST'}
✉️ Guest Email   : ${userEmail}
📱 Guest Phone   : ${userPhone}
📦 Total Items   : ${itemCount} Item(s)
💵 Amount Paid   : Rs. ${totalAmount}
💳 Payment Status: Paid / Confirmed
📅 Order Date    : ${formattedDate}
_______________________________________________

🛍️ PURCHASED ITEMS
${itemsText}
_______________________________________________

🖥️ Manage Order
Click below to view this order in the Admin Dashboard:
👉 http://localhost:3000/admin.html

-- System Alert Dispatcher`;

    const command = new PublishCommand({
        TopicArn: TOPIC_ARN,
        Subject: `[SuperMarketPRO] New Order Alert: #${orderId} - ${userEmail}`,
        Message: formattedEmailMessage
    });

    try {
        const response = await snsClient.send(command);
        console.log(`[AWS SNS Success] Rich Email Notification sent. MessageId: ${response.MessageId}`);
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
