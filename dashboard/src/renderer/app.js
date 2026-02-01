// Otacon Dashboard App
// Handles all UI interactions and communication with main process

let currentStatus = 'stopped';
let currentPort = 18789;

// DOM Elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const openWebBtn = document.getElementById('open-web-btn');
const statusBadge = document.getElementById('status-badge');
const statusIcon = document.getElementById('status-icon');
const statusTitle = document.getElementById('status-title');
const statusMessage = document.getElementById('status-message');
const progressBar = document.getElementById('progress-bar');
const nodejsModal = document.getElementById('nodejs-modal');
const portDisplay = document.getElementById('port-display');

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

// Initialize
async function init() {
  // Load saved settings first
  await loadSettings();
  
  // Check initial status
  const status = await window.otaconAPI.getStatus();
  if (status.port && status.port !== currentPort) {
    currentPort = status.port;
    portDisplay.textContent = currentPort;
  }
  
  if (status.isRunning) {
    updateUI('running', 'Otacon is running!', 'Your AI assistant is ready to help');
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup IPC listeners
  window.otaconAPI.onStatusUpdate((data) => {
    handleStatusUpdate(data);
  });
  
  window.otaconAPI.onNodeMissing(() => {
    showModal();
  });
  
  // Setup FAQ accordion
  setupFAQ();
  
  // Initialize terminal
  initTerminal();
  
  // Check OpenClaw health periodically
  startHealthCheck();
}

// Periodically check if OpenClaw is running
let healthCheckInterval;
function startHealthCheck() {
  // Check every 10 seconds
  healthCheckInterval = setInterval(async () => {
    if (currentStatus === 'running') {
      try {
        const response = await fetch(`http://localhost:${currentPort}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          // Health check failed - might have crashed
          console.warn('Health check failed');
        }
      } catch (error) {
        // Connection failed - service might be down
        if (currentStatus === 'running') {
          console.warn('OpenClaw connection lost');
          updateUI('stopped', 'Connection Lost', 'Otacon appears to have stopped');
          currentStatus = 'stopped';
        }
      }
    }
  }, 10000);
}

function setupEventListeners() {
  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = item.getAttribute('data-page');
      switchPage(targetPage);
      
      // Update active nav
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
  
  // Control buttons
  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    await window.otaconAPI.startOtacon();
  });
  
  stopBtn.addEventListener('click', async () => {
    stopBtn.disabled = true;
    await window.otaconAPI.stopOtacon();
  });
  
  openWebBtn.addEventListener('click', () => {
    window.otaconAPI.openWebInterface();
  });
  
  // Settings
  document.getElementById('save-port-btn').addEventListener('click', savePort);
  document.getElementById('autostart-toggle').addEventListener('change', toggleAutostart);
  document.getElementById('reset-btn').addEventListener('click', resetConfig);
  document.getElementById('restart-onboarding-btn').addEventListener('click', restartOnboarding);
  document.getElementById('refresh-chat-btn').addEventListener('click', () => {
    showToast('Chat interface refreshed', 'success');
  });
  
  // Troubleshooting
  document.getElementById('troubleshoot-btn').addEventListener('click', () => {
    showToast('Opening troubleshooting guide...', 'info');
    window.open('https://otacon.ai/docs/troubleshooting', '_blank');
  });
}

function switchPage(pageName) {
  pages.forEach(page => {
    page.classList.remove('active');
    if (page.id === `${pageName}-page`) {
      page.classList.add('active');
    }
  });
}

function handleStatusUpdate(data) {
  const { status, message, port } = data;
  currentStatus = status;
  
  if (port) {
    currentPort = port;
    portDisplay.textContent = port;
  }
  
  switch (status) {
    case 'starting':
      updateUI('starting', 'Starting Otacon...', message);
      progressBar.style.display = 'block';
      startBtn.disabled = true;
      break;
      
    case 'installing':
      updateUI('starting', 'Installing Otacon...', message);
      progressBar.style.display = 'block';
      startBtn.disabled = true;
      break;
      
    case 'running':
      updateUI('running', 'Otacon is Running!', message || 'Your AI assistant is ready');
      progressBar.style.display = 'none';
      showToast('Otacon started successfully!', 'success');
      break;
      
    case 'stopped':
      updateUI('stopped', 'Otacon Stopped', message || 'Click start to begin');
      progressBar.style.display = 'none';
      startBtn.disabled = false;
      startBtn.style.display = 'inline-flex';
      stopBtn.style.display = 'none';
      openWebBtn.style.display = 'none';
      updateStatusBadge('stopped');
      break;
      
    case 'error':
      updateUI('stopped', 'Error', message);
      progressBar.style.display = 'none';
      startBtn.disabled = false;
      showToast(message, 'error');
      break;
      
    case 'already-running':
      showToast(message, 'info');
      startBtn.disabled = false;
      break;
  }
}

function updateUI(status, title, message) {
  // Update status icon
  statusIcon.className = 'status-icon';
  statusIcon.classList.add(status === 'running' ? 'running' : 'stopped');
  
  const iconMap = {
    running: 'fa-check-circle',
    stopped: 'fa-power-off',
    starting: 'fa-spinner fa-spin'
  };
  
  statusIcon.innerHTML = `<i class="fas ${iconMap[status] || 'fa-power-off'}"></i>`;
  
  // Update text
  statusTitle.textContent = title;
  statusMessage.textContent = message;
  
  // Update buttons
  if (status === 'running') {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';
    stopBtn.disabled = false;
    openWebBtn.style.display = 'inline-flex';
    updateStatusBadge('running');
  } else if (status === 'stopped') {
    startBtn.style.display = 'inline-flex';
    stopBtn.style.display = 'none';
    openWebBtn.style.display = 'none';
    updateStatusBadge('stopped');
  }
}

function updateStatusBadge(status) {
  const dot = statusBadge.querySelector('.status-dot');
  const text = statusBadge.querySelector('.status-text');
  
  dot.className = 'status-dot';
  dot.classList.add(status);
  
  const statusMap = {
    running: 'Running',
    stopped: 'Stopped',
    starting: 'Starting...'
  };
  
  text.textContent = statusMap[status] || status;
}

// Modal functions
function showModal() {
  nodejsModal.classList.add('active');
}

function closeModal() {
  nodejsModal.classList.remove('active');
}

async function installNodeJS() {
  closeModal();
  await window.otaconAPI.installNodeJS();
  showToast('Opening Node.js download page...', 'info');
}

// Toast notifications
function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="fas ${iconMap[type]}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Settings functions
async function savePort() {
  const portInput = document.getElementById('port-input');
  const port = parseInt(portInput.value);
  
  if (port < 1024 || port > 65535) {
    showToast('Port must be between 1024 and 65535', 'error');
    return;
  }
  
  try {
    const result = await window.otaconAPI.updatePort(port);
    if (result) {
      currentPort = port;
      portDisplay.textContent = port;
      showToast(`Port changed to ${port}. Restart Otacon to apply.`, 'success');
    } else {
      showToast('Failed to save port', 'error');
    }
  } catch (error) {
    showToast('Error saving port', 'error');
    console.error(error);
  }
}

function toggleAutostart(e) {
  const enabled = e.target.checked;
  // Autostart requires system-level integration - for now just save preference
  localStorage.setItem('otacon-autostart', enabled);
  showToast(`Auto-start ${enabled ? 'enabled' : 'disabled'} (requires system restart)`, 'success');
}

async function resetConfig() {
  const confirmed = confirm('Are you sure? This will reset all settings to default and restart the setup wizard.');
  
  if (confirmed) {
    try {
      const result = await window.otaconAPI.resetAllSettings();
      if (result.success) {
        showToast('Configuration reset. Restarting setup wizard...', 'success');
        await window.otaconAPI.restartOnboarding();
      } else {
        showToast('Failed to reset: ' + result.error, 'error');
      }
    } catch (error) {
      showToast('Error resetting configuration', 'error');
      console.error(error);
    }
  }
}

async function loadSettings() {
  try {
    // Load config from main process
    const config = await window.otaconAPI.getConfig();
    
    // Update port display
    if (config.gateway?.port) {
      currentPort = config.gateway.port;
      portDisplay.textContent = currentPort;
      const portInput = document.getElementById('port-input');
      if (portInput) portInput.value = currentPort;
    }
    
    // Load autostart preference
    const autostart = localStorage.getItem('otacon-autostart') === 'true';
    document.getElementById('autostart-toggle').checked = autostart;
    
    // Update status display with config info
    updateConfigDisplay(config);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Update UI with config information
function updateConfigDisplay(config) {
  // Update AI provider info if element exists
  const aiProviderEl = document.getElementById('config-ai-provider');
  if (aiProviderEl) {
    const provider = config.agents?.defaults?.model?.primary || 'Not configured';
    aiProviderEl.textContent = provider;
  }
  
  // Update workspace path if element exists
  const workspaceEl = document.getElementById('config-workspace');
  if (workspaceEl) {
    const workspace = config.agents?.defaults?.workspace || '~/clawd';
    workspaceEl.textContent = workspace;
  }
  
  // Update channels info
  const channelsEl = document.getElementById('config-channels');
  if (channelsEl) {
    const channels = Object.keys(config.channels || {});
    channelsEl.textContent = channels.length > 0 ? channels.join(', ') : 'Web only';
  }
}

async function restartOnboarding() {
  const confirmed = confirm('This will restart the setup wizard. Otacon will close and reopen. Continue?');
  
  if (confirmed) {
    showToast('Restarting setup wizard...', 'info');
    await window.otaconAPI.restartOnboarding();
  }
}

// FAQ Accordion
function setupFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Close others
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current
      item.classList.toggle('active');
    });
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Terminal functionality
let terminalHistory = [];
let currentTerminalTab = 'otacon';

function initTerminal() {
  const terminalInput = document.getElementById('terminal-input');
  const terminalSubmit = document.getElementById('terminal-submit');
  const clearBtn = document.getElementById('clear-terminal-btn');
  const copyBtn = document.getElementById('copy-terminal-btn');
  const terminalHelpBtn = document.getElementById('terminal-help-btn');
  
  // Terminal tabs
  document.querySelectorAll('.terminal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.terminal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTerminalTab = tab.getAttribute('data-tab');
      updateTerminalPrompt();
    });
  });
  
  // Input handling
  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeTerminalCommand();
    } else if (e.key === 'ArrowUp') {
      navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      navigateHistory(1);
    }
  });
  
  terminalSubmit.addEventListener('click', executeTerminalCommand);
  
  // Clear button
  clearBtn.addEventListener('click', () => {
    const output = document.getElementById('terminal-output');
    output.innerHTML = `
      <div class="terminal-line welcome">
        <span class="terminal-prompt">$</span>
        <span class="terminal-text">Terminal cleared</span>
      </div>
    `;
  });
  
  // Copy button
  copyBtn.addEventListener('click', () => {
    const output = document.getElementById('terminal-output');
    const text = Array.from(output.querySelectorAll('.terminal-text'))
      .map(el => el.textContent)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      showToast('Terminal output copied!', 'success');
    });
  });
  
  // Help button
  terminalHelpBtn.addEventListener('click', showTerminalHelp);
  
  // Quick command buttons
  document.querySelectorAll('.quick-command-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const command = btn.getAttribute('data-command');
      terminalInput.value = command;
      terminalInput.focus();
    });
  });
}

function updateTerminalPrompt() {
  const prompt = document.getElementById('terminal-prompt');
  const cwd = document.getElementById('terminal-cwd');
  
  const prompts = {
    otacon: '$',
    system: '#',
    node: '>'
  };
  
  prompt.textContent = prompts[currentTerminalTab] || '$';
}

async function executeTerminalCommand() {
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  const command = input.value.trim();
  
  if (!command) return;
  
  // Add to display
  addTerminalLine(command, 'input');
  
  // Add to history
  terminalHistory.push(command);
  updateCommandHistory();
  
  // Update status
  updateTerminalStatus('running', 'Executing...');
  
  // Execute command
  try {
    let fullCommand = command;
    
    // Handle dashboard-specific commands
    const dashboardCommands = ['start', 'stop', 'status', 'restart'];
    const commandBase = command.split(' ')[0];
    
    if (dashboardCommands.includes(commandBase)) {
      // Execute dashboard command
      if (commandBase === 'start') {
        await window.otaconAPI.startOtacon();
        addTerminalLine('Starting Otacon... Check the Dashboard for status updates.', 'success');
      } else if (commandBase === 'stop') {
        await window.otaconAPI.stopOtacon();
        addTerminalLine('Stopping Otacon...', 'success');
      } else if (commandBase === 'status') {
        const status = await window.otaconAPI.getStatus();
        const statusText = status.isRunning ? 'RUNNING' : 'STOPPED';
        const statusColor = status.isRunning ? '\x1b[32m' : '\x1b[31m';
        addTerminalLine(`Status: ${statusText}`, status.isRunning ? 'success' : 'error');
        addTerminalLine(`Port: ${status.port}`, 'output');
        if (status.isRunning) {
          addTerminalLine(`Web Interface: http://localhost:${status.port}`, 'output');
        }
      } else if (commandBase === 'restart') {
        addTerminalLine('Stopping Otacon...', 'info');
        await window.otaconAPI.stopOtacon();
        await new Promise(r => setTimeout(r, 1000));
        addTerminalLine('Starting Otacon...', 'info');
        await window.otaconAPI.startOtacon();
      }
    } else {
      // Add context based on tab
      if (currentTerminalTab === 'otacon') {
        if (!command.startsWith('openclaw') && !command.startsWith('otacon')) {
          fullCommand = `openclaw ${command}`;
        }
      }
      
      // Execute via main process
      const result = await window.otaconAPI.executeCommand(fullCommand);
      
      if (result.success) {
        addTerminalLine(result.output || 'Command executed successfully', 'success');
      } else {
        addTerminalLine(result.error || 'Command failed', 'error');
      }
    }
  } catch (error) {
    addTerminalLine(`Error: ${error.message}`, 'error');
  }
  
  // Clear input
  input.value = '';
  
  // Update status
  updateTerminalStatus('ready', 'Ready');
  
  // Scroll to bottom
  const container = document.querySelector('.terminal-container');
  container.scrollTop = container.scrollHeight;
}

function addTerminalLine(text, type = 'output') {
  const output = document.getElementById('terminal-output');
  const line = document.createElement('div');
  line.className = `terminal-line ${type}`;
  
  if (type === 'input') {
    line.innerHTML = `
      <span class="terminal-prompt">${document.getElementById('terminal-prompt').textContent}</span>
      <span class="terminal-text">${escapeHtml(text)}</span>
    `;
  } else {
    line.innerHTML = `
      <span class="terminal-text">${escapeHtml(text)}</span>
    `;
  }
  
  output.appendChild(line);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateCommandHistory() {
  const historyContainer = document.getElementById('command-history');
  const count = document.getElementById('terminal-history-count');
  
  count.textContent = `${terminalHistory.length} command${terminalHistory.length !== 1 ? 's' : ''}`;
  
  if (terminalHistory.length === 0) {
    historyContainer.innerHTML = '<div class="command-history-empty">No commands executed yet</div>';
    return;
  }
  
  historyContainer.innerHTML = terminalHistory
    .slice(-10)
    .reverse()
    .map((cmd, index) => `
      <div class="command-history-item">
        <span class="command-history-cmd">${escapeHtml(cmd)}</span>
        <span class="command-history-time">#${terminalHistory.length - index}</span>
      </div>
    `)
    .join('');
}

function updateTerminalStatus(status, text) {
  const statusText = document.getElementById('terminal-status-text');
  const statusIcon = document.getElementById('terminal-status-icon');
  const lastCommand = document.getElementById('terminal-last-command');
  
  statusText.textContent = text;
  statusIcon.className = `fas fa-circle ${status}`;
  
  if (terminalHistory.length > 0) {
    lastCommand.innerHTML = `<span>Last: ${escapeHtml(terminalHistory[terminalHistory.length - 1])}</span>`;
  }
}

function showTerminalHelp() {
  const helpText = `
Available Commands:
==================

🔥 OpenClaw CLI (Full Access):
  openclaw --help              - Show all OpenClaw commands
  openclaw gateway --port 18789 - Start gateway manually
  openclaw doctor              - Run diagnostics
  openclaw models              - List AI models
  openclaw skills list         - List installed skills
  openclaw skills install <name> - Install a skill
  openclaw config              - Show configuration
  openclaw wizard              - Run setup wizard
  openclaw --version           - Show version

📊 Dashboard Commands:
  start              - Start Otacon (same as clicking Start button)
  stop               - Stop Otacon (same as clicking Stop button)
  status             - Check if Otacon is running

💻 System Commands:
  ls, dir            - List files
  cd <path>          - Change directory
  pwd                - Show current directory
  cat <file>         - View file contents
  mkdir <name>       - Create directory
  clear              - Clear terminal

📦 Node.js Commands:
  node --version     - Check Node.js version
  npm list -g        - List global packages
  npm install <pkg>  - Install package

💡 Tip: Type 'openclaw --help' to see ALL available OpenClaw commands!
 You have FULL access to OpenClaw through this terminal.
 `;
  
  addTerminalLine(helpText, 'info');
}

function navigateHistory(direction) {
  // Implement command history navigation with arrow keys
  // This would track current position in history
}

// ==========================================
// ACTIVITY PAGE - Log Streaming & Monitoring
// ==========================================

let activityLogPaused = false;
let activityLogs = [];
let currentStats = {
  isRunning: false,
  startTime: null,
  messageCount: 0,
  errorCount: 0,
  activeChannels: 0
};
let uptimeInterval;

// Initialize activity page
async function initActivityPage() {
  // Setup event listeners
  setupActivityListeners();
  
  // Setup log streaming
  setupLogStreaming();
  
  // Load initial stats
  await loadActivityStats();
  
  // Load system info
  await loadSystemInfo();
  
  // Start uptime counter
  startUptimeCounter();
}

function setupActivityListeners() {
  // Clear logs button
  document.getElementById('clear-logs-btn')?.addEventListener('click', async () => {
    await window.otaconAPI.clearLogs();
    activityLogs = [];
    renderActivityLogs();
    showToast('Logs cleared', 'success');
  });
  
  // Export logs button
  document.getElementById('export-logs-btn')?.addEventListener('click', async () => {
    const result = await window.otaconAPI.exportLogs();
    if (result.success) {
      showToast(`Logs exported to ${result.filePath}`, 'success');
    } else if (!result.canceled) {
      showToast('Failed to export logs', 'error');
    }
  });
  
  // Pause/Resume button
  document.getElementById('pause-logs-btn')?.addEventListener('click', () => {
    activityLogPaused = !activityLogPaused;
    const btn = document.getElementById('pause-logs-btn');
    if (activityLogPaused) {
      btn.innerHTML = '<i class="fas fa-play"></i> Resume';
      showToast('Log streaming paused', 'info');
    } else {
      btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
      showToast('Log streaming resumed', 'info');
    }
  });
  
  // Filter toggles
  ['show-info', 'show-warn', 'show-error'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      renderActivityLogs();
    });
  });
  
  // View all events button
  document.getElementById('view-all-events')?.addEventListener('click', () => {
    showToast('All events view coming soon', 'info');
  });
}

function setupLogStreaming() {
  // Listen for new log entries
  window.otaconAPI.onLogEntry((entry) => {
    if (!activityLogPaused) {
      activityLogs.push(entry);
      
      // Keep buffer size limited
      if (activityLogs.length > 500) {
        activityLogs.shift();
      }
      
      // Add to display
      appendLogEntry(entry);
    }
  });
  
  // Listen for stats updates
  window.otaconAPI.onStatsUpdate((stats) => {
    currentStats = { ...currentStats, ...stats };
    updateActivityStats(stats);
  });
}

async function loadActivityStats() {
  try {
    const stats = await window.otaconAPI.getStats();
    currentStats = stats;
    updateActivityStats(stats);
    
    // Update status indicator
    const statusEl = document.getElementById('activity-status');
    if (statusEl) {
      if (stats.isRunning) {
        statusEl.innerHTML = '<span class="status-indicator running"></span>Running';
      } else {
        statusEl.innerHTML = '<span class="status-indicator stopped"></span>Stopped';
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadSystemInfo() {
  try {
    const config = await window.otaconAPI.getConfig();
    
    // Update version info
    const versionEl = document.getElementById('oc-version');
    if (versionEl) {
      versionEl.textContent = config.meta?.lastTouchedVersion || '2026.1.29';
    }
    
    // Update workspace
    const workspaceEl = document.getElementById('workspace-path');
    if (workspaceEl) {
      workspaceEl.textContent = config.agents?.defaults?.workspace || '~/clawd';
    }
    
    // Update port
    const portEl = document.getElementById('gateway-port');
    if (portEl) {
      portEl.textContent = config.gateway?.port || 18789;
    }
    
    // Update connected services
    updateServicesList(config);
  } catch (error) {
    console.error('Error loading system info:', error);
  }
}

function updateServicesList(config) {
  const servicesList = document.getElementById('services-list');
  if (!servicesList) return;
  
  const aiProvider = config.agents?.defaults?.model?.primary || 'Not configured';
  const channels = config.channels || {};
  
  servicesList.innerHTML = `
    <div class="service-item ${aiProvider !== 'Not configured' ? 'connected' : 'disabled'}">
      <i class="fas fa-robot"></i>
      <span>AI Provider</span>
      <span class="service-status">${aiProvider}</span>
    </div>
    <div class="service-item ${channels.discord?.enabled ? 'connected' : 'disabled'}">
      <i class="fab fa-discord"></i>
      <span>Discord</span>
      <span class="service-status">${channels.discord?.enabled ? 'Connected' : 'Not connected'}</span>
    </div>
    <div class="service-item ${channels.telegram?.enabled ? 'connected' : 'disabled'}">
      <i class="fab fa-telegram"></i>
      <span>Telegram</span>
      <span class="service-status">${channels.telegram?.enabled ? 'Connected' : 'Not connected'}</span>
    </div>
    <div class="service-item ${channels.slack?.enabled ? 'connected' : 'disabled'}">
      <i class="fab fa-slack"></i>
      <span>Slack</span>
      <span class="service-status">${channels.slack?.enabled ? 'Connected' : 'Not connected'}</span>
    </div>
    <div class="service-item ${currentStats.isRunning ? 'connected' : 'disabled'}">
      <i class="fas fa-globe"></i>
      <span>Web Interface</span>
      <span class="service-status">${currentStats.isRunning ? 'Running on port ' + currentStats.port : 'Not running'}</span>
    </div>
  `;
}

function updateActivityStats(stats) {
  // Update message count
  const messagesEl = document.getElementById('activity-messages');
  if (messagesEl && stats.messageCount !== undefined) {
    messagesEl.textContent = stats.messageCount;
  }
  
  // Update error count
  const errorsEl = document.getElementById('activity-errors');
  if (errorsEl && stats.errorCount !== undefined) {
    errorsEl.textContent = stats.errorCount;
  }
  
  // Update active channels
  const channelsEl = document.getElementById('activity-channels');
  if (channelsEl && stats.activeChannels !== undefined) {
    channelsEl.textContent = stats.activeChannels;
  }
  
  // Update status indicator
  const statusEl = document.getElementById('activity-status');
  if (statusEl) {
    if (currentStats.isRunning) {
      statusEl.innerHTML = '<span class="status-indicator running"></span>Running';
    } else {
      statusEl.innerHTML = '<span class="status-indicator stopped"></span>Stopped';
    }
  }
}

function startUptimeCounter() {
  // Clear existing interval
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
  }
  
  // Update every second
  uptimeInterval = setInterval(() => {
    const uptimeEl = document.getElementById('activity-uptime');
    if (uptimeEl && currentStats.startTime && currentStats.isRunning) {
      const uptime = Date.now() - currentStats.startTime;
      uptimeEl.textContent = formatUptime(uptime);
    } else if (uptimeEl) {
      uptimeEl.textContent = '--:--:--';
    }
  }, 1000);
}

function formatUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function appendLogEntry(entry) {
  const container = document.getElementById('activity-log');
  if (!container) return;
  
  // Check filters
  const showInfo = document.getElementById('show-info')?.checked ?? true;
  const showWarn = document.getElementById('show-warn')?.checked ?? true;
  const showError = document.getElementById('show-error')?.checked ?? true;
  
  if (entry.level === 'info' && !showInfo) return;
  if (entry.level === 'warn' && !showWarn) return;
  if (entry.level === 'error' && !showError) return;
  
  // Remove placeholder if exists
  const placeholder = container.querySelector('.placeholder');
  if (placeholder) {
    placeholder.remove();
  }
  
  // Create log entry element
  const logEl = document.createElement('div');
  logEl.className = `log-entry ${entry.level}`;
  logEl.innerHTML = `
    <span class="log-time">${entry.time}</span>
    <span class="log-level ${entry.level}">${entry.level.toUpperCase()}</span>
    <span class="log-message">${escapeHtml(entry.message)}</span>
  `;
  
  container.appendChild(logEl);
  
  // Auto-scroll to bottom
  container.scrollTop = container.scrollHeight;
  
  // Limit displayed entries
  while (container.children.length > 100) {
    container.removeChild(container.firstChild);
  }
}

function renderActivityLogs() {
  const container = document.getElementById('activity-log');
  if (!container) return;
  
  // Get filter states
  const showInfo = document.getElementById('show-info')?.checked ?? true;
  const showWarn = document.getElementById('show-warn')?.checked ?? true;
  const showError = document.getElementById('show-error')?.checked ?? true;
  
  // Clear container
  container.innerHTML = '';
  
  // Filter and render
  let hasVisible = false;
  activityLogs.slice(-100).forEach(entry => {
    if (entry.level === 'info' && !showInfo) return;
    if (entry.level === 'warn' && !showWarn) return;
    if (entry.level === 'error' && !showError) return;
    
    hasVisible = true;
    
    const logEl = document.createElement('div');
    logEl.className = `log-entry ${entry.level}`;
    logEl.innerHTML = `
      <span class="log-time">${entry.time}</span>
      <span class="log-level ${entry.level}">${entry.level.toUpperCase()}</span>
      <span class="log-message">${escapeHtml(entry.message)}</span>
    `;
    container.appendChild(logEl);
  });
  
  // Add placeholder if empty
  if (!hasVisible) {
    container.innerHTML = `
      <div class="log-entry placeholder">
        <span class="log-time">--:--:--</span>
        <span class="log-level info">INFO</span>
        <span class="log-message">No logs match current filters</span>
      </div>
    `;
  }
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// Initialize activity page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initActivityPage();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  window.otaconAPI.removeAllListeners('status-update');
  window.otaconAPI.removeAllListeners('node-missing');
  window.otaconAPI.removeAllListeners('log-entry');
  window.otaconAPI.removeAllListeners('stats-update');
  if (uptimeInterval) {
    clearInterval(uptimeInterval);
  }
});
