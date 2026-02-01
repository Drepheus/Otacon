// Onboarding Wizard Logic

let currentStep = 1;
const totalSteps = 5;
let selectedAI = null;
let configuredAI = false;
let permissions = {
  files: true,
  browser: true,
  terminal: false,
  notifications: true
};

// Initialize
function init() {
  updateProgress();
}

// Navigation
function nextStep() {
  if (currentStep < totalSteps) {
    // Validation
    if (currentStep === 2 && !configuredAI) {
      alert('Please select and configure an AI service before continuing.');
      return;
    }
    
    currentStep++;
    showStep(currentStep);
    updateProgress();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
    updateProgress();
  }
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.onboarding-step').forEach(el => {
    el.classList.remove('active');
  });
  
  // Show current step
  document.getElementById(`step-${step}`).classList.add('active');
  
  // Update step indicators
  document.querySelectorAll('.progress-steps .step').forEach((el, index) => {
    el.classList.remove('active', 'completed');
    if (index + 1 === step) {
      el.classList.add('active');
    } else if (index + 1 < step) {
      el.classList.add('completed');
    }
  });
}

function updateProgress() {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;
}

// AI Selection
function selectAI(ai) {
  selectedAI = ai;
  
  // Update UI
  document.querySelectorAll('.ai-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`[data-ai="${ai}"]`).classList.add('selected');
  
  // Show config panel
  const configPanel = document.getElementById('ai-config-panel');
  configPanel.style.display = 'block';
  
  // Update config panel based on AI
  updateAIConfigPanel(ai);
  
  // Scroll to config
  configPanel.scrollIntoView({ behavior: 'smooth' });
}

function updateAIConfigPanel(ai) {
  const modelSelect = document.getElementById('model-select');
  const apiKeyHelp = document.getElementById('api-key-help');
  
  const aiConfigs = {
    openai: {
      models: `
        <option value="">Use recommended (GPT-4o Mini)</option>
        <option value="gpt-4o">GPT-4o (Most capable)</option>
        <option value="gpt-4o-mini">GPT-4o Mini (Fast & cheap)</option>
        <option value="gpt-4">GPT-4 (Legacy)</option>
      `,
      helpUrl: 'https://platform.openai.com/api-keys'
    },
    anthropic: {
      models: `
        <option value="">Use recommended (Claude Sonnet)</option>
        <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
        <option value="claude-haiku-4-20250514">Claude Haiku (Fast)</option>
      `,
      helpUrl: 'https://console.anthropic.com/settings/keys'
    },
    openrouter: {
      models: `
        <option value="">Auto-select best model</option>
        <option value="openrouter/auto">Auto (Recommended)</option>
        <option value="anthropic/claude-sonnet-4-5">Claude via OpenRouter</option>
        <option value="openai/gpt-4o">GPT-4o via OpenRouter</option>
      `,
      helpUrl: 'https://openrouter.ai/settings/keys'
    },
    local: {
      models: `
        <option value="">Select local model...</option>
      `,
      helpUrl: '#'
    }
  };
  
  const config = aiConfigs[ai];
  if (config) {
    modelSelect.innerHTML = config.models;
    apiKeyHelp.href = config.helpUrl;
  }
}

function togglePassword() {
  const input = document.getElementById('api-key-input');
  const button = event.currentTarget;
  
  if (input.type === 'password') {
    input.type = 'text';
    button.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    button.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

async function testConnection() {
  const apiKey = document.getElementById('api-key-input').value;
  const modelSelect = document.getElementById('model-select');
  const selectedModel = modelSelect.value;
  const statusEl = document.getElementById('test-status');
  
  if (!apiKey) {
    statusEl.textContent = '❌ Please enter an API key';
    statusEl.style.color = '#ef4444';
    return;
  }
  
  statusEl.textContent = '🔄 Testing...';
  statusEl.style.color = '#f59e0b';
  
  // Determine the full model string
  let modelString = selectedModel;
  if (!modelString) {
    // Use default based on provider
    const defaults = {
      openai: 'openai/gpt-4o-mini',
      anthropic: 'anthropic/claude-sonnet-4-5',
      openrouter: 'openrouter/auto',
      local: 'local/default'
    };
    modelString = defaults[selectedAI] || 'openai/gpt-4o-mini';
  } else {
    // Prefix with provider if not already
    if (!modelString.includes('/')) {
      modelString = `${selectedAI}/${modelString}`;
    }
  }
  
  try {
    // Save configuration via IPC
    const result = await window.otaconAPI.updateAIConfig(selectedAI, apiKey, modelString);
    
    if (result) {
      // Test the API key with a simple request
      let testUrl;
      let headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      
      if (selectedAI === 'openai') {
        testUrl = 'https://api.openai.com/v1/models';
      } else if (selectedAI === 'anthropic') {
        testUrl = 'https://api.anthropic.com/v1/models';
        headers['x-api-key'] = apiKey;
        delete headers['Authorization'];
      } else if (selectedAI === 'openrouter') {
        testUrl = 'https://openrouter.ai/api/v1/auth/key';
      } else {
        // Local model - skip test
        statusEl.textContent = '✅ Local model selected';
        statusEl.style.color = '#22c55e';
        configuredAI = true;
        document.getElementById('ai-next-btn').disabled = false;
        return;
      }
      
      const response = await fetch(testUrl, { 
        method: 'GET',
        headers: headers
      });
      
      if (response.ok) {
        statusEl.textContent = '✅ Connection successful!';
        statusEl.style.color = '#22c55e';
        configuredAI = true;
        document.getElementById('ai-next-btn').disabled = false;
      } else {
        const errorData = await response.json().catch(() => ({}));
        statusEl.textContent = `❌ ${errorData.error?.message || 'Invalid API key'}`;
        statusEl.style.color = '#ef4444';
      }
    } else {
      statusEl.textContent = '❌ Failed to save configuration';
      statusEl.style.color = '#ef4444';
    }
  } catch (error) {
    console.error('Connection test error:', error);
    statusEl.textContent = '❌ Network error - will retry on startup';
    statusEl.style.color = '#ef4444';
    // Still allow them to continue
    configuredAI = true;
    document.getElementById('ai-next-btn').disabled = false;
  }
}

// Permissions
async function updatePermission(permission, enabled) {
  permissions[permission] = enabled;
  
  // Save to main process config
  try {
    await window.otaconAPI.updatePermissions(permissions);
  } catch (error) {
    console.error('Failed to save permissions:', error);
  }
  
  // Visual feedback
  const item = document.querySelector(`[data-permission="${permission}"]`);
  if (enabled) {
    item.style.borderColor = 'var(--color-text-secondary)';
  } else {
    item.style.borderColor = 'var(--color-border)';
  }
}

// Channels
function setupChannel(channel) {
  const modal = document.getElementById('channel-setup-modal');
  const title = document.getElementById('setup-channel-title');
  const content = document.getElementById('setup-channel-content');
  
  const channelConfigs = {
    slack: {
      title: 'Setup Slack Integration',
      content: `
        <div class="setup-instructions">
          <h4>Steps to connect Slack:</h4>
          <ol>
            <li>Go to <a href="https://api.slack.com/apps" target="_blank">Slack API Apps</a></li>
            <li>Click "Create New App" → "From scratch"</li>
            <li>Name it "Otacon" and select your workspace</li>
            <li>Go to "OAuth & Permissions"</li>
            <li>Add these scopes: <code>chat:write</code>, <code>im:read</code>, <code>im:write</code></li>
            <li>Click "Install to Workspace"</li>
            <li>Copy the "Bot User OAuth Token"</li>
          </ol>
          <div class="form-group" style="margin-top: 1.5rem;">
            <label>Paste your Bot Token here:</label>
            <input type="text" class="form-input" placeholder="xoxb-..." id="slack-token">
          </div>
          <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="saveChannelConfig('slack')">
            Connect Slack
          </button>
        </div>
      `
    },
    discord: {
      title: 'Setup Discord Bot',
      content: `
        <div class="setup-instructions">
          <h4>Steps to create a Discord bot:</h4>
          <ol>
            <li>Go to <a href="https://discord.com/developers/applications" target="_blank">Discord Developer Portal</a></li>
            <li>Click "New Application" and name it "Otacon"</li>
            <li>Go to "Bot" section and click "Add Bot"</li>
            <li>Copy the token (click "Reset Token" if needed)</li>
            <li>Enable these intents: SERVER MEMBERS, MESSAGE CONTENT</li>
          </ol>
          <div class="form-group" style="margin-top: 1.5rem;">
            <label>Paste your Bot Token here:</label>
            <input type="text" class="form-input" placeholder="..." id="discord-token">
          </div>
          <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="saveChannelConfig('discord')">
            Connect Discord
          </button>
        </div>
      `
    },
    telegram: {
      title: 'Setup Telegram Bot',
      content: `
        <div class="setup-instructions">
          <h4>Steps to create a Telegram bot:</h4>
          <ol>
            <li>Open Telegram and search for "@BotFather"</li>
            <li>Send <code>/newbot</code> command</li>
            <li>Name your bot "Otacon"</li>
            <li>Choose a username (e.g., @myotacon_bot)</li>
            <li>Copy the HTTP API token BotFather gives you</li>
          </ol>
          <div class="form-group" style="margin-top: 1.5rem;">
            <label>Paste your Bot Token here:</label>
            <input type="text" class="form-input" placeholder="..." id="telegram-token">
          </div>
          <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="saveChannelConfig('telegram')">
            Connect Telegram
          </button>
        </div>
      `
    },
    whatsapp: {
      title: 'Setup WhatsApp',
      content: `
        <div class="setup-instructions">
          <h4>WhatsApp Setup:</h4>
          <p style="margin: 1rem 0; color: var(--color-text-secondary);">
            WhatsApp integration requires scanning a QR code with your phone.
          </p>
          <ol>
            <li>Click "Start WhatsApp Setup" below</li>
            <li>A QR code will appear in the terminal</li>
            <li>Open WhatsApp on your phone</li>
            <li>Go to Settings → Linked Devices → Link a Device</li>
            <li>Scan the QR code</li>
          </ol>
          <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="saveChannelConfig('whatsapp')">
            Start WhatsApp Setup
          </button>
        </div>
      `
    },
    email: {
      title: 'Setup Gmail',
      content: `
        <div class="setup-instructions">
          <h4>Connect Gmail:</h4>
          <ol>
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
            <li>Create a new project</li>
            <li>Enable Gmail API</li>
            <li>Create OAuth 2.0 credentials</li>
            <li>Download the credentials.json file</li>
          </ol>
          <div class="form-group" style="margin-top: 1.5rem;">
            <label>Or use App Password (easier):</label>
            <input type="email" class="form-input" placeholder="your.email@gmail.com" style="margin-bottom: 0.5rem;">
            <input type="password" class="form-input" placeholder="App Password (not your Gmail password)">
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem;">
              Generate at: Google Account → Security → 2-Step Verification → App passwords
            </p>
          </div>
          <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" onclick="saveChannelConfig('email')">
            Connect Gmail
          </button>
        </div>
      `
    }
  };
  
  const config = channelConfigs[channel];
  if (config) {
    title.textContent = config.title;
    content.innerHTML = config.content;
    modal.style.display = 'block';
  }
}

function closeChannelSetup() {
  document.getElementById('channel-setup-modal').style.display = 'none';
}

async function saveChannelConfig(channel) {
  // Get the token from the appropriate input
  const tokenInput = document.getElementById(`${channel}-token`);
  const token = tokenInput ? tokenInput.value : '';
  
  if (!token && channel !== 'whatsapp' && channel !== 'email') {
    alert(`Please enter your ${channel} token/ credentials`);
    return;
  }
  
  try {
    // Save channel configuration
    const settings = {
      enabled: true,
      token: token
    };
    
    // Add channel-specific settings
    if (channel === 'slack') {
      settings.groupPolicy = 'open';
    } else if (channel === 'discord') {
      settings.intents = ['SERVER_MEMBERS', 'MESSAGE_CONTENT'];
    }
    
    const result = await window.otaconAPI.updateChannel(channel, settings);
    
    if (result) {
      closeChannelSetup();
      
      // Update channel card to show connected
      const card = document.querySelector(`[data-channel="${channel}"]`);
      const status = card.querySelector('.channel-status');
      status.textContent = 'Configured';
      status.style.color = '#22c55e';
      
      showToast(`${channel} configured successfully!`, 'success');
    } else {
      alert(`Failed to save ${channel} configuration`);
    }
  } catch (error) {
    console.error(`Error saving ${channel} config:`, error);
    alert(`Error saving configuration: ${error.message}`);
  }
}

// Skip onboarding
async function skipOnboarding() {
  if (confirm('Skip the setup process? Otacon will use default settings and you can configure everything later in Settings.')) {
    try {
      // Save default configuration via IPC
      const defaultPermissions = {
        files: true,
        browser: true,
        terminal: false,
        notifications: true
      };
      
      await window.otaconAPI.updatePermissions(defaultPermissions);
      
      // Close onboarding
      if (window.opener) {
        window.opener.postMessage('onboarding-complete', '*');
        window.close();
      } else {
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      // Still proceed
      if (window.opener) {
        window.opener.postMessage('onboarding-complete', '*');
        window.close();
      } else {
        window.location.href = 'index.html';
      }
    }
  }
}

// Finish
async function finishOnboarding() {
  // Save final configuration
  try {
    // Ensure permissions are saved
    await window.otaconAPI.updatePermissions(permissions);
    
    // Mark setup as complete by creating the config file
    // The main process will detect this on next launch
    
    // Close onboarding window and open main app
    if (window.opener) {
      window.opener.postMessage('onboarding-complete', '*');
      window.close();
    } else {
      // If opened directly, redirect to main app
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error completing onboarding:', error);
    // Still proceed even if save fails
    if (window.opener) {
      window.opener.postMessage('onboarding-complete', '*');
      window.close();
    } else {
      window.location.href = 'index.html';
    }
  }
}

// Helper function for toast notifications
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function restartOnboarding() {
  currentStep = 1;
  showStep(1);
  updateProgress();
  
  // Clear stored data via IPC
  try {
    await window.otaconAPI.resetAllSettings();
    showToast('Configuration reset. Please complete setup.', 'info');
  } catch (error) {
    console.error('Error resetting config:', error);
  }
}

// Check if already completed
async function checkOnboardingStatus() {
  try {
    // Check if config exists via IPC
    const config = await window.otaconAPI.getConfig();
    if (config && config.meta) {
      // Config exists - show completion step
      currentStep = 5;
      showStep(5);
      updateProgress();
      
      // Update summary with actual config
      updateSummaryFromConfig(config);
    }
  } catch (error) {
    // No config yet - continue with onboarding
    console.log('No existing config found, continuing onboarding');
  }
}

// Update summary display from config
function updateSummaryFromConfig(config) {
  // Update AI provider
  const aiProvider = config.agents?.defaults?.model?.primary || 'Not configured';
  const aiEl = document.getElementById('summary-ai');
  if (aiEl) aiEl.textContent = aiProvider;
  
  // Update permissions
  const perms = config.agents?.defaults?.permissions || {};
  const enabledPerms = Object.entries(perms)
    .filter(([key, value]) => value)
    .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
    .join(', ');
  const permEl = document.getElementById('summary-permissions');
  if (permEl) permEl.textContent = enabledPerms || 'Default';
  
  // Update channels
  const channels = Object.keys(config.channels || {});
  const channelText = channels.length > 0 
    ? channels.join(', ') 
    : 'Web Interface only';
  const channelEl = document.getElementById('summary-channels');
  if (channelEl) channelEl.textContent = channelText;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
  init();
  await checkOnboardingStatus();
  
  // Close modal when clicking outside
  const modalOverlay = document.querySelector('.modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeChannelSetup);
  }
});
