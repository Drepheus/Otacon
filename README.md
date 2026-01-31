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

## 🚀 Quick Start

### Option 1: Desktop App (Recommended for Everyone)

**The easiest way to use Otacon - a beautiful GUI with one-click control!**

**Windows:**
1. Download `Otacon-Setup.exe` from [releases](https://github.com/yourusername/otacon/releases)
2. Double-click to install
3. Launch Otacon from your Start Menu or Desktop
4. Click **"Start Otacon"** in the app
5. Click **"Open Chat"** to start talking to your AI!

**Mac:**
1. Download `Otacon.dmg` from [releases](https://github.com/yourusername/otacon/releases)
2. Open the DMG and drag Otacon to Applications
3. Launch Otacon from your Applications folder
4. Click **"Start Otacon"** in the app
5. Click **"Open Chat"** to start talking to your AI!

**Linux:**
1. Download `Otacon.AppImage` from [releases](https://github.com/yourusername/otacon/releases)
2. Right-click → Properties → Allow executing as program
3. Double-click to launch
4. Click **"Start Otacon"**

**Features of the Desktop App:**
- 🖱️ **One-click start/stop** - No terminal needed!
- 📊 **Real-time status** - See when Otacon is running
- ⚙️ **GUI settings** - Change configuration without editing files
- 🎨 **Modern dark UI** - Easy on the eyes
- 🔔 **System tray** - Minimize to tray and keep running
- 🆘 **Built-in help** - FAQ and troubleshooting right in the app

### Option 2: Docker (Simple for Tech Users)

```bash
docker-compose up -d
```

Then open `http://localhost:18789` in your browser.

### Option 3: Command Line (For Developers)

```bash
npm install -g otacon
otacon-start
```

Then open `http://localhost:18789`

## 🎮 Usage

Once installed, you have three simple commands:

```bash
otacon-start    # Start your AI assistant
otacon-stop     # Stop the assistant  
otacon-help     # Show help
```

Or simply open `http://localhost:18789` in your browser.

## 🔧 What Makes Otacon Different?

Otacon is a **wrapper and simplification layer** around [OpenClaw](https://github.com/openclaw/openclaw), which is a powerful but complex AI assistant framework.

### OpenClaw requires:
- ✅ Node.js 22+ installation
- ✅ npm/pnpm knowledge
- ✅ CLI command familiarity
- ✅ OAuth/API key setup
- ✅ Complex configuration files
- ✅ Multiple setup steps

### Otacon provides:
- ✅ Automatic dependency installation
- ✅ Pre-configured defaults
- ✅ Desktop shortcuts
- ✅ One-click start/stop
- ✅ Simple web interface
- ✅ Auto-start on login

## 🛠️ Configuration

Otacon works out of the box with sensible defaults. If you want to customize:

**Config file:** `~/.openclaw/openclaw.json`

**Workspace:** `~/.otacon/workspace/`

## 🐳 Docker Deployment

For the simplest possible setup:

```bash
# Clone the repo
git clone https://github.com/yourusername/otacon.git
cd otacon

# Start with Docker
docker-compose up -d

# Access the web interface
open http://localhost:18789
```

## 📦 What's Included?

- **Otacon Core:** Simplified configuration and wrapper scripts
- **OpenClaw Engine:** The powerful AI assistant (automatically installed)
- **Web Interface:** Beautiful chat interface at `localhost:18789`
- **Auto-Configuration:** Sensible defaults that just work

## 🆘 Troubleshooting

**Port already in use?**
Otacon uses port 18789. If it's busy, the installer will prompt you to change it.

**Can't connect?**
Make sure Otacon is running: `otacon-start`

**Need to reset?**
Delete `~/.openclaw/` folder and run the installer again.

**More help:**
- Docs: https://otacon.ai/docs
- Issues: https://github.com/yourusername/otacon/issues

## 🏗️ Building from Source

If you want to modify Otacon:

```bash
git clone https://github.com/yourusername/otacon.git
cd otacon
npm install
npm run build
npm run installer:build
```

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
