import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { queryLLM } from '../utils/queryLLM.js';
import { fileSummarizePrompt } from '../prompts/summarize.js';
import { saveToHistory } from '../utils/history.js';
import clipboard from 'clipboardy';
import { getIgnoreMatcher } from '../utils/gitignore.js';

/**
 * Summarizes a file's contents
 * @param {string} filePath Path to the file
 * @param {number} maxTokens Maximum tokens per summary
 * @returns {Promise<string>} Summary of the file
 */
async function summarizeFile(filePath, maxTokens) {
    const content = fs.readFileSync(filePath, 'utf8');
    return queryLLM(fileSummarizePrompt, content, maxTokens);
}

/**
 * Recursively gets all files in a directory, respecting .gitignore rules
 * @param {string} dirPath Path to the directory
 * @param {Object} options Command options
 * @returns {string[]} Array of file paths
 */
async function getAllFiles(dirPath, options = {}) {
    // Use fast-glob to recursively get all files
    const files = await fg('**/*', {
        cwd: dirPath,
        dot: true, // Include hidden files
        onlyFiles: true, // Get only files, not directories
        followSymbolicLinks: false, // Don't follow symlinks
        absolute: false, // Return relative paths
    });

    // Filter files based on `.gitignore` rules (unless --all is specified)
    const filteredFiles = options.all
        ? files
        : files.filter(file => {
              const fileDir = path.dirname(file);
              const fileIg = getIgnoreMatcher(path.join(dirPath, fileDir));
              return !fileIg.ignores(file);
          });

    return filteredFiles.map(file => path.join(dirPath, file));
}

/**
 * Summarizes a directory by summarizing each file
 * @param {string} dirPath Path to the directory
 * @param {number} maxTokens Maximum tokens per summary
 * @param {Object} options Command options
 * @returns {Promise<string>} Combined summary of all files
 */
async function summarizeDir(dirPath, maxTokens, options = {}) {
    const files = await getAllFiles(dirPath, options);
    const summaries = [];
    console.log(`Found ${files.length} files to summarize...`);

    for (const file of files) {
        try {
            const relativePath = path.relative(dirPath, file);
            console.log(`Summarizing ${relativePath}...`);
            const summary = await summarizeFile(file, maxTokens);
            summaries.push(`File: ${relativePath}\n${summary}\n`);
        } catch (error) {
            console.error(`Error summarizing ${file}:`, error.message);
            summaries.push(`File: ${file}\nError: Could not summarize file\n`);
        }
    }

    return summaries.join('\n---\n\n');
}

/**
 * Main summarize command
 * @param {string} targetPath Path to summarize (file or directory)
 * @param {Object} options Command options
 */
export async function summ(targetPath, options = {}) {
    try {
        const resolvedPath = path.resolve(process.cwd(), targetPath || '.');

        if (!fs.existsSync(resolvedPath)) {
            throw new Error('Path does not exist');
        }

        let result;
        const maxTokens = options.tokens || 1000;

        if (fs.statSync(resolvedPath).isDirectory()) {
            result = await summarizeDir(resolvedPath, maxTokens, options);
        } else {
            // For single files, check if they should be ignored (unless --all is specified)
            const relativePath = path.relative(resolvedPath, resolvedPath);
            const fileIg = getIgnoreMatcher(path.dirname(resolvedPath));
            if (!options.all && fileIg.ignores(relativePath)) {
                throw new Error('File is ignored by .gitignore rules');
            }
            result = await summarizeFile(resolvedPath, maxTokens);
        }

        // Copy to clipboard
        clipboard.writeSync(result);
        console.log('Copied summary to clipboard');
        // Save to history
        const command = `summ ${targetPath}${options.tokens ? ` -t ${options.tokens}` : ''}${
            options.all ? ' --all' : ''
        }`;
        saveToHistory(command, result);

        return result;
    } catch (error) {
        console.error('Error summarizing:', error.message);
    }
}