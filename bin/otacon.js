#!/usr/bin/env node

/**
 * Main Otacon CLI Entry Point
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const command = process.argv[2];

const commands = {
  start: join(__dirname, 'otacon-start.js'),
  stop: join(__dirname, 'otacon-stop.js'),
  help: join(__dirname, 'otacon-help.js'),
  install: join(__dirname, '..', 'installer', 'install.js'),
  default: join(__dirname, 'otacon-help.js')
};

const script = commands[command] || commands.default;

const child = spawn('node', [script, ...process.argv.slice(3)], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => process.exit(code));
