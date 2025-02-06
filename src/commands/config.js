import { getConfig, updateConfig } from '../config/index.js';

/**
 * Display or update LLM configuration settings.
 * @param {string} key Optional key to view/set (url, key, model)
 * @param {string} value Optional value to set
 */
export function config(key, value) {
    const currentConfig = getConfig();

    // Display current configuration if no key is provided
    if (!key) {
        console.log('LLM Configuration:\n');

        console.log(`  LLM URL: ${currentConfig.llm.url}`);
        console.log(`  API Key: ${currentConfig.llm.apiKey ? '********' : 'Not set'}`);
        console.log(`  Model: ${currentConfig.llm.model || 'Not set'}`);
        
        console.log('\nSet a value using: usefullm config [url|key|model] [value]');
        return;
    }

    // Ensure the key is valid
    const validKeys = {
        url: 'URL',
        key: 'API Key',
        model: 'Model'
    };

    if (!validKeys[key]) {
        console.error('Error: Invalid key. Use "url", "key", or "model".');
        return;
    }

    // Clear the API key if key is provided without a value
    if (key === 'key' && !value) {
        currentConfig.llm.apiKey = '';
        updateConfig(currentConfig);
        console.log('API Key cleared successfully.');
        return;
    }

    // Show current value if no new value is provided
    if (!value) {
        const currentValue = key === 'key' && currentConfig.llm.apiKey
            ? '********'
            : currentConfig.llm[key] || 'Not set';

        console.log(`${validKeys[key]}: ${currentValue}`);
        console.log('\nSet a value using: usefullm config [url|key|model] [value]');
        return;
    }

    // Update configuration
    const updatedConfig = {
        llm: {
            ...currentConfig.llm,
            [key]: value,
        },
    };

    updateConfig(updatedConfig);
    console.log(`${validKeys[key]} updated successfully.`);
}