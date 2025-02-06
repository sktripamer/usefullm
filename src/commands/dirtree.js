import fg from 'fast-glob';
import ignore from 'ignore';
import clipboardy from 'clipboardy';
import path from 'path';
import { saveToHistory } from '../utils/history.js';
import { getIgnoreMatcher } from '../utils/gitignore.js';

export async function dirtree(dirPath, options = {}) {
    try {
      const absolutePath = path.resolve(dirPath);
  
      // Load `.gitignore` rules (unless --all is specified)
      const ig = options.all ? ignore() : getIgnoreMatcher(absolutePath, options.ignore);
  
      // Use fast-glob to recursively get all files
      const files = await fg('**/*', {
        cwd: absolutePath,
        dot: true, // Include hidden files
        onlyFiles: true, // Get only files, not directories
        followSymbolicLinks: false, // Don't follow symlinks
        absolute: false, // Return relative paths
        deep: options.depth || 20, // Limit depth
      });
  
      // Apply `.gitignore` filtering (unless --all is specified)
      const filteredFiles = options.all
        ? files
        : files.filter(file => {
            const fileDir = path.dirname(file);
            const fileIg = getIgnoreMatcher(path.join(absolutePath, fileDir), options.ignore);
            return !fileIg.ignores(file);
          });
  
      // Format the output based on --format
      const output = formatOutput(filteredFiles, options.format || 'markdown', path.basename(absolutePath));
  
      // Save to history
      await clipboardy.write(output);
      const command = `dirtree ${dirPath}${
        options.all ? ' --all' : ''
      }${options.depth ? ` --depth ${options.depth}` : ''}${
        options.ignore ? ` --ignore ${options.ignore.join(' ')}` : ''
      }${options.format ? ` --format ${options.format}` : ''}`;
      saveToHistory(command, output);
  
      console.log("Directory tree in " + absolutePath + " copied to clipboard");
    } catch (error) {
      console.error('Error generating directory tree:', error.message);
    }
  }

function formatOutput(files, type, rootDir) {
  const tree = buildTree(files);

  switch (type) {
    case 'markdown':
      return formatMarkdown(tree, rootDir);
    case 'xml':
      return formatXML(tree, rootDir);
    case 'ascii':
      return formatASCII(tree, rootDir);
    default:
      throw new Error(`Unsupported output type: ${type}`);
  }
}

function buildTree(files) {
  const tree = {};

  files.forEach(file => {
    const parts = file.split(path.sep);
    let currentLevel = tree;

    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    });
  });

  return tree;
}

function formatMarkdown(tree, rootDir, indent = '') {
  let output = `${indent}- ${rootDir}\n`;

  Object.keys(tree).forEach(key => {
    output += `${indent}  - ${key}\n`;
    if (Object.keys(tree[key]).length > 0) {
      output += formatMarkdown(tree[key], key, indent + '    ');
    }
  });

  return output;
}

function formatXML(tree, rootDir, indent = '') {
  let output = `${indent}<${rootDir}>\n`;

  Object.keys(tree).forEach(key => {
    if (Object.keys(tree[key]).length > 0) {
      output += formatXML(tree[key], key, indent + '  ');
    } else {
      output += `${indent}  <${key} />\n`;
    }
  });

  output += `${indent}</${rootDir}>\n`;
  return output;
}

function formatASCII(tree, rootDir, prefix = '') {
  let output = `${prefix}${rootDir}\n`;

  const keys = Object.keys(tree);
  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1;
    output += `${prefix}${isLast ? '└── ' : '├── '}${key}\n`;
    if (Object.keys(tree[key]).length > 0) {
      output += formatASCII(tree[key], key, `${prefix}${isLast ? '    ' : '│   '}`);
    }
  });

  return output;
}