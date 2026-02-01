const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('otaconAPI', {
  // Control
  startOtacon: () => ipcRenderer.invoke('start-otacon'),
  stopOtacon: () => ipcRenderer.invoke('stop-otacon'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  
  // Actions
  openWebInterface: () => ipcRenderer.invoke('open-web-interface'),
  openConfigFolder: () => ipcRenderer.invoke('open-config-folder'),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  installNodeJS: () => ipcRenderer.invoke('install-nodejs'),
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  restartOnboarding: () => ipcRenderer.invoke('restart-onboarding'),
  resetAllSettings: () => ipcRenderer.invoke('reset-all-settings'),
  
  // Config management
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  updateAIConfig: (provider, apiKey, model) => ipcRenderer.invoke('update-ai-config', { provider, apiKey, model }),
  updatePermissions: (permissions) => ipcRenderer.invoke('update-permissions', permissions),
  updateChannel: (channel, settings) => ipcRenderer.invoke('update-channel', { channel, settings }),
  updatePort: (port) => ipcRenderer.invoke('update-port', port),
  
  // Activity/Log management
  getLogs: () => ipcRenderer.invoke('get-logs'),
  clearLogs: () => ipcRenderer.invoke('clear-logs'),
  getStats: () => ipcRenderer.invoke('get-stats'),
  exportLogs: () => ipcRenderer.invoke('export-logs'),
  
  // Events
  onStatusUpdate: (callback) => {
    ipcRenderer.on('status-update', (event, data) => callback(data));
  },
  onNodeMissing: (callback) => {
    ipcRenderer.on('node-missing', () => callback());
  },
  onLogEntry: (callback) => {
    ipcRenderer.on('log-entry', (event, data) => callback(data));
  },
  onStatsUpdate: (callback) => {
    ipcRenderer.on('stats-update', (event, data) => callback(data));
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Expose platform info
contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux'
});
