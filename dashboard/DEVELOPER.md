# Otacon Dashboard Developer Guide

This guide explains how to build, customize, and package the Otacon Desktop Dashboard.

## 🎯 What is the Dashboard?

The Otacon Dashboard is an **Electron-based desktop application** that provides a graphical interface for non-technical users to:

- Start/stop the Otacon AI assistant with one click
- Monitor the status in real-time
- Access the chat interface
- Configure settings through a GUI
- Get help and troubleshooting

## 📁 Dashboard Structure

```
dashboard/
├── package.json              # Dashboard dependencies
├── src/
│   ├── main.js               # Electron main process
│   ├── preload.js            # Bridge between main and renderer
│   └── renderer/             # Frontend UI
│       ├── index.html        # Main UI
│       ├── styles.css        # Styling
│       └── app.js            # Frontend logic
└── dist/                     # Built app (generated)
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js 22+** installed
2. **npm** or **yarn**

### Development

```bash
# Navigate to dashboard folder
cd dashboard

# Install dependencies
npm install

# Run in development mode
npm run dev
```

This will open the dashboard window with DevTools enabled.

## 📦 Building Installers

### Build for Current Platform

```bash
cd dashboard
npm run build
```

This creates installers in `dashboard/dist/`.

### Build for Specific Platforms

```bash
# Windows
npm run build:win

# macOS  
npm run build:mac

# Linux
npm run build:linux
```

### Build All Platforms

```bash
# From root folder
npm run dashboard:build
```

## 🎨 Customizing the Dashboard

### Changing Colors

Edit `dashboard/src/renderer/styles.css`:

```css
:root {
  --primary-color: #6366f1;      /* Change this */
  --success-color: #22c55e;      /* Status indicators */
  --bg-primary: #0f172a;         /* Dark background */
  /* ... more variables */
}
```

### Changing the Logo

1. Replace `assets/otacon-icon.png` (tray icon)
2. Replace `assets/otacon-icon.png` (main icon, 512x512)
3. Rebuild: `npm run build`

### Adding New Features

1. **Add new page**: Edit `dashboard/src/renderer/index.html`
   ```html
   <div id="new-page" class="page">
     <!-- Your content -->
   </div>
   ```

2. **Add navigation**: Add to sidebar nav
   ```html
   <a href="#" class="nav-item" data-page="new">
     <i class="fas fa-icon"></i>
     <span>New Page</span>
   </a>
   ```

3. **Handle in JS**: Edit `dashboard/src/renderer/app.js`
   ```javascript
   function handleNewPageFeature() {
     // Your logic
   }
   ```

## 🔧 Main Process API

The `main.js` handles:

### Starting/Stopping Otacon
```javascript
// Called when user clicks Start
ipcMain.handle('start-otacon', () => {
  // 1. Check Node.js
  // 2. Check/install OpenClaw
  // 3. Launch gateway
});

// Called when user clicks Stop
ipcMain.handle('stop-otacon', () => {
  // Kill the process
});
```

### Status Updates
```javascript
// Send updates to UI
mainWindow.webContents.send('status-update', {
  status: 'running',  // running, stopped, starting, error
  message: 'Otacon is ready!',
  port: 18789
});
```

## 🎨 UI Components

### Buttons
```html
<button class="btn btn-primary">
  <i class="fas fa-play"></i>
  Start Otacon
</button>
```

### Cards
```html
<div class="card">
  <h3>Card Title</h3>
  <!-- Content -->
</div>
```

### Status Badge
```html
<div class="status-badge">
  <span class="status-dot running"></span>
  <span class="status-text">Running</span>
</div>
```

## 🐛 Debugging

### Enable DevTools

In `main.js`, when creating window:
```javascript
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

Or run with flag:
```bash
npm run dev
```

### View Logs

Main process logs appear in terminal.
Renderer logs: Open DevTools (F12) → Console tab.

### Common Issues

**White screen after build?**
- Check that all assets are in the `files` array in package.json
- Verify paths are correct for production

**Can't communicate with main process?**
- Check that preload.js is exposing the API correctly
- Verify IPC channel names match

**Icon not showing?**
- Ensure icon files exist in `assets/`
- Use .png for development, .icns (Mac) or .ico (Win) for production

## 📱 Platform-Specific Notes

### Windows
- Uses NSIS for installer
- Creates Start Menu shortcuts
- Adds to system tray

### macOS  
- Creates .app bundle
- Can be signed with developer certificate
- Uses native menu bar

### Linux
- Creates AppImage
- Works on most distributions
- Uses system tray

## 🔄 Auto-Update

To add auto-update functionality:

1. Install `electron-updater`:
```bash
npm install electron-updater
```

2. In `main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

// Check for updates
autoUpdater.checkForUpdatesAndNotify();
```

3. Host releases on GitHub or your server

## 📦 Distribution

### GitHub Releases

1. Build for all platforms
2. Create GitHub release
3. Upload `dist/*.exe`, `dist/*.dmg`, `dist/*.AppImage`

### Website Distribution

Host installers on your domain:
- `otacon.ai/download/windows`
- `otacon.ai/download/mac`
- `otacon.ai/download/linux`

### Package Managers

Consider publishing to:
- **Homebrew** (Mac): `brew install otacon`
- **Chocolatey** (Windows): `choco install otacon`
- **Snap** (Linux): `snap install otacon`

## 🎯 User Flow

1. **First Launch**:
   - Dashboard opens
   - Shows "Otacon is Ready"
   - User clicks "Start Otacon"

2. **If Node.js Missing**:
   - Shows modal
   - Opens download page
   - Waits for install

3. **Starting**:
   - Shows progress bar
   - Installs OpenClaw if needed
   - Launches gateway

4. **Running**:
   - Status changes to "Running"
   - "Open Chat" button appears
   - User can chat with AI

5. **System Tray**:
   - Dashboard minimizes to tray
   - Right-click for quick actions
   - Click icon to restore

## 🚀 Advanced Features to Add

### 1. Model Selection UI
```javascript
// Add dropdown to settings
<select id="model-select">
  <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
  <option value="gpt-4o">GPT-4o (Smart)</option>
  <option value="claude-sonnet">Claude Sonnet</option>
</select>
```

### 2. Built-in Chat Interface
Instead of opening browser, embed WebChat directly:
```html
<iframe src="http://localhost:18789/webchat" id="chat-frame"></iframe>
```

### 3. Activity Monitor
Show real-time stats:
- Messages sent/received
- Tokens used
- Active time

### 4. Plugin Manager
GUI for installing skills:
- Browse available skills
- One-click install
- Enable/disable

## 📝 Code Style

### JavaScript
- Use modern ES6+ features
- Async/await for async operations
- Descriptive variable names

### CSS
- Use CSS custom properties (variables)
- BEM naming convention
- Mobile-first responsive design

### HTML
- Semantic elements
- Accessible (ARIA labels)
- Clean structure

## 🧪 Testing

### Manual Testing Checklist

- [ ] App launches without errors
- [ ] Start button works
- [ ] Stop button works
- [ ] Status updates correctly
- [ ] Web interface opens
- [ ] Settings save/load
- [ ] Tray icon works
- [ ] Multiple instances prevented
- [ ] Updates show correctly
- [ ] All pages accessible

### Automated Testing

Consider adding:
```bash
npm install --save-dev jest spectron
```

## 🆘 Getting Help

- **Electron docs**: https://www.electronjs.org/docs
- **Otacon Discord**: https://discord.gg/otacon
- **GitHub Issues**: https://github.com/yourusername/otacon/issues

## 📄 License

Dashboard is MIT licensed, same as Otacon and OpenClaw.
