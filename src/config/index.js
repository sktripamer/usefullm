import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.usefullm', 'config.json');

const defaultConfig = {
    llm: {
        url: process.env.LLM_URL || 'http://127.0.0.1:11434/v1/chat/completions',
        apiKey: process.env.LLM_API_KEY || '',
        model: process.env.LLM_MODEL || 'llama3.2',
    }
};

export function ensureConfigExists() {
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    }
}

export function getConfig() {
    ensureConfigExists();
    try {
        const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
        const parsedConfig = JSON.parse(configContent);

        return {
            llm: {
                url: process.env.LLM_URL || parsedConfig.llm?.url || 'http://127.0.0.1:11434/v1/chat/completions',
                apiKey: process.env.LLM_API_KEY || parsedConfig.llm?.apiKey || '',
                model: process.env.LLM_MODEL || parsedConfig.llm?.model || 'llama3.2',
            }
        };
    } catch (error) {
        console.error("Error reading config file:", error.message);
        return { ...defaultConfig };
    }
}

export function updateConfig(newConfig) {
    ensureConfigExists();
    const currentConfig = getConfig();
    const updatedConfig = {
        llm: {
            ...currentConfig.llm,
            ...newConfig.llm,
        },
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
    return updatedConfig;
}
