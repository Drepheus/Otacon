const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const Store = require('electron-store');

const store = new Store();
let mainWindow;
let tray;
let otaconProcess = null;

// Configuration
const isDev = process.argv.includes('--dev');
const OTACON_PORT = store.get('port') || 18789;

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

// Start Otacon Gateway
function startOtacon() {
  if (otaconProcess) {
    mainWindow?.webContents.send('status-update', {
      status: 'already-running',
      message: 'Otacon is already running!'
    });
    return;
  }

  mainWindow?.webContents.send('status-update', {
    status: 'starting',
    message: 'Starting Otacon...'
  });

  // Check if Node.js is installed
  exec('node --version', (error, stdout) => {
    if (error) {
      // Node.js not installed - show setup dialog
      mainWindow?.webContents.send('node-missing');
      return;
    }

    const nodeVersion = stdout.trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion < 22) {
      mainWindow?.webContents.send('status-update', {
        status: 'error',
        message: `Node.js ${nodeVersion} found, but 22+ is required. Please upgrade.`
      });
      return;
    }

    // Check if openclaw is installed
    exec('openclaw --version', (error) => {
      if (error) {
        // Install openclaw
        mainWindow?.webContents.send('status-update', {
          status: 'installing',
          message: 'Installing Otacon engine (one-time setup)...'
        });

        const installProcess = spawn('npm', ['install', '-g', 'openclaw@latest'], {
          shell: true,
          stdio: 'pipe'
        });

        let output = '';
        installProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        installProcess.stderr.on('data', (data) => {
          output += data.toString();
        });

        installProcess.on('close', (code) => {
          if (code === 0) {
            mainWindow?.webContents.send('status-update', {
              status: 'success',
              message: 'Otacon engine installed!'
            });
            launchGateway();
          } else {
            mainWindow?.webContents.send('status-update', {
              status: 'error',
              message: 'Installation failed. Please check your internet connection.'
            });
          }
        });
      } else {
        launchGateway();
      }
    });
  });
}

function launchGateway() {
  mainWindow?.webContents.send('status-update', {
    status: 'starting',
    message: 'Launching Otacon Gateway...'
  });

  otaconProcess = spawn('openclaw', ['gateway', '--port', OTACON_PORT.toString(), '--bind', 'localhost'], {
    shell: true,
    stdio: 'pipe'
  });

  otaconProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('Otacon stdout:', output);
    
    // Check for successful start
    if (output.includes('Gateway listening') || output.includes('port')) {
      mainWindow?.webContents.send('status-update', {
        status: 'running',
        message: 'Otacon is running!',
        port: OTACON_PORT
      });
    }
  });

  otaconProcess.stderr.on('data', (data) => {
    console.error('Otacon stderr:', data.toString());
  });

  otaconProcess.on('close', (code) => {
    console.log(`Otacon process exited with code ${code}`);
    otaconProcess = null;
    
    mainWindow?.webContents.send('status-update', {
      status: 'stopped',
      message: code === 0 ? 'Otacon stopped.' : 'Otacon crashed. Please restart.'
    });
  });

  // Wait a bit and check if it's running
  setTimeout(() => {
    checkIfRunning();
  }, 3000);
}

function checkIfRunning() {
  const http = require('http');
  
  const req = http.get(`http://localhost:${OTACON_PORT}/health`, (res) => {
    if (res.statusCode === 200) {
      mainWindow?.webContents.send('status-update', {
        status: 'running',
        message: 'Otacon is running and ready!',
        port: OTACON_PORT
      });
    }
  });
  
  req.on('error', () => {
    // Not running yet, wait more
  });
  
  req.setTimeout(2000, () => {
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
      exec(`taskkill /F /T /PID ${otaconProcess.pid}`, () => {
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
  const configPath = path.join(require('os').homedir(), '.openclaw');
  shell.openPath(configPath);
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
    message: 'Node.js is required to run Otacon',
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

// Terminal command execution
ipcMain.handle('execute-command', async (event, command) => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    
    // Security: Limit allowed commands
    const allowedCommands = ['otacon', 'node', 'npm', 'ls', 'dir', 'cd', 'pwd', 'cat', 'mkdir', 'echo', 'clear', 'help'];
    const commandBase = command.split(' ')[0];
    
    if (!allowedCommands.includes(commandBase) && !commandBase.startsWith('cd ')) {
      resolve({
        success: false,
        error: `Command '${commandBase}' not allowed for security reasons. Allowed commands: ${allowedCommands.join(', ')}`
      });
      return;
    }
    
    // Execute command with timeout
    const timeout = 30000; // 30 seconds
    const child = exec(command, { 
      timeout: timeout,
      maxBuffer: 1024 * 1024, // 1MB output limit
      cwd: require('os').homedir()
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
    
    // Handle timeout
    setTimeout(() => {
      child.kill();
      resolve({
        success: false,
        error: 'Command timed out after 30 seconds'
      });
    }, timeout);
  });
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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
