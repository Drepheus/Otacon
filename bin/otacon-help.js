#!/usr/bin/env node

/**
 * Otacon Help Command
 * Shows help information
 */

import chalk from 'chalk';

console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════╗
║                    🤖 Otacon Help                         ║
╚══════════════════════════════════════════════════════════╝

📖 QUICK COMMANDS:

   otacon-start          Start Otacon AI Assistant
   otacon-stop           Stop Otacon
   otacon-help           Show this help message

🌐 WEB INTERFACE:

   Once started, open your browser:
   http://localhost:18789

⚙️  CONFIGURATION:

   Config file: ~/.openclaw/openclaw.json
   Workspace:   ~/.otacon/workspace

📚 DOCUMENTATION:

   Full docs:   https://otacon.ai/docs
   GitHub:      https://github.com/yourusername/otacon

💬 SUPPORT:

   Discord:     https://discord.gg/otacon
   Issues:      https://github.com/yourusername/otacon/issues

🔧 TROUBLESHOOTING:

   - Gateway not starting? Check if port 18789 is free
   - WebChat not loading? Try http://localhost:18789/webchat
   - Need to reset? Delete ~/.openclaw and run otacon-start again

🎉 GET STARTED:

   1. Run: otacon-start
   2. Open: http://localhost:18789
   3. Start chatting with your AI assistant!

`));
