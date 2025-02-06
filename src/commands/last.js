import { copyLastToClipboard } from '../utils/history.js';

/**
 * Copy the most recent command output to clipboard
 */
export async function last() {
    const lastItem = await copyLastToClipboard();
    if (!lastItem) {
        console.log('No command history found');
        return;
    }

    console.log(`Copied last output to clipboard from command: ${lastItem.command}`);
    console.log(`Run at: ${new Date(lastItem.timestamp).toLocaleString()}`);
}
