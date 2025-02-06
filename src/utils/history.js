import fs from 'fs';
import path from 'path';
import os from 'os';
import clipboard from 'clipboardy';

const HISTORY_DIR = path.join(os.homedir(), '.usefullm', 'history');
const MAX_HISTORY = 5;

/**
 * Ensures the history directory exists
 */
function ensureHistoryDir() {
    if (!fs.existsSync(HISTORY_DIR)) {
        fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }
}

/**
 * Gets the path for a specific history item
 * @param {number} index History index (1-5)
 * @returns {string} Path to history file
 */
function getHistoryPath(index) {
    return path.join(HISTORY_DIR, `history_${index}.json`);
}

/**
 * Saves a command output to history
 * @param {string} command The command that was run
 * @param {string} output The command's output
 */
export function saveToHistory(command, output) {
    ensureHistoryDir();

    // Shift all history items down
    for (let i = MAX_HISTORY; i > 1; i--) {
        const currentPath = getHistoryPath(i - 1);
        const nextPath = getHistoryPath(i);
        
        if (fs.existsSync(currentPath)) {
            fs.renameSync(currentPath, nextPath);
        }
    }

    // Save new history item
    const historyItem = {
        timestamp: new Date().toISOString(),
        command,
        output
    };

    fs.writeFileSync(
        getHistoryPath(1),
        JSON.stringify(historyItem, null, 2)
    );
}

/**
 * Gets a specific history item
 * @param {number} index History index (1-5, where 1 is most recent)
 * @returns {Object|null} History item or null if not found
 */
export function getHistory(index) {
    const historyPath = getHistoryPath(index);
    if (!fs.existsSync(historyPath)) {
        return null;  // Ensure we return `null` if no history file exists
    }
    try {
        const data = fs.readFileSync(historyPath, 'utf8').trim();
        if (!data) return null;  // If file is empty, return `null`
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error parsing history file ${historyPath}:`, error.message);
        return null;
    }
}

/**
 * Gets all available history items
 * @returns {Array} Array of history items
 */
export function getAllHistory() {
    ensureHistoryDir();
    const history = [];

    for (let i = 1; i <= MAX_HISTORY; i++) {
        const item = getHistory(i);
        if (item) {
            history.push({ index: i, ...item });
        }
    }

    return history;
}

/**
 * Copies the most recent output to clipboard
 * @returns {Object|null} The history item that was copied
 */
export async function copyLastToClipboard() {
    const lastItem = getHistory(1);
    if (!lastItem) return null;  // Return `null` if history is empty
    await clipboard.write(lastItem.output);
    return lastItem;
}