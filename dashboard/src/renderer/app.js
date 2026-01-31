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
  // Check initial status
  const status = await window.otaconAPI.getStatus();
  currentPort = status.port;
  portDisplay.textContent = currentPort;
  
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
  
  // Load saved settings
  loadSettings();
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
function savePort() {
  const portInput = document.getElementById('port-input');
  const port = parseInt(portInput.value);
  
  if (port < 1024 || port > 65535) {
    showToast('Port must be between 1024 and 65535', 'error');
    return;
  }
  
  // Save to store (you'd implement this in main process)
  currentPort = port;
  portDisplay.textContent = port;
  showToast(`Port changed to ${port}. Restart Otacon to apply.`, 'success');
}

function toggleAutostart(e) {
  const enabled = e.target.checked;
  // Implement autostart logic in main process
  showToast(`Auto-start ${enabled ? 'enabled' : 'disabled'}`, 'success');
}

async function resetConfig() {
  const confirmed = confirm('Are you sure? This will reset all settings to default.');
  
  if (confirmed) {
    // Reset logic here
    showToast('Configuration reset. Please restart Otacon.', 'success');
  }
}

function loadSettings() {
  // Load saved settings from store
  const autostart = false; // Get from store
  document.getElementById('autostart-toggle').checked = autostart;
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
    
    // Add context based on tab
    if (currentTerminalTab === 'otacon') {
      if (!command.startsWith('otacon')) {
        fullCommand = `otacon ${command}`;
      }
    }
    
    // Execute via main process
    const result = await window.otaconAPI.executeCommand(fullCommand);
    
    if (result.success) {
      addTerminalLine(result.output || 'Command executed successfully', 'success');
    } else {
      addTerminalLine(result.error || 'Command failed', 'error');
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

Otacon Commands:
  otacon start          - Start Otacon gateway
  otacon stop           - Stop Otacon gateway
  otacon status         - Check Otacon status
  otacon doctor         - Run diagnostics
  otacon models         - List available AI models
  otacon --version      - Show version

System Commands:
  ls, dir              - List files
  cd <path>            - Change directory
  pwd                  - Show current directory
  cat <file>           - View file contents
  mkdir <name>         - Create directory

Node.js Commands:
  node --version       - Check Node.js version
  npm list -g          - List global packages
  npm install <pkg>    - Install package

Other:
  clear                - Clear terminal
  help                 - Show this help
`;
  
  addTerminalLine(helpText, 'info');
}

function navigateHistory(direction) {
  // Implement command history navigation with arrow keys
  // This would track current position in history
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  window.otaconAPI.removeAllListeners('status-update');
  window.otaconAPI.removeAllListeners('node-missing');
});
