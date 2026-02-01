# 🤖 Otacon

> **AI Assistant for Everyone** - The simplified, one-click installer for OpenClaw

Otacon makes it incredibly easy to run your own personal AI assistant locally. No command line knowledge required, no complex configuration - just download, install, and start chatting!

## ✨ Features

- **🎯 One-Click Install** - Get running in under 2 minutes
- **🌐 Web Interface** - Chat with your AI through a beautiful web UI
- **🔒 Privacy First** - Your data stays on your machine
- **🚀 Auto-Start** - Runs automatically when you log in
- **🐳 Docker Support** - Even simpler deployment option
- **⚡ Powered by OpenClaw** - All the power, none of the complexity
- **🖥️ Desktop Dashboard** - Beautiful Electron GUI for easy control
- **✅ Actually Works** - Fully functional implementation, not just a prototype

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** - [Download here](https://nodejs.org) (required)
- **npm** (comes with Node.js)

### Option 1: Desktop App (Recommended for Everyone)

**The easiest way to use Otacon - a beautiful GUI with one-click control!**

**First-Time Setup:**

```bash
# Clone the repository
git clone https://github.com/Drepheus/Otacon.git
cd Otacon

# Run the automated setup
# Windows:
setup.bat

# Mac/Linux:
chmod +x setup.sh
./setup.sh
```

**Start the Dashboard:**

```bash
cd dashboard
npm run dev
```

**The Setup Wizard Will:**
1. ✅ Check for Node.js 22+
2. ✅ Install all dependencies automatically
3. ✅ Launch the onboarding wizard
4. ✅ Guide you through AI setup, permissions, and channels

**Features of the Desktop App:**
- 🖱️ **One-click start/stop** - No terminal needed!
- 📊 **Real-time status** - See when Otacon is running
- ⚙️ **GUI settings** - Change configuration without editing files
- 🎨 **Modern dark UI** - Easy on the eyes
- 🔔 **System tray** - Minimize to tray and keep running
- 🆘 **Built-in help** - FAQ and troubleshooting right in the app
- 🧙 **Onboarding Wizard** - Step-by-step setup for AI, permissions, and channels

### Option 2: Docker (Simple for Tech Users)

```bash
docker-compose up -d
```

Then open `http://localhost:18789` in your browser.

### Option 3: Manual Setup (For Developers)

```bash
# 1. Install OpenClaw dependencies
cd openclaw
npm install
cd ..

# 2. Install Dashboard dependencies
cd dashboard
npm install

# 3. Start the dashboard
npm run dev
```

## 🎮 Usage

### Using the Desktop Dashboard

1. **Launch the app** - The onboarding wizard will appear on first run
2. **Configure AI** - Choose between OpenAI, Anthropic, OpenRouter, or Local models
3. **Set Permissions** - Control what Otacon can access (files, browser, terminal)
4. **Add Channels** (Optional) - Connect Slack, Discord, Telegram, WhatsApp
5. **Start Otacon** - Click the "Start Otacon" button
6. **Chat** - Click "Open Chat" or visit `http://localhost:18789`

### Full OpenClaw CLI Access (Optional)

**You have COMPLETE access to OpenClaw - it's the same installation!**

Otacon doesn't limit OpenClaw functionality. You can use all OpenClaw commands in three ways:

#### Option A: Through Dashboard Terminal
Click the **Terminal** tab in the dashboard and run any OpenClaw command:
```bash
openclaw --help                    # Show all commands
openclaw doctor                    # Run diagnostics
openclaw models                    # List AI models
openclaw skills list               # List installed skills
openclaw skills install <name>     # Install a skill
openclaw config                    # Show configuration
openclaw wizard                    # Run setup wizard
```

#### Option B: Global CLI (Add to PATH)
Add the `bin/` folder to your PATH for global access:

**Windows:**
```powershell
# Add to PATH (PowerShell as Admin)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Path\To\Otacon\bin", "User")
# Then you can run from anywhere:
otacon --help
```

**Mac/Linux:**
```bash
# Add to your ~/.bashrc or ~/.zshrc:
export PATH="$PATH:/path/to/Otacon/bin"
# Then you can run from anywhere:
otacon --help
```

#### Option C: Direct from OpenClaw folder
```bash
cd openclaw
node openclaw.mjs gateway --port 18789
node openclaw.mjs doctor
node openclaw.mjs --help
```

**All three methods give you 100% of OpenClaw's functionality!**
The dashboard is just a friendly GUI wrapper - the underlying OpenClaw is fully functional.

## 🔧 What Makes Otacon Different?

Otacon is a **wrapper and simplification layer** around [OpenClaw](https://github.com/openclaw/openclaw), which is a powerful but complex AI assistant framework.

### OpenClaw requires:
- ❌ Node.js 22+ installation knowledge
- ❌ npm/pnpm expertise
- ❌ CLI command familiarity
- ❌ Manual OAuth/API key setup
- ❌ Complex configuration files
- ❌ Multiple setup steps
- ❌ Understanding of gateway architecture

### Otacon provides:
- ✅ **Automated setup** - Just run `setup.bat` or `setup.sh`
- ✅ **Pre-configured defaults** - Works out of the box
- ✅ **Desktop GUI** - No terminal needed (but you can still use it!)
- ✅ **Full OpenClaw access** - Use ALL OpenClaw commands via terminal
- ✅ **One-click start/stop** - Simple controls
- ✅ **Setup Wizard** - Guided configuration
- ✅ **Real-time monitoring** - See status at a glance
- ✅ **System tray** - Runs in background

## 🏗️ Architecture

```
Otacon/
├── dashboard/           # Electron desktop app
│   ├── src/
│   │   ├── main.js      # Main process (starts OpenClaw)
│   │   ├── preload.js   # Bridge between main and UI
│   │   └── renderer/    # Frontend UI
│   │       ├── index.html      # Main dashboard
│   │       ├── app.js          # Dashboard logic
│   │       ├── onboarding.html # Setup wizard
│   │       ├── onboarding.js   # Wizard logic
│   │       └── styles.css      # UI styling
│   └── package.json
├── openclaw/            # OpenClaw AI engine (submodule)
│   ├── src/            # Source code
│   ├── openclaw.mjs    # CLI entry point
│   └── package.json
├── setup.bat           # Windows setup script
├── setup.sh            # Mac/Linux setup script
└── docker-compose.yml  # Docker deployment
```

## 🛠️ Configuration

Otacon saves configuration to `~/.openclaw/clawdbot.json`:

```json
{
  "agents": {
    "defaults": {
      "model": { "primary": "openai/gpt-4o-mini" },
      "workspace": "/Users/username/clawd"
    }
  },
  "gateway": {
    "port": 18789,
    "auth": { "token": "your-auth-token" }
  },
  "channels": {
    "discord": { "enabled": true, "token": "..." },
    "telegram": { "enabled": true, "botToken": "..." }
  }
}
```

### Manual Configuration

You can also edit the config directly:

```bash
# Open config folder
# Via Dashboard: Settings → Open Config Folder
# Via command line:
open ~/.openclaw  # Mac
explorer %USERPROFILE%\.openclaw  # Windows
```

## 🐳 Docker Deployment

For the simplest possible server deployment:

```bash
# Clone the repo
git clone https://github.com/Drepheus/Otacon.git
cd Otacon

# Start with Docker
docker-compose up -d

# Access the web interface
open http://localhost:18789  # Mac
start http://localhost:18789  # Windows
```

## 📦 What's Included?

- **Otacon Dashboard:** Beautiful Electron GUI for controlling OpenClaw
- **OpenClaw Engine:** The powerful AI assistant (automatically installed)
- **Onboarding Wizard:** Step-by-step guided setup
- **Web Interface:** Chat with your AI at `localhost:18789`
- **Auto-Configuration:** Sensible defaults that just work
- **System Tray:** Minimize and run in background

## 🆘 Troubleshooting

### Common Issues

**"Node.js not found"**
- Download and install Node.js 22+ from https://nodejs.org
- Restart your terminal after installation

**"Port already in use"**
- Otacon uses port 18789 by default
- Change it in Dashboard: Settings → Port Number
- Or edit `~/.openclaw/clawdbot.json` manually

**"Can't connect to AI"**
- Check your API key in the onboarding wizard
- Verify you have credits/billing set up with your AI provider
- Check the dashboard logs in the Terminal tab

**"Installation fails"**
- Make sure you have internet access
- Try running `npm install` manually in the `openclaw/` folder
- Check that Node.js 22+ is installed: `node --version`

**"Dashboard won't start"**
- Make sure you're in the `dashboard/` folder
- Try `npm install` first to install dependencies
- Check for errors: `npm run dev`

### Getting Help

- **Documentation:** See `docs/` folder
- **Developer Guide:** See `dashboard/DEVELOPER.md`
- **Issues:** https://github.com/Drepheus/Otacon/issues

## 🏗️ Building Installers

To create standalone installers for distribution:

```bash
cd dashboard

# Build for current platform
npm run build

# Build for specific platforms
npm run build:win    # Windows .exe installer
npm run build:mac    # Mac .dmg
npm run build:linux  # Linux AppImage
```

Installers will be in `dashboard/dist/`.

## 🛣️ Roadmap

- [x] **Desktop Dashboard** - Electron app with GUI
- [x] **Onboarding Wizard** - Step-by-step setup
- [x] **Real OpenClaw Integration** - Actually starts/stops the engine
- [x] **Configuration Management** - Saves to real config files
- [x] **Setup Scripts** - Automated dependency installation
- [ ] **Auto-Update** - Automatic app updates
- [ ] **Built-in Chat** - Embed chat interface in dashboard
- [ ] **Activity Stats** - Show messages, tokens, usage
- [ ] **Plugin Manager** - GUI for installing skills

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

Otacon is MIT licensed, just like OpenClaw. See [LICENSE](LICENSE)

## 🙏 Acknowledgments

- Built on top of [OpenClaw](https://github.com/openclaw/openclaw) - The amazing open-source AI assistant
- Thanks to the OpenClaw team for creating such a powerful platform

---

<div align="center">
  <strong>🤖 Otacon - AI for Everyone</strong>
  <br>
  <sub>Made with ❤️ by the Otacon Team</sub>
</div>
