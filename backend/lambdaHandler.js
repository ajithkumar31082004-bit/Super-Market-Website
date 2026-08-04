/**
 * AWS Lambda Serverless Handler
 * This module exports a handler wrapper for hosting this Express application on AWS Lambda.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'SuperMarket API running on AWS Lambda!' });
});

/**
 * Basic Lambda Handler Event Bridge
 */
exports.handler = async (event, context) => {
    console.log('[AWS Lambda Invocation Event]:', event.httpMethod || event.requestContext?.http?.method, event.path);
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello from AWS Lambda Express Handler!" })
    };
};

module.exports.app = app;
