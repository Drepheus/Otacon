# 🚀 Otacon Quick Start Guide

Get your AI assistant running in 5 minutes!

## 📋 Prerequisites

- Windows 10/11, macOS 10.15+, or Linux
- Internet connection (for first-time setup)
- 500MB free disk space

## 🎯 Option 1: Desktop App (Easiest)

### Step 1: Download
1. Go to [GitHub Releases](https://github.com/yourusername/otacon/releases)
2. Download the installer for your platform:
   - Windows: `Otacon-Setup.exe`
   - Mac: `Otacon.dmg`
   - Linux: `Otacon.AppImage`

### Step 2: Install
- **Windows**: Run the .exe and follow the wizard
- **Mac**: Open DMG, drag to Applications
- **Linux**: Make the AppImage executable: `chmod +x Otacon.AppImage`

### Step 3: Launch
- Find Otacon in your Start Menu/Applications
- Open it!

### Step 4: Start Otacon
1. You'll see the Dashboard with a big **"Start Otacon"** button
2. Click it!
3. Wait 30-60 seconds for first-time setup (installs Node.js and OpenClaw automatically)
4. When status shows "Running", click **"Open Chat"**

### Step 5: Chat!
- Your browser opens to the chat interface
- Start typing messages to your AI assistant
- Ask it to help with tasks, answer questions, or automate things

**That's it!** 🎉

---

## 🐳 Option 2: Docker (For Developers)

If you already have Docker installed:

```bash
# Clone the repository
git clone https://github.com/yourusername/otacon.git
cd otacon

# Start Otacon
docker-compose up -d

# Open in browser
open http://localhost:18789  # Mac
start http://localhost:18789 # Windows
xdg-open http://localhost:18789 # Linux
```

Done! Your AI assistant is running.

---

## 💻 Option 3: Build from Source (For Developers)

Want to customize or contribute?

### Prerequisites
- Node.js 22 or higher
- npm or pnpm
- Git

### Build & Run

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/otacon.git
cd otacon

# 2. Install dependencies
npm install

# 3. Build the dashboard (optional, for GUI)
cd dashboard
npm install
npm run build

# 4. Go back to root
cd ..

# 5. Start Otacon (CLI mode)
npm start

# OR: Start the Desktop Dashboard
cd dashboard
npm start
```

---

## 🎮 Using Otacon

### Desktop App
- **Start**: Click the "Start Otacon" button
- **Stop**: Click the "Stop Otacon" button
- **Chat**: Click "Open Chat" or visit `http://localhost:18789`
- **Settings**: Click the Settings tab in the sidebar
- **Help**: Click the Help tab for FAQ

### Command Line
```bash
# Start
otacon-start

# Stop
otacon-stop

# Get help
otacon-help
```

### Chat Commands
Once in the chat interface, you can:
- **Chat naturally**: Just type messages
- **Use commands**:
  - `/status` - Check Otacon status
  - `/new` - Start a new conversation
  - `/reset` - Reset the AI session
  - `/think high` - Use more AI reasoning power

---

## ⚙️ First-Time Configuration

### Setting Up AI Access

Otacon needs an AI provider to work. You have options:

**Option A: OpenAI (Recommended for beginners)**
1. Go to https://platform.openai.com
2. Create an account
3. Get an API key
4. In Otacon Settings, add your API key

**Option B: Free/Open Models**
- Otacon can work with free models through OpenRouter
- Configure in the Settings tab

**Option C: Anthropic Claude (Most powerful)**
1. Go to https://console.anthropic.com
2. Get API key
3. Configure in Settings

### Changing the Port

If port 18789 is already in use:

**Desktop App:**
1. Go to Settings tab
2. Change the port number
3. Restart Otacon

**Config file:**
Edit `~/.openclaw/openclaw.json`:
```json
{
  "gateway": {
    "port": 18000
  }
}
```

---

## 🆘 Troubleshooting

### "Node.js Required" Message
- The Desktop App will offer to download it for you
- Or download manually from https://nodejs.org (get v22 LTS)
- Restart Otacon after installing

### "Port Already in Use"
- Change the port in Settings
- Or close whatever is using port 18789

### "Otacon Won't Start"
1. Check your internet connection (first-time setup needs it)
2. Try restarting the app
3. Check the logs in Settings → Open Config Folder
4. Ask for help on Discord!

### Chat Interface Not Loading
- Make sure Otacon shows as "Running"
- Try refreshing your browser
- Check if the port is correct

---

## 🎓 Next Steps

### Learn More
- 📖 Read the full documentation: https://otacon.ai/docs
- 💬 Join our Discord: https://discord.gg/otacon
- 🐦 Follow us on Twitter: @otaconai

### Customize
- Change the AI model in Settings
- Add custom skills (advanced)
- Configure auto-start behavior
- Set up multiple AI profiles

### Build
Want to contribute or customize?
- See `dashboard/DEVELOPER.md` for the GUI
- See `README.md` for architecture details
- Fork the repo and make it your own!

---

## 💡 Tips for Non-Technical Users

**What is Otacon?**
Think of it like having a super-smart assistant living on your computer. You can ask it questions, have it help write emails, summarize documents, or even browse websites for you.

**Is it safe?**
Yes! Otacon runs entirely on your computer. Your conversations stay private. The only thing sent to the internet is your messages to the AI service (like ChatGPT).

**Does it cost money?**
- Otacon itself is free and open-source
- The AI service might cost money (OpenAI charges per usage)
- But you can use free models too!

**Can I turn it off?**
Absolutely! Just click "Stop Otacon" or close the app. It's not always listening unless you tell it to be.

---

## 🎉 You're All Set!

Enjoy your personal AI assistant! 

If you have questions, check the Help tab in the Desktop App or visit our documentation.

Happy chatting! 🤖✨
