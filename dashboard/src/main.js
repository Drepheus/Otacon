const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const os = require('os');

// Configuration paths
const CONFIG_DIR = path.join(os.homedir(), '.openclaw');
const CONFIG_FILE = path.join(CONFIG_DIR, 'clawdbot.json');
const OTACON_DIR = path.join(__dirname, '..', '..');
const OPENCLAW_DIR = path.join(OTACON_DIR, 'openclaw');

let mainWindow;
let onboardingWindow;
let tray;
let otaconProcess = null;

// Log buffer for activity monitoring
let logBuffer = [];
let maxLogBufferSize = 1000;
let startTime = null;
let messageCount = 0;
let errorCount = 0;

// Configuration
const isDev = process.argv.includes('--dev');

// Get port from config or default
function getPort() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return config.gateway?.port || 18789;
    }
  } catch (e) {
    console.error('Error reading config:', e);
  }
  return 18789;
}

const OTACON_PORT = getPort();

// Check if first launch
function isFirstLaunch() {
  return !fs.existsSync(CONFIG_FILE);
}

// Config Manager
const ConfigManager = {
  read() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      }
    } catch (e) {
      console.error('Error reading config:', e);
    }
    return this.getDefaultConfig();
  },

  write(config) {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      config.meta = config.meta || {};
      config.meta.lastTouchedVersion = '2026.1.29';
      config.meta.lastTouchedAt = new Date().toISOString();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      return true;
    } catch (e) {
      console.error('Error writing config:', e);
      return false;
    }
  },

  getDefaultConfig() {
    return {
      meta: {
        lastTouchedVersion: '2026.1.29',
        lastTouchedAt: new Date().toISOString()
      },
      wizard: {
        lastRunAt: new Date().toISOString(),
        lastRunVersion: '2026.1.29',
        lastRunCommand: 'onboard',
        lastRunMode: 'local'
      },
      agents: {
        defaults: {
          model: {
            primary: 'openai/gpt-4o-mini'
          },
          models: {},
          workspace: path.join(os.homedir(), 'clawd'),
          maxConcurrent: 4,
          subagents: {
            maxConcurrent: 8
          }
        }
      },
      gateway: {
        port: 18789,
        mode: 'local',
        bind: 'loopback',
        auth: {
          mode: 'token',
          token: this.generateToken()
        },
        tailscale: {
          mode: 'off',
          resetOnExit: false
        }
      },
      channels: {},
      plugins: {
        entries: {}
      },
      skills: {
        install: {
          nodeManager: 'npm'
        },
        entries: {}
      }
    };
  },

  generateToken() {
    return require('crypto').randomBytes(24).toString('hex');
  },

  // Update specific sections
  updateAIConfig(provider, apiKey, model) {
    const config = this.read();
    
    // Clear existing auth profiles for AI providers
    config.auth = config.auth || {};
    config.auth.profiles = config.auth.profiles || {};
    
    // Set the primary model
    config.agents.defaults.model.primary = model || `${provider}/default`;
    
    // Store API key in appropriate location based on provider
    if (provider === 'openai') {
      process.env.OPENAI_API_KEY = apiKey;
      config.auth.profiles['openai'] = {
        provider: 'openai',
        mode: 'apikey',
        apiKey: apiKey
      };
    } else if (provider === 'anthropic') {
      process.env.ANTHROPIC_API_KEY = apiKey;
      config.auth.profiles['anthropic'] = {
        provider: 'anthropic',
        mode: 'apikey',
        apiKey: apiKey
      };
    } else if (provider === 'openrouter') {
      process.env.OPENROUTER_API_KEY = apiKey;
      config.auth.profiles['openrouter'] = {
        provider: 'openrouter',
        mode: 'apikey',
        apiKey: apiKey
      };
    }
    
    // Update available models
    config.agents.defaults.models = config.agents.defaults.models || {};
    config.agents.defaults.models[config.agents.defaults.model.primary] = {};
    
    return this.write(config);
  },

  updatePermissions(permissions) {
    const config = this.read();
    
    // Map permissions to OpenClaw capabilities
    config.agents.defaults.permissions = {
      files: permissions.files,
      browser: permissions.browser,
      terminal: permissions.terminal,
      notifications: permissions.notifications
    };
    
    return this.write(config);
  },

  updateChannel(channel, settings) {
    const config = this.read();
    config.channels = config.channels || {};
    config.channels[channel] = settings;
    
    // Enable corresponding plugin
    config.plugins = config.plugins || {};
    config.plugins.entries = config.plugins.entries || {};
    config.plugins.entries[channel] = { enabled: true };
    
    return this.write(config);
  },

  updatePort(port) {
    const config = this.read();
    config.gateway = config.gateway || {};
    config.gateway.port = port;
    return this.write(config);
  }
};

function createOnboardingWindow() {
  onboardingWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 900,
    minHeight: 700,
    title: 'Welcome to Otacon',
    icon: path.join(__dirname, '..', 'assets', 'otacon-icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    resizable: true
  });

  // Load the onboarding UI
  onboardingWindow.loadFile(path.join(__dirname, 'renderer', 'onboarding.html'));

  // Show window when ready
  onboardingWindow.once('ready-to-show', () => {
    onboardingWindow.show();
    
    if (isDev) {
      onboardingWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  onboardingWindow.on('closed', () => {
    onboardingWindow = null;
    // If onboarding was completed, create main window
    if (!isFirstLaunch()) {
      createWindow();
    } else {
      // User closed without completing - quit app
      app.quit();
    }
  });

  // Listen for messages from onboarding
  onboardingWindow.webContents.on('did-finish-load', () => {
    onboardingWindow.webContents.executeJavaScript(`
      window.addEventListener('message', (event) => {
        if (event.data === 'onboarding-complete') {
          require('electron').ipcRenderer.send('onboarding-complete');
        }
      });
    `);
  });
}

// Handle onboarding completion
ipcMain.on('onboarding-complete', () => {
  if (onboardingWindow) {
    onboardingWindow.close();
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Otacon - Your AI Assistant',
    icon: path.join(__dirname, '..', 'assets', 'otacon-icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Load the dashboard UI
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'tray-icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Otacon',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Start Otacon',
      click: () => startOtacon()
    },
    {
      label: 'Stop Otacon',
      click: () => stopOtacon()
    },
    { type: 'separator' },
    {
      label: 'Open Web Interface',
      click: () => shell.openExternal(`http://localhost:${OTACON_PORT}`)
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        stopOtacon();
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Otacon - Your AI Assistant');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    } else {
      createWindow();
    }
  });
}

// Check if Node.js is installed and meets requirements
function checkNodeJS() {
  return new Promise((resolve) => {
    exec('node --version', (error, stdout) => {
      if (error) {
        resolve({ installed: false, version: null });
        return;
      }

      const version = stdout.trim();
      const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
      
      resolve({ 
        installed: true, 
        version: version,
        meetsRequirement: majorVersion >= 22
      });
    });
  });
}

// Check if OpenClaw dependencies are installed
function checkOpenClawDependencies() {
  return new Promise((resolve) => {
    const nodeModulesPath = path.join(OPENCLAW_DIR, 'node_modules');
    resolve(fs.existsSync(nodeModulesPath));
  });
}

// Install OpenClaw dependencies
function installOpenClawDependencies() {
  return new Promise((resolve, reject) => {
    mainWindow?.webContents.send('status-update', {
      status: 'installing',
      message: 'Installing OpenClaw dependencies (one-time setup)...'
    });

    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const installProcess = spawn(npmCmd, ['install'], {
      cwd: OPENCLAW_DIR,
      shell: true,
      stdio: 'pipe'
    });

    let output = '';
    installProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('Install stdout:', data.toString());
    });

    installProcess.stderr.on('data', (data) => {
      output += data.toString();
      console.error('Install stderr:', data.toString());
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        reject({ success: false, output, code });
      }
    });
  });
}

// Start Otacon Gateway
async function startOtacon() {
  if (otaconProcess) {
    mainWindow?.webContents.send('status-update', {
      status: 'already-running',
      message: 'Otacon is already running!'
    });
    return;
  }

  mainWindow?.webContents.send('status-update', {
    status: 'starting',
    message: 'Checking requirements...'
  });

  // Check Node.js
  const nodeCheck = await checkNodeJS();
  
  if (!nodeCheck.installed) {
    mainWindow?.webContents.send('node-missing');
    return;
  }

  if (!nodeCheck.meetsRequirement) {
    mainWindow?.webContents.send('status-update', {
      status: 'error',
      message: `Node.js ${nodeCheck.version} found, but 22+ is required. Please upgrade.`
    });
    return;
  }

  // Check if dependencies are installed
  const hasDependencies = await checkOpenClawDependencies();
  
  if (!hasDependencies) {
    mainWindow?.webContents.send('status-update', {
      status: 'installing',
      message: 'First-time setup: Installing OpenClaw dependencies...'
    });

    try {
      await installOpenClawDependencies();
      mainWindow?.webContents.send('status-update', {
        status: 'installing',
        message: 'Dependencies installed! Starting Otacon...'
      });
    } catch (error) {
      mainWindow?.webContents.send('status-update', {
        status: 'error',
        message: 'Failed to install dependencies. Check your internet connection.'
      });
      return;
    }
  }

  // Ensure config exists
  if (isFirstLaunch()) {
    ConfigManager.write(ConfigManager.getDefaultConfig());
  }

  launchGateway();
}

// Parse log level from OpenClaw output
function parseLogLevel(line) {
  const lower = line.toLowerCase();
  if (lower.includes('error') || lower.includes('failed') || lower.includes('exception')) {
    return 'error';
  } else if (lower.includes('warn')) {
    return 'warn';
  } else if (lower.includes('debug')) {
    return 'debug';
  }
  return 'info';
}

// Add log entry to buffer and send to renderer
function addLogEntry(message, level = 'info', source = 'stdout') {
  const entry = {
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString(),
    level,
    message: message.trim(),
    source
  };
  
  logBuffer.push(entry);
  
  // Keep buffer size limited
  if (logBuffer.length > maxLogBufferSize) {
    logBuffer.shift();
  }
  
  // Send to renderer
  mainWindow?.webContents.send('log-entry', entry);
  
  // Track stats
  if (level === 'error') {
    errorCount++;
    mainWindow?.webContents.send('stats-update', { errorCount });
  }
  
  // Track messages from certain patterns
  if (message.includes('message') || message.includes('chat') || message.includes('received')) {
    messageCount++;
    mainWindow?.webContents.send('stats-update', { messageCount });
  }
}

// Parse stats from log output
function parseStats(line) {
  // Look for various patterns in OpenClaw output
  const stats = {};
  
  // Messages
  if (line.includes('message') && line.includes('received')) {
    messageCount++;
    stats.messageCount = messageCount;
  }
  
  // Errors
  if (line.includes('error') || line.includes('failed')) {
    errorCount++;
    stats.errorCount = errorCount;
  }
  
  // Connected channels
  if (line.includes('connected') || line.includes('ready')) {
    if (line.includes('discord')) stats.discordConnected = true;
    if (line.includes('telegram')) stats.telegramConnected = true;
    if (line.includes('slack')) stats.slackConnected = true;
    if (line.includes('whatsapp')) stats.whatsappConnected = true;
  }
  
  if (Object.keys(stats).length > 0) {
    mainWindow?.webContents.send('stats-update', stats);
  }
}

function launchGateway() {
  // Reset stats
  startTime = Date.now();
  messageCount = 0;
  errorCount = 0;
  logBuffer = [];
  
  mainWindow?.webContents.send('status-update', {
    status: 'starting',
    message: 'Launching Otacon Gateway...'
  });

  // Use the local openclaw installation
  const openclawEntry = path.join(OPENCLAW_DIR, 'openclaw.mjs');
  
  // Set environment variables
  const env = {
    ...process.env,
    OPENCLAW_PORT: OTACON_PORT.toString(),
    CLAWDBOT_PORT: OTACON_PORT.toString(),
    OPENCLAW_BIND: 'localhost',
    CLAWDBOT_BIND: 'localhost'
  };

  // Read config to get API keys
  const config = ConfigManager.read();
  if (config.auth?.profiles) {
    Object.values(config.auth.profiles).forEach(profile => {
      if (profile.apiKey) {
        if (profile.provider === 'openai') {
          env.OPENAI_API_KEY = profile.apiKey;
        } else if (profile.provider === 'anthropic') {
          env.ANTHROPIC_API_KEY = profile.apiKey;
        } else if (profile.provider === 'openrouter') {
          env.OPENROUTER_API_KEY = profile.apiKey;
        }
      }
    });
  }

  otaconProcess = spawn('node', [openclawEntry, 'gateway', '--port', OTACON_PORT.toString(), '--bind', 'localhost'], {
    cwd: OPENCLAW_DIR,
    env: env,
    shell: false,
    stdio: 'pipe'
  });

  let hasStarted = false;

  otaconProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Otacon stdout:', output);
    
    // Parse and stream each line
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        const level = parseLogLevel(line);
        addLogEntry(line, level, 'stdout');
        parseStats(line);
      }
    });
    
    // Check for successful start indicators
    if (output.includes('Gateway listening') || output.includes('Server running') || output.includes('port')) {
      if (!hasStarted) {
        hasStarted = true;
        mainWindow?.webContents.send('status-update', {
          status: 'running',
          message: 'Otacon is running!',
          port: OTACON_PORT
        });
        
        // Send initial stats
        mainWindow?.webContents.send('stats-update', {
          startTime,
          messageCount: 0,
          errorCount: 0
        });
      }
    }
  });

  otaconProcess.stderr.on('data', (data) => {
    const output = data.toString();
    console.error('Otacon stderr:', output);
    
    // Parse and stream each line as error level
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        addLogEntry(line, 'error', 'stderr');
      }
    });
  });

  otaconProcess.on('close', (code) => {
    console.log(`Otacon process exited with code ${code}`);
    addLogEntry(`Process exited with code ${code}`, code === 0 ? 'info' : 'error', 'system');
    otaconProcess = null;
    
    mainWindow?.webContents.send('status-update', {
      status: 'stopped',
      message: code === 0 ? 'Otacon stopped.' : 'Otacon stopped unexpectedly.'
    });
  });

  otaconProcess.on('error', (err) => {
    console.error('Failed to start Otacon:', err);
    addLogEntry(`Failed to start: ${err.message}`, 'error', 'system');
    mainWindow?.webContents.send('status-update', {
      status: 'error',
      message: `Failed to start: ${err.message}`
    });
  });

  // Wait a bit and check if it's running via health endpoint
  setTimeout(() => {
    checkIfRunning();
  }, 5000);
}

function checkIfRunning() {
  const http = require('http');
  
  const req = http.get(`http://localhost:${OTACON_PORT}/health`, (res) => {
    if (res.statusCode === 200) {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          mainWindow?.webContents.send('status-update', {
            status: 'running',
            message: `Otacon is running (${health.status || 'ready'})`,
            port: OTACON_PORT
          });
        } catch (e) {
          mainWindow?.webContents.send('status-update', {
            status: 'running',
            message: 'Otacon is running!',
            port: OTACON_PORT
          });
        }
      });
    }
  });
  
  req.on('error', (err) => {
    console.log('Health check failed:', err.message);
    // Not running yet, will try again or rely on stdout messages
  });
  
  req.setTimeout(3000, () => {
    req.destroy();
  });
}

function stopOtacon() {
  if (otaconProcess) {
    mainWindow?.webContents.send('status-update', {
      status: 'stopping',
      message: 'Stopping Otacon...'
    });

    if (process.platform === 'win32') {
      exec(`taskkill /F /T /PID ${otaconProcess.pid}`, (err) => {
        if (err) {
          console.error('Error stopping process:', err);
        }
        otaconProcess = null;
      });
    } else {
      otaconProcess.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (otaconProcess) {
          otaconProcess.kill('SIGKILL');
          otaconProcess = null;
        }
      }, 5000);
    }
  }
}

// IPC Handlers
ipcMain.handle('start-otacon', () => {
  startOtacon();
});

ipcMain.handle('stop-otacon', () => {
  stopOtacon();
});

ipcMain.handle('get-status', () => {
  return {
    isRunning: otaconProcess !== null,
    port: OTACON_PORT
  };
});

ipcMain.handle('open-web-interface', () => {
  shell.openExternal(`http://localhost:${OTACON_PORT}`);
});

ipcMain.handle('open-config-folder', () => {
  shell.openPath(CONFIG_DIR);
});

ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'otacon-config.json',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('install-nodejs', async () => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Node.js Required',
    message: 'Node.js 22+ is required to run Otacon',
    detail: 'Would you like to download Node.js 22 LTS installer?\n\nAfter installation, please restart Otacon.',
    buttons: ['Download Node.js', 'Cancel'],
    defaultId: 0
  });

  if (result.response === 0) {
    const platform = process.platform;
    let downloadUrl;
    
    if (platform === 'win32') {
      downloadUrl = 'https://nodejs.org/dist/v22.13.0/node-v22.13.0-x64.msi';
    } else if (platform === 'darwin') {
      downloadUrl = 'https://nodejs.org/dist/v22.13.0/node-v22.13.0.pkg';
    } else {
      downloadUrl = 'https://nodejs.org/en/download/';
    }
    
    shell.openExternal(downloadUrl);
  }
});

// Config management IPC handlers
ipcMain.handle('get-config', () => {
  return ConfigManager.read();
});

ipcMain.handle('save-config', (event, config) => {
  return ConfigManager.write(config);
});

ipcMain.handle('update-ai-config', (event, { provider, apiKey, model }) => {
  return ConfigManager.updateAIConfig(provider, apiKey, model);
});

ipcMain.handle('update-permissions', (event, permissions) => {
  return ConfigManager.updatePermissions(permissions);
});

ipcMain.handle('update-channel', (event, { channel, settings }) => {
  return ConfigManager.updateChannel(channel, settings);
});

ipcMain.handle('update-port', (event, port) => {
  return ConfigManager.updatePort(port);
});

// Activity/Log management
ipcMain.handle('get-logs', () => {
  return logBuffer;
});

ipcMain.handle('clear-logs', () => {
  logBuffer = [];
  messageCount = 0;
  errorCount = 0;
  return { success: true };
});

ipcMain.handle('get-stats', () => {
  const config = ConfigManager.read();
  const activeChannels = Object.keys(config.channels || {}).filter(ch => config.channels[ch].enabled).length;
  
  return {
    isRunning: otaconProcess !== null,
    startTime,
    uptime: startTime ? Date.now() - startTime : 0,
    messageCount,
    errorCount,
    activeChannels,
    port: OTACON_PORT
  };
});

ipcMain.handle('export-logs', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `otacon-logs-${new Date().toISOString().split('T')[0]}.txt`,
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'Log Files', extensions: ['log'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePath) {
    const logText = logBuffer.map(entry => 
      `[${entry.time}] [${entry.level.toUpperCase()}] ${entry.message}`
    ).join('\n');
    
    try {
      fs.writeFileSync(result.filePath, logText, 'utf8');
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, canceled: true };
});

// Terminal command execution
ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve) => {
    // Parse command
    const commandParts = command.trim().split(' ');
    const commandBase = commandParts[0];
    
    // Check if it's an openclaw command - handle specially
    if (commandBase === 'openclaw' || commandBase === 'clawdbot' || commandBase === 'claw') {
      // Execute openclaw command using the local installation
      const openclawEntry = path.join(OPENCLAW_DIR, 'openclaw.mjs');
      const fullCommand = `node "${openclawEntry}" ${commandParts.slice(1).join(' ')}`;
      
      // Set up environment
      const env = {
        ...process.env,
        OPENCLAW_PORT: OTACON_PORT.toString(),
        CLAWDBOT_PORT: OTACON_PORT.toString(),
        OPENCLAW_BIND: 'localhost',
        CLAWDBOT_BIND: 'localhost'
      };
      
      // Read config to get API keys
      const config = ConfigManager.read();
      if (config.auth?.profiles) {
        Object.values(config.auth.profiles).forEach(profile => {
          if (profile.apiKey) {
            if (profile.provider === 'openai') env.OPENAI_API_KEY = profile.apiKey;
            if (profile.provider === 'anthropic') env.ANTHROPIC_API_KEY = profile.apiKey;
            if (profile.provider === 'openrouter') env.OPENROUTER_API_KEY = profile.apiKey;
          }
        });
      }
      
      exec(fullCommand, { 
        cwd: OPENCLAW_DIR,
        env: env,
        timeout: 60000,
        maxBuffer: 1024 * 1024
      }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            success: false,
            error: error.message,
            output: stderr || stdout
          });
        } else {
          resolve({
            success: true,
            output: stdout || stderr || 'Command executed successfully'
          });
        }
      });
      return;
    }
    
    // Security: Limit other commands
    const allowedCommands = ['ls', 'dir', 'cd', 'pwd', 'cat', 'type', 'mkdir', 'echo', 'clear', 'help', 'node', 'npm', 'pnpm', 'npx'];
    
    if (!allowedCommands.includes(commandBase)) {
      resolve({
        success: false,
        error: `Command '${commandBase}' not allowed. Try using 'openclaw <command>' instead.`
      });
      return;
    }
    
    // Execute command with timeout
    const timeout = 30000;
    const child = exec(command, { 
      timeout: timeout,
      maxBuffer: 1024 * 1024,
      cwd: os.homedir()
    }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          error: error.message,
          output: stderr || stdout
        });
      } else {
        resolve({
          success: true,
          output: stdout || stderr || 'Command executed successfully'
        });
      }
    });
    
    setTimeout(() => {
      child.kill();
      resolve({
        success: false,
        error: 'Command timed out after 30 seconds'
      });
    }, timeout);
  });
});

// Restart onboarding
ipcMain.handle('restart-onboarding', () => {
  // Remove config file to trigger onboarding
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  } catch (e) {
    console.error('Error removing config:', e);
  }
  
  if (mainWindow) {
    mainWindow.close();
  }
  createOnboardingWindow();
});

// Reset all settings
ipcMain.handle('reset-all-settings', () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  // Check if this is first launch
  if (isFirstLaunch()) {
    console.log('First launch detected - showing onboarding');
    createOnboardingWindow();
  } else {
    createWindow();
  }
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (isFirstLaunch()) {
        createOnboardingWindow();
      } else {
        createWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit, keep in tray
  }
});

app.on('before-quit', () => {
  stopOtacon();
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}
