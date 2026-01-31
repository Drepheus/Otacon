#!/usr/bin/env node

/**
 * Post-install script
 * Runs after npm install to set up Otacon
 */

import { existsSync, mkdirSync } from 'fs';
import { join, homedir } from 'path';
import chalk from 'chalk';

console.log(chalk.cyan('\n🤖 Setting up Otacon...\n'));

// Create necessary directories
const dirs = [
  join(homedir(), '.otacon'),
  join(homedir(), '.otacon', 'workspace'),
  join(homedir(), '.openclaw')
];

for (const dir of dirs) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(chalk.gray(`  Created: ${dir}`));
  }
}

console.log(chalk.green('\n✅ Otacon is ready!\n'));
console.log(chalk.cyan('Run "otacon-start" to begin\n'));
