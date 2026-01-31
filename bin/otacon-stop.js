#!/usr/bin/env node

/**
 * Otacon Stop Command
 * Stops the Otacon gateway
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.cyan('🛑 Stopping Otacon...\n'));

try {
  // Find and kill openclaw processes
  if (process.platform === 'win32') {
    execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq *openclaw*"', { stdio: 'ignore' });
  } else {
    execSync('pkill -f "openclaw gateway"', { stdio: 'ignore' });
  }
  
  console.log(chalk.green('✅ Otacon stopped successfully!\n'));
} catch {
  console.log(chalk.yellow('⚠️  No running Otacon instance found\n'));
}
