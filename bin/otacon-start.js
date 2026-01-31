#!/usr/bin/env node

/**
 * Otacon Start Command
 * Simple wrapper to start the Otacon gateway
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, homedir } from 'path';
import chalk from 'chalk';

console.log(chalk.cyan(`
╔════════════════════════════════════════╗
║           🤖 Starting Otacon            ║
╚════════════════════════════════════════╝
`));

const configPath = join(homedir(), '.openclaw', 'openclaw.json');

if (!existsSync(configPath)) {
  console.log(chalk.yellow('⚠️  Otacon not configured yet. Running installer...\n'));
  
  const install = spawn('node', [join(process.cwd(), 'installer', 'install.js')], {
    stdio: 'inherit',
    shell: true
  });
  
  install.on('exit', (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✅ Installation complete! Starting Otacon...\n'));
      startGateway();
    } else {
      console.log(chalk.red('\n❌ Installation failed. Please try again.\n'));
      process.exit(1);
    }
  });
} else {
  startGateway();
}

function startGateway() {
  console.log(chalk.blue('🚀 Starting Otacon Gateway...\n'));
  
  const gateway = spawn('openclaw', ['gateway', '--port', '18789', '--bind', 'localhost'], {
    stdio: 'inherit',
    shell: true
  });
  
  console.log(chalk.green('✅ Gateway starting on http://localhost:18789'));
  console.log(chalk.cyan('📱 Open your browser to start chatting!\n'));
  console.log(chalk.gray('Press Ctrl+C to stop\n'));
  
  gateway.on('exit', (code) => {
    if (code !== 0) {
      console.log(chalk.red(`\n❌ Gateway exited with code ${code}`));
    }
    process.exit(code);
  });
}
