/**
 * Service for interacting with LLM APIs
 */

// Configuration object for API settings
const config = {
    API_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
    API_KEY: '' // Set this via setApiKey function
};

/**
 * Sets the API key for the LLM service
 * @param {string} apiKey - The API key to use
 */
export function setApiKey(apiKey) {
    config.API_KEY = apiKey;
}

/**
 * Sends a prompt to the LLM API and returns the response
 * @param {Object} prompt - The analysis prompt object
 * @returns {Promise<string>} The LLM's response
 */
export async function getLLMAnalysis(prompt) {
    try {
        if (!config.API_KEY) {
            throw new Error('API key not set. Please call setApiKey first.');
        }

        const response = await fetch(config.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: "You are a social media analytics expert. Analyze the provided data and give clear, actionable insights."
                }, {
                    role: "user",
                    content: JSON.stringify(prompt)
                }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error getting LLM analysis:', error);
        throw error;
    }
}
