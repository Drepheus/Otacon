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
  
  // Events
  onStatusUpdate: (callback) => {
    ipcRenderer.on('status-update', (event, data) => callback(data));
  },
  onNodeMissing: (callback) => {
    ipcRenderer.on('node-missing', () => callback());
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
