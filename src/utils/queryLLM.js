import axios from 'axios';
import { getConfig } from '../config/index.js';

/**
 * Generic function to interact with any LLM API.
 * Automatically detects whether to use `prompt` or `messages` based on the API's expected format.
 * 
 * @param {string} prompt - The user's input prompt.
 * @param {number} maxTokens - Maximum number of tokens to generate.
 * @param {object} [params] - Additional parameters for the request.
 * @returns {Promise<string>} - The LLM's response.
 */
async function queryLLM(prompt, content, maxTokens, params = {}) {
    try {
        // Load LLM API details from config
        const config = getConfig();
        const url = config.llm.url;
        const apiKey = config.llm.apiKey;
        const model = config.llm.model;
        if (!url) {
            throw new Error("LLM API URL is not configured.");
        }

        const headers = {
            "Content-Type": "application/json",
            ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        };

        const response = await axios.post(url, {
            "messages": [
                {
                    "role": "system",
                    "content": prompt
                },
                {
                    "role": "user",
                    "content": 'Summarize the following file:\n```' + content + '\n```'
                }
            ],
            model,
            max_new_tokens: parseInt(maxTokens, 10),
        }, { headers });

        const result =
            response.data?.choices?.[0]?.message?.content || // OpenAI-style APIs
            response.data?.choices?.[0]?.text || // Some OpenAI-compatible APIs
            JSON.stringify(response.data); // Fallback to raw response

        return result;
    } catch (error) {
        console.error("Error querying LLM:", error.response?.data || error.message);
        throw error;
    }
}

export { queryLLM };