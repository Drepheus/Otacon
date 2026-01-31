#!/usr/bin/env node

/**
 * Otacon One-Click Installer
 * Simplifies OpenClaw setup for non-technical users
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, homedir } from 'path';
import { platform } from 'os';

const PLATFORM = platform();
const IS_WINDOWS = PLATFORM === 'win32';
const IS_MAC = PLATFORM === 'darwin';
const IS_LINUX = PLATFORM === 'linux';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return '';
  }
}

// ==================== CHECKS ====================

async function checkNodeVersion() {
  log('\n🔍 Checking Node.js installation...', 'blue');
  
  try {
    const version = exec('node --version', { silent: true }).trim();
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    
    if (majorVersion >= 22) {
      log(`✅ Node.js ${version} is installed (requirement met)`, 'green');
      return true;
    } else {
      log(`⚠️  Node.js ${version} found, but version 22+ is required`, 'yellow');
      return false;
    }
  } catch {
    log('❌ Node.js is not installed', 'red');
    return false;
  }
}

async function installNodeWindows() {
  log('\n📥 Installing Node.js 22 LTS for Windows...', 'blue');
  
  try {
    // Download Node.js installer
    const installerUrl = 'https://nodejs.org/dist/v22.13.0/node-v22.13.0-x64.msi';
    const downloadPath = join(homedir(), 'Downloads', 'node-installer.msi');
    
    log('Downloading Node.js installer...', 'cyan');
    exec(`powershell -Command "Invoke-WebRequest -Uri '${installerUrl}' -OutFile '${downloadPath}'"`, { silent: true });
    
    log('Running installer (please wait)...', 'cyan');
    exec(`msiexec /i "${downloadPath}" /quiet /norestart`, { silent: true });
    
    // Add to PATH
    const nodePath = 'C:\\Program Files\\nodejs';
    exec(`setx PATH "%PATH%;${nodePath}"`, { silent: true });
    
    log('✅ Node.js installed! Please restart your terminal and run this installer again.', 'green');
    return false; // Need restart
  } catch (error) {
    log(`❌ Failed to install Node.js: ${error.message}`, 'red');
    log('Please download and install manually from https://nodejs.org/', 'yellow');
    return false;
  }
}

async function installNodeMac() {
  log('\n📥 Installing Node.js 22 LTS for macOS...', 'blue');
  
  try {
    // Check if Homebrew is installed
    try {
      exec('which brew', { silent: true });
      log('Installing Node.js via Homebrew...', 'cyan');
      exec('brew install node@22');
      exec('brew link node@22 --force');
    } catch {
      // Download and install directly
      log('Downloading Node.js installer...', 'cyan');
      const installerUrl = 'https://nodejs.org/dist/v22.13.0/node-v22.13.0.pkg';
      const downloadPath = join(homedir(), 'Downloads', 'node-installer.pkg');
      
      exec(`curl -L "${installerUrl}" -o "${downloadPath}"`, { silent: true });
      exec(`sudo installer -pkg "${downloadPath}" -target /`, { silent: true });
    }
    
    log('✅ Node.js installed!', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to install Node.js: ${error.message}`, 'red');
    return false;
  }
}

async function checkNpm() {
  log('\n🔍 Checking npm...', 'blue');
  
  try {
    exec('npm --version', { silent: true });
    log('✅ npm is available', 'green');
    return true;
  } catch {
    log('❌ npm not found (should come with Node.js)', 'red');
    return false;
  }
}

// ==================== SETUP ====================

async function installOpenClaw() {
  log('\n📦 Installing Otacon (OpenClaw engine)...', 'blue');
  
  try {
    // Install openclaw globally
    log('Installing OpenClaw engine...', 'cyan');
    exec('npm install -g openclaw@latest', { silent: false });
    
    log('✅ Otacon engine installed successfully!', 'green');
    return true;
  } catch (error) {
    log(`❌ Installation failed: ${error.message}`, 'red');
    return false;
  }
}

async function setupConfiguration() {
  log('\n⚙️  Setting up Otacon configuration...', 'blue');
  
  const configDir = join(homedir(), '.otacon');
  const openclawDir = join(homedir(), '.openclaw');
  
  // Create directories
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  
  if (!existsSync(openclawDir)) {
    mkdirSync(openclawDir, { recursive: true });
  }
  
  // Create simplified default config
  const defaultConfig = {
    agent: {
      model: "openai/gpt-4o-mini", // Free/cheap default model
      workspace: join(homedir(), '.otacon', 'workspace')
    },
    gateway: {
      port: 18789,
      bind: "localhost",
      auth: {
        mode: "password",
        password: generateSecurePassword()
      }
    },
    channels: {
      webchat: {
        enabled: true
      }
    },
    otacon: {
      version: "1.0.0",
      simplified: true,
      autoStart: true
    }
  };
  
  const configPath = join(openclawDir, 'openclaw.json');
  writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  
  log('✅ Configuration created', 'green');
  log(`📁 Config location: ${configPath}`, 'cyan');
  
  return true;
}

function generateSecurePassword() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function createShortcut() {
  log('\n🎯 Creating desktop shortcuts...', 'blue');
  
  if (IS_WINDOWS) {
    try {
      const desktopPath = join(homedir(), 'OneDrive', 'Desktop');
      const shortcutPath = join(desktopPath, 'Otacon.lnk');
      
      // Create PowerShell script for shortcut
      const psScript = `
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("${shortcutPath}")
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/k otacon-start"
$Shortcut.WorkingDirectory = "${homedir()}"
$Shortcut.IconLocation = "${__dirname}\\..\\assets\\otacon.ico"
$Shortcut.Save()
`;
      
      exec(`powershell -Command "${psScript}"`, { silent: true });
      log('✅ Desktop shortcut created', 'green');
    } catch {
      log('⚠️  Could not create desktop shortcut', 'yellow');
    }
  } else if (IS_MAC) {
    // Create macOS app bundle or alias
    log('ℹ️  You can start Otacon by running: otacon-start', 'cyan');
  }
}

async function setupAutoStart() {
  log('\n🚀 Setting up auto-start...', 'blue');
  
  if (IS_WINDOWS) {
    try {
      // Create startup script
      const startupScript = `@echo off
echo Starting Otacon...
openclaw gateway --port 18789 --bind localhost
`;
      
      const startupDir = join(homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
      const scriptPath = join(startupDir, 'otacon-startup.bat');
      
      writeFileSync(scriptPath, startupScript);
      log('✅ Auto-start configured (Otacon will start on login)', 'green');
    } catch {
      log('⚠️  Could not configure auto-start', 'yellow');
    }
  }
  
  return true;
}

// ==================== MAIN ====================

async function main() {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║     🤖 Welcome to Otacon Installer     ║
║                                        ║
║  Your Personal AI Assistant - Simplified║
║                                        ║
╚════════════════════════════════════════╝
`);
  
  log('Platform detected: ' + PLATFORM, 'cyan');
  
  // Check prerequisites
  let hasNode = await checkNodeVersion();
  
  if (!hasNode) {
    log('\n📦 Node.js is required but not found.', 'yellow');
    log('Otacon will now install Node.js automatically...', 'blue');
    
    if (IS_WINDOWS) {
      hasNode = await installNodeWindows();
    } else if (IS_MAC) {
      hasNode = await installNodeMac();
    } else {
      log('Please install Node.js 22+ manually from https://nodejs.org/', 'yellow');
      process.exit(1);
    }
    
    if (!hasNode) {
      log('\n⚠️  Please restart your computer and run this installer again.', 'yellow');
      process.exit(0);
    }
  }
  
  // Check npm
  await checkNpm();
  
  // Install Otacon
  const installed = await installOpenClaw();
  if (!installed) {
    log('\n❌ Installation failed. Please check the error messages above.', 'red');
    process.exit(1);
  }
  
  // Setup configuration
  await setupConfiguration();
  
  // Create shortcuts
  await createShortcut();
  
  // Setup auto-start
  await setupAutoStart();
  
  // Done
  console.log(`
╔════════════════════════════════════════╗
║         ✅ Installation Complete!       ║
╚════════════════════════════════════════╝

🎉 Otacon is now installed on your system!

📖 Quick Start:
   1. Open your browser and go to: http://localhost:18789
   2. Or run: otacon-start (from any terminal)
   3. WebChat will be available immediately

⚙️  Configuration:
   - Config file: ${join(homedir(), '.openclaw', 'openclaw.json')}
   - Workspace: ${join(homedir(), '.otacon', 'workspace')}

🆘 Need help?
   - Visit: https://otacon.ai/docs
   - Run: otacon-help

🔐 Security Note:
   Your gateway is configured with a secure password.
   To view it, check your config file.

Happy automating! 🤖
`);
}

// Run installer
main().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
