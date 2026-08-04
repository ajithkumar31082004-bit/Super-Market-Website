const { S3Client } = require('@aws-sdk/client-s3');
const { SNSClient } = require('@aws-sdk/client-sns');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { LambdaClient } = require('@aws-sdk/client-lambda');
require('dotenv').config();

const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: process.env.AWS_ACCESS_KEY_ID ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined
};

// AWS SDK v3 Clients
const s3Client = new S3Client(awsConfig);
const snsClient = new SNSClient(awsConfig);
const rawDynamoClient = new DynamoDBClient(awsConfig);
const dynamoDocClient = DynamoDBDocumentClient.from(rawDynamoClient);
const lambdaClient = new LambdaClient(awsConfig);

module.exports = {
    s3Client,
    snsClient,
    dynamoDocClient,
    lambdaClient
};
