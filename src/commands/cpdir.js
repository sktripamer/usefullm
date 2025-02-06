import clipboardy from 'clipboardy';
import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { isBinaryFileSync } from 'isbinaryfile';
import { getIgnoreMatcher } from '../utils/gitignore.js';
import { saveToHistory } from '../utils/history.js';

const CHAR_LIMIT = 100000;

/**
 * Process a directory and copy its contents to clipboard
 * @param {string} dirPath Directory to process
 * @param {Object} options Command options
 */
export async function cpdir(dirPath, options = {}) {
  try {
    const resolvedPath = path.resolve(process.cwd(), dirPath);

    if (!fs.existsSync(resolvedPath)) {
      console.error(`Directory not found: ${dirPath}`);
      return;
    }

    if (!fs.statSync(resolvedPath).isDirectory()) {
      console.error(`Not a directory: ${dirPath}`);
      return;
    }

    // ✅ Use fast-glob to recursively get all files
    const files = await fg('**/*', {
      cwd: resolvedPath,
      dot: true, // Include hidden files
      onlyFiles: true, // Get only files, not directories
      followSymbolicLinks: false, // Don't follow symlinks
      absolute: false, // Return relative paths
    });

    // ✅ Filter files based on `.gitignore` rules (unless --all is specified)
    const filteredFiles = options.all
      ? files
      : files.filter(file => {
          const fileDir = path.dirname(file);
          const fileIg = getIgnoreMatcher(path.join(resolvedPath, fileDir));
          return !fileIg.ignores(file);
        });

    // Process files
    const fileContents = [];
    let totalSize = 0;

    for (const file of filteredFiles) {
      const fullPath = path.join(resolvedPath, file);

      // Skip binary files
      if (isBinaryFileSync(fullPath)) {
        continue;
      }

      // Skip if file is too large
      const stats = fs.statSync(fullPath);
      if (stats.size > CHAR_LIMIT) {
        console.warn(`Skipping large file: ${file}`);
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        fileContents.push({
          path: file,
          content,
        });
        totalSize += content.length;
      } catch (error) {
        console.warn(`Error reading ${file}: ${error.message}`);
      }
    }

    // Format output in markdown
    const output = fileContents
      .map(file => `## ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n`)
      .join('\n');

    // Copy to clipboard
    try {
      await clipboardy.write(output);
      const command = `cpdir ${dirPath}${options.all ? ' --all' : ''}${
        options.prompt ? ` -p "${options.prompt}"` : ''
      }`;
      saveToHistory(command, output);
      console.log(`\nSuccessfully copied ${fileContents.length} files to clipboard!`);
    } catch (error) {
      console.error('Error copying to clipboard:', error.message);
    }
  } catch (error) {
    console.error('Error processing directory:', error.message);
  }
}