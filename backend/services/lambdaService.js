const { InvokeCommand } = require('@aws-sdk/client-lambda');
const { lambdaClient } = require('../config/aws');

/**
 * Invokes an AWS Lambda function.
 * @param {string} functionName - Name or ARN of the target Lambda function
 * @param {Object} payload - Event payload object to pass to the function
 * @param {boolean} [isAsync=true] - Whether to invoke asynchronously (Event) or synchronously (RequestResponse)
 * @returns {Promise<Object>} Invocation result
 */
async function invokeLambdaFunction(functionName, payload = {}, isAsync = true) {
    const params = {
        FunctionName: functionName,
        InvocationType: isAsync ? 'Event' : 'RequestResponse',
        Payload: Buffer.from(JSON.stringify(payload))
    };

    try {
        const command = new InvokeCommand(params);
        const response = await lambdaClient.send(command);
        console.log(`[AWS Lambda Success] Triggered ${functionName}. StatusCode: ${response.StatusCode}`);

        if (!isAsync && response.Payload) {
            const resultPayload = Buffer.from(response.Payload).toString('utf-8');
            return JSON.parse(resultPayload);
        }

        return { success: true, statusCode: response.StatusCode };
    } catch (error) {
        console.error(`[AWS Lambda Error] Failed to invoke ${functionName}:`, error);
        throw error;
    }
}

module.exports = {
    invokeLambdaFunction
};
