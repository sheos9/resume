const { Configuration, OpenAIApi } = require('openai');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse the request body
        const { message, language } = JSON.parse(event.body);

        // Log the API key status (without exposing the actual key)
        console.log('API Key Status:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

        // Initialize OpenAI client
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        });
        const openai = new OpenAIApi(configuration);

        // Create the chat completion
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: language === 'de' 
                        ? "Du bist ein hilfreicher Assistent. Antworte auf Deutsch."
                        : "You are a helpful assistant. Respond in English."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        // Extract the assistant's reply
        const response = completion.data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ response })
        };

    } catch (error) {
        // Log the full error details
        console.error('Full Error:', {
            message: error.message,
            code: error.code,
            status: error.status,
            response: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            } : null
        });

        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'An error occurred while processing your request',
                details: error.message,
                code: error.code,
                status: error.status
            })
        };
    }
}; 