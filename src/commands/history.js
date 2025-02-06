import { getAllHistory, getHistory } from '../utils/history.js';
import clipboard from 'clipboardy';

/**
 * Display command history or copy specific history item to clipboard
 * @param {string} index Optional index to copy specific history item
 */
export function history(index) {
    if (index) {
        // Copy specific history item
        const item = getHistory(parseInt(index));
        if (!item) {
            console.error(`No history item found at position ${index}`);
            return;
        }

        clipboard.writeSync(item.output);
        console.log(`Copied output from command: ${item.command}`);
        console.log(`Run at: ${new Date(item.timestamp).toLocaleString()}`);
    } else {
        // Display all history
        const items = getAllHistory();
        if (items.length === 0) {
            console.log('No command history found');
            return;
        }

        console.log('Command History:\n');
        items.forEach(item => {
            console.log(`${item.index}. ${item.command}`);
            console.log(`   Run at: ${new Date(item.timestamp).toLocaleString()}`);
            console.log('');
        });
        console.log('Use "usefullm history <number>" to copy a specific item to clipboard');
    }
}
