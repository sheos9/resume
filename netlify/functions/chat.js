const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event, context) => {
    // Log the start of the function
    console.log('Function started with event:', JSON.stringify(event, null, 2));
    
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Check if API key is present
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key is missing');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Configuration error',
                    details: 'OpenAI API key is not configured. Please check your Netlify environment variables.'
                })
            };
        }

        // Parse the request body
        let body;
        try {
            body = JSON.parse(event.body);
            console.log('Request body:', body);
        } catch (e) {
            console.error('Error parsing request body:', e);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request body' })
            };
        }

        const { message, language } = body;
        if (!message) {
            console.error('No message provided in request');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // Create a chat completion
        console.log('Creating chat completion with message:', message);
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: language === 'de' 
                        ? "Du bist ein hilfreicher Assistent auf einer Lebenslauf-Website."
                        : "You are a helpful assistant on a resume website."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 100
        });

        console.log('Chat completion successful:', completion);
        const response = completion.choices[0].message.content;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response })
        };

    } catch (error) {
        // Log the full error details
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            status: error.status,
            response: error.response ? {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            } : null,
            stack: error.stack
        });

        // Return a more user-friendly error message
        let errorMessage = 'An error occurred while processing your request';
        let errorDetails = error.message;

        if (error.response) {
            if (error.response.status === 401) {
                errorMessage = 'Authentication error';
                errorDetails = 'Please check if the API key is correct and has not expired.';
            } else if (error.response.status === 429) {
                errorMessage = 'Rate limit exceeded';
                errorDetails = 'Please try again later.';
            } else if (error.response.data) {
                errorDetails = error.response.data.error?.message || errorDetails;
            }
        }

        return {
            statusCode: error.response?.status || 500,
            headers,
            body: JSON.stringify({ 
                error: errorMessage,
                details: errorDetails
            })
        };
    }
}; 