const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Core Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews'));

// AWS Cloud Integration Routes
app.use('/api/upload', require('./routes/upload')); // AWS S3 Uploads
app.use('/api/cart', require('./routes/cart'));     // AWS DynamoDB Cart State
app.use('/api/orders', require('./routes/orders'));   // AWS RDS MySQL + AWS SNS + AWS Lambda

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SuperMarket API running with AWS RDS, DynamoDB, Lambda, S3, & SNS services!'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
