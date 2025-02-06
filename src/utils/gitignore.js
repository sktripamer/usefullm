import fs from 'fs';
import ignore from 'ignore';
import path from 'path';

export function getIgnoreMatcher(dirPath, additionalIgnorePatterns = []) {
    const ig = ignore();
    let currentDir = dirPath;

    while (currentDir !== path.parse(currentDir).root) {
        const gitignorePath = path.join(currentDir, '.gitignore');
        if (fs.existsSync(gitignorePath)) {
            const content = fs.readFileSync(gitignorePath, 'utf8');
            ig.add(content);
        }
        currentDir = path.dirname(currentDir);
    }

    // Always ignore these
    ig.add(['.git', '.gitignore', '.DS_Store', 'package-lock.json']);

    // Add additional ignore patterns from the command line
    if (additionalIgnorePatterns.length > 0) {
        ig.add(additionalIgnorePatterns);
    }

    return ig;
}