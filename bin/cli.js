#!/usr/bin/env node

import { program } from 'commander';
import { cpdir } from '../src/commands/cpdir.js';
import { dirtree } from '../src/commands/dirtree.js';
import { summ } from '../src/commands/summ.js';
import { history } from '../src/commands/history.js';
import { last } from '../src/commands/last.js';
import { config } from '../src/commands/config.js';

program
    .name('usefullm')
    .description('CLI tool for speeding up your workflows when working with LLMs')
    .version('0.1.0');

program
    .command('cpdir')
    .description('Copy directory contents in markdown format to clipboard')
    .argument('[dir]', 'directory to copy (defaults to current directory)')
    .option('--all', 'include all files, ignoring .gitignore')
    .action((dir, options) => cpdir(dir || '.', options));

    program
    .command('dirtree')
    .description('Generate a directory tree')
    .argument('[dir]', 'directory to analyze (defaults to current directory)', '.')
    .option('-d, --depth <depth>', 'maximum depth', parseInt, 20)
    .option('-i, --ignore <patterns...>', 'patterns to ignore', [])
    .option('-a, --all', 'include all files, ignoring .gitignore rules')
    .option('-f, --format <format>', 'output format (markdown, xml, ascii)', 'markdown')
    .action((dir, options) => dirtree(dir, options));

program
    .command('summ')
    .description('Summarize a file or directory')
    .argument('[path]', 'path to summarize (defaults to current directory)')
    .option('-t, --tokens <tokens>', 'maximum tokens per summary', '1000')
    .action((path, options) => summ(path || '.', options));

program
    .command('config')
    .description('View or update configuration')
    .argument('[key]', 'config key to view/set (url, key, or model)')
    .argument('[value]', 'value to set')
    .action(config);

program
    .command('history')
    .description('View command history or copy specific history item')
    .argument('[index]', 'index of history item to copy (1-5)')
    .action(history);

program
    .command('last')
    .description('Copy most recent command output to clipboard')
    .action(last);

program.parse();
