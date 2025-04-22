const { Configuration, OpenAIApi } = require('openai');

exports.handler = async function(event, context) {
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
        } catch (e) {
            console.error('Error parsing request body:', e);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request body' })
            };
        }

        const { message, language } = body;

        // Initialize OpenAI client with explicit configuration
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
            organization: null // Add this to avoid potential issues
        });

        const openai = new OpenAIApi(configuration);

        // Create a simple chat completion
        const completion = await openai.createChatCompletion({
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

        // Extract the response
        const response = completion.data.choices[0].message.content;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response })
        };

    } catch (error) {
        // Log the full error details
        console.error('Full Error:', {
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
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: errorMessage,
                details: errorDetails
            })
        };
    }
}; 