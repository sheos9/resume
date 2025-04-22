const OpenAI = require('openai');

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

        // Initialize OpenAI client
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        // Create the chat completion
        const completion = await openai.chat.completions.create({
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
        const response = completion.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ response })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'An error occurred while processing your request',
                details: error.message
            })
        };
    }
}; 