# Otacon User Documentation

Complete guide for using Otacon - Your Personal AI Assistant

## Table of Contents

1. [Getting Started](#getting-started)
2. [Using the Desktop App](#using-the-desktop-app)
3. [Chatting with Your AI](#chatting-with-your-ai)
4. [Configuration](#configuration)
5. [Advanced Features](#advanced-features)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Getting Started

### What is Otacon?

Otacon is a **personal AI assistant** that runs on your own computer. Unlike cloud-based AI services, Otacon keeps your data local and private while still giving you access to powerful AI capabilities.

### Key Features

- **100% Private** - Your data never leaves your computer
- **One-Click Start** - No technical knowledge required
- **Always Available** - Runs in the background, ready when you need it
- **Multiple AI Models** - Choose from GPT-4, Claude, or free alternatives
- **Web Browser** - Let the AI browse websites for you
- **File Management** - Work with documents and files
- **Automation** - Set up tasks to run automatically

### System Requirements

**Minimum:**
- Windows 10/11, macOS 10.15+, or Linux
- 4GB RAM
- 500MB free disk space
- Internet connection (for AI service)

**Recommended:**
- 8GB+ RAM
- SSD storage
- Stable internet connection

---

## Using the Desktop App

### First Launch

When you open Otacon for the first time:

1. **Dashboard appears** - A sleek black and white interface
2. **Click "Start Otacon"** - The AI engine starts up
3. **Wait for setup** - First time installs necessary components (30-60 seconds)
4. **Status shows "Running"** - You're ready to go!

### Main Interface

The dashboard has 4 sections in the sidebar:

#### Dashboard
- See Otacon's current status
- Start/Stop the AI engine
- View quick statistics
- See feature highlights

#### Chat
- Quick access to the chat interface
- Opens your web browser
- Or use the built-in "Open Chat" button

#### Settings
- Configure AI model
- Change port number
- Enable auto-start
- Open configuration folder
- Reset to defaults

#### Help
- FAQ section
- Links to documentation
- Community Discord
- GitHub repository
- Troubleshooting guide

### System Tray

Otacon runs in your system tray (near the clock):

- **Click icon** - Show/hide the dashboard
- **Right-click** - Quick menu:
  - Start/Stop Otacon
  - Open Web Chat
  - Quit

---

## Chatting with Your AI

### Opening the Chat

**Method 1 - From Dashboard:**
1. Make sure Otacon is running
2. Click "Open Chat" button
3. Your browser opens automatically

**Method 2 - Direct URL:**
Open your browser and go to:
```
http://localhost:18789
```

### Starting a Conversation

Simply type your message and press Enter. The AI will respond naturally.

**Example conversations:**

```
You: Hello! Can you help me write an email to my team about the project deadline?

AI: Of course! Here's a draft email:

Subject: Project Deadline Update

Hi Team,

I wanted to provide an update on our project timeline...
[Continues with full email draft]
```

### Chat Commands

Special commands you can use:

- `/status` - Check Otacon's status
- `/new` - Start a fresh conversation
- `/reset` - Reset the AI's memory
- `/compact` - Summarize the conversation
- `/think low|medium|high` - Adjust AI reasoning level

### Tips for Better Conversations

1. **Be Specific** - "Write a professional email" vs "Write an email"
2. **Provide Context** - "For a SaaS startup targeting developers..."
3. **Break Down Tasks** - Ask for one thing at a time
4. **Use Examples** - "Like this: [example]"
5. **Iterate** - Refine the AI's responses

---

## Configuration

### Setting Up AI Access

Otacon needs an AI service to work. You have several options:

#### Option 1: OpenAI (Recommended for Beginners)

1. Visit https://platform.openai.com
2. Create an account
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key
6. In Otacon Settings, paste the key

**Pricing:** Pay-per-use, typically $0.01-0.10 per conversation

#### Option 2: OpenRouter (Free Options Available)

1. Visit https://openrouter.ai
2. Create account
3. Get API key
4. Configure in Otacon:
   - Model: `openrouter/auto`
   - API Key: Your key

**Pricing:** Many free models available, paid models are cheap

#### Option 3: Anthropic Claude (Most Powerful)

1. Visit https://console.anthropic.com
2. Apply for API access
3. Get API key
4. Configure in Otacon:
   - Model: `anthropic/claude-sonnet-4-5`
   - API Key: Your key

**Pricing:** Higher cost, but best quality

### Changing Settings

**Via Desktop App:**
1. Open Otacon Dashboard
2. Click "Settings" in sidebar
3. Modify options
4. Restart Otacon to apply

**Via Config File:**
Edit `~/.openclaw/openclaw.json`:

```json
{
  "agent": {
    "model": "openai/gpt-4o-mini",
    "workspace": "/path/to/workspace"
  },
  "gateway": {
    "port": 18789,
    "bind": "localhost"
  },
  "channels": {
    "webchat": {
      "enabled": true
    }
  }
}
```

### Common Configuration Options

**Change the Port:**
If port 18789 is already in use:

```json
{
  "gateway": {
    "port": 18000
  }
}
```

**Enable Auto-Start:**
Make Otacon start automatically when you log in:

```json
{
  "otacon": {
    "autoStart": true
  }
}
```

**Change AI Model:**
Switch between different AI providers:

```json
{
  "agent": {
    "model": "openai/gpt-4o"
  }
}
```

Available models:
- `openai/gpt-4o-mini` - Fast & cheap
- `openai/gpt-4o` - Smart but slower
- `anthropic/claude-sonnet-4-5` - Best quality
- `openrouter/auto` - Automatic selection

---

## Advanced Features

### Browser Automation

Otacon can browse websites for you:

```
You: Check the weather in New York and tell me if I need an umbrella

AI: [Opens weather website, checks forecast]
The forecast shows rain this afternoon. You should bring an umbrella!
```

### File Operations

Work with files on your computer:

```
You: Read my project notes from ~/Documents/notes.txt and summarize them

AI: [Reads file]
Here's a summary of your notes:
- Project deadline is next Friday
- Need to finish the dashboard component
- Client requested blue color scheme
```

### Cron Jobs (Automation)

Set up automated tasks:

```bash
# In Otacon workspace, create a cron job
otacon cron add "0 9 * * 1" "weekly-report"
```

This runs every Monday at 9 AM.

### Custom Skills

Teach Otacon new abilities:

1. Create a skill file in `~/.otacon/workspace/skills/`
2. Define what the skill does
3. Otacon automatically learns it

Example skill for code review:
```markdown
# Code Review Skill

When given code, check for:
- Security vulnerabilities
- Performance issues
- Best practices
- Potential bugs
```

---

## Troubleshooting

### Otacon Won't Start

**Problem:** Clicking "Start Otacon" does nothing

**Solutions:**
1. Check your internet connection (first-time setup requires it)
2. Restart the Otacon app
3. Check if Node.js is installed:
   - Open terminal/command prompt
   - Type: `node --version`
   - Should show v22.x.x or higher
4. If Node.js is missing, download from https://nodejs.org

### "Port Already in Use" Error

**Problem:** Port 18789 is being used by another program

**Solutions:**
1. Change the port in Settings:
   - Open Otacon Dashboard
   - Go to Settings
   - Change port to 18000 (or any number 1024-65535)
   - Restart Otacon

2. Or find and close the other program using the port

### Chat Interface Won't Load

**Problem:** Browser shows "This site can't be reached"

**Solutions:**
1. Make sure Otacon shows "Running" in the dashboard
2. Check if you're using the correct port
3. Try refreshing the browser page
4. Check your firewall settings (allow localhost:18789)

### AI Not Responding

**Problem:** Messages send but no response

**Solutions:**
1. Check your API key is valid:
   - Go to Settings
   - Verify the API key is entered correctly
2. Check if you have credits:
   - Log into your AI provider account
   - Check billing/credits section
3. Try a different AI model

### Slow Performance

**Problem:** Otacon is slow or laggy

**Solutions:**
1. Use a faster AI model (GPT-4o-mini vs GPT-4o)
2. Reduce conversation history:
   - Use `/compact` command
   - Or start a new chat with `/new`
3. Close unused browser tabs
4. Check your internet connection speed

### Can't Install on Mac

**Problem:** "Otacon can't be opened" error

**Solutions:**
1. Right-click the app
2. Click "Open"
3. Click "Open" in the security dialog
4. Or go to System Preferences → Security & Privacy → Allow

### Windows Defender Warning

**Problem:** Windows shows security warning

**Solution:**
1. Click "More info"
2. Click "Run anyway"
3. This is normal for new apps without Microsoft signatures

---

## FAQ

**Q: Is Otacon free?**
A: Otacon itself is 100% free and open-source. However, the AI services (OpenAI, Claude) charge for usage. You can use free alternatives through OpenRouter.

**Q: Is my data private?**
A: Yes! Otacon runs entirely on your computer. Your conversations are stored locally in `~/.otacon/`. The only data sent to the internet is your messages to the AI service.

**Q: Can I use Otacon offline?**
A: No, you need an internet connection to communicate with AI services. However, your chat history and settings are stored locally.

**Q: What's the difference between Otacon and ChatGPT?**
A: ChatGPT is a web service. Otacon is software that runs on your computer and can use ChatGPT (or other AI) as an engine. Otacon adds privacy, automation, and local control.

**Q: Can I use my own AI model?**
A: Yes! You can use local models through Ollama or LM Studio. Configure them in the settings.

**Q: How do I update Otacon?**
A: The desktop app will notify you when updates are available. Click "Update" to install. Or download the latest version from GitHub.

**Q: Does Otacon work on my phone?**
A: Not directly. Otacon runs on your computer. But you can access the web chat from your phone's browser if you're on the same WiFi network.

**Q: Can multiple people use Otacon?**
A: Yes, but they all share the same AI and settings. For separate instances, each person should install Otacon on their own computer.

**Q: What languages does Otacon support?**
A: Otacon can chat in any language the AI model supports. Most support 50+ languages including English, Spanish, French, German, Chinese, Japanese, and more.

**Q: How do I backup my data?**
A: Copy these folders:
- `~/.openclaw/` - Configuration
- `~/.otacon/workspace/` - Conversations and files

**Q: Is there a mobile app?**
A: Not yet, but it's planned! For now, use the web chat on your phone's browser.

---

## Getting Help

### Community

- **Discord:** https://discord.gg/otacon
- **GitHub Issues:** https://github.com/yourusername/otacon/issues
- **Documentation:** https://otacon.ai/docs

### Report a Bug

1. Open GitHub Issues
2. Click "New Issue"
3. Use the bug report template
4. Include:
   - Your operating system
   - Otacon version
   - Steps to reproduce
   - Screenshots if helpful

### Request a Feature

1. Open GitHub Issues
2. Click "New Issue"
3. Select "Feature Request"
4. Describe what you'd like to see

---

## Tips & Tricks

### Keyboard Shortcuts

- `Ctrl/Cmd + Shift + O` - Open Otacon (when running in tray)
- `Ctrl/Cmd + N` - New conversation
- `Ctrl/Cmd + Shift + S` - Open Settings

### Power User Mode

Access the underlying OpenClaw CLI:
```bash
openclaw --help
```

This gives you access to advanced features.

### Multiple Workspaces

Create separate workspaces for different projects:
```bash
mkdir ~/work-project
otacon --workspace ~/work-project
```

### Integration with Other Apps

Use Otacon's webhook feature to integrate with:
- Slack
- Discord
- Zapier
- Custom apps

---

**Enjoy your AI assistant! 🤖✨**
