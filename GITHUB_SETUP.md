# Pushing Otacon to GitHub

This guide will help you push the Otacon project to your GitHub repository at `https://github.com/Drepheus/Otacon.git`

## Option 1: Automated Setup (Easiest)

### On Windows:
1. Open Command Prompt or PowerShell
2. Navigate to your Otacon folder:
   ```cmd
   cd "C:\Users\ajgre\OneDrive\Desktop\Otacon"
   ```
3. Run the setup script:
   ```cmd
   setup-git.bat
   ```

### On Mac/Linux:
1. Open Terminal
2. Navigate to your Otacon folder:
   ```bash
   cd "/Users/YOURNAME/Desktop/Otacon"
   ```
3. Make the script executable and run it:
   ```bash
   chmod +x setup-git.sh
   ./setup-git.sh
   ```

## Option 2: Manual Setup

If the automated script doesn't work, follow these steps:

### Step 1: Open Terminal/Command Prompt

Navigate to your Otacon folder:
```bash
cd "C:\Users\ajgre\OneDrive\Desktop\Otacon"
```

### Step 2: Initialize Git

```bash
git init
```

### Step 3: Configure Git (if not already done)

```bash
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Step 4: Add Remote Repository

```bash
git remote add origin https://github.com/Drepheus/Otacon.git
```

### Step 5: Add All Files

```bash
git add .
```

### Step 6: Commit

```bash
git commit -m "Initial commit: Otacon - Simplified AI Assistant"
```

### Step 7: Push to GitHub

```bash
git push -u origin main
```

If `main` doesn't work, try:
```bash
git push -u origin master
```

## Authentication

When pushing, you'll be asked for:
- **Username**: Your GitHub username (Drepheus)
- **Password**: Use a **Personal Access Token** (not your GitHub password)

### Creating a Personal Access Token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "Otacon Repo"
4. Check these permissions:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. Copy the token (you'll only see it once!)
7. Use this token as your password when pushing

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Login to GitHub
gh auth login

# Push to your repo
gh repo create Drepheus/Otacon --public --source=. --remote=origin --push
```

## After Pushing

Once pushed successfully:

1. **Visit your repo**: https://github.com/Drepheus/Otacon
2. **Verify files are there**: Check that all folders (dashboard, docs, website, etc.) are present
3. **Enable GitHub Pages** (optional):
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Your website will be at: https://drepheus.github.io/Otacon/

## Troubleshooting

### "Permission denied"
- Make sure you're using a Personal Access Token, not your GitHub password
- Or use SSH keys instead of HTTPS

### "Repository not found"
- Make sure the repo `Drepheus/Otacon` exists on GitHub
- If not, create it first at https://github.com/new

### "Updates were rejected"
```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

### "Could not resolve host"
- Check your internet connection
- Try: `git config --global --unset http.proxy`

## What's in Your Repo?

After pushing, your GitHub repo will contain:

```
Otacon/
├── README.md                 # Project overview
├── QUICKSTART.md             # Quick start guide
├── LICENSE                   # MIT License
├── package.json              # Main package config
├── .gitignore                # Git ignore rules
├── bin/                      # CLI commands
├── dashboard/                # ELECTRON DESKTOP APP
│   ├── src/
│   │   ├── main.js           # Electron backend
│   │   └── renderer/         # Frontend UI
│   │       ├── index.html
│   │       ├── styles.css    # Black & white theme
│   │       └── app.js
│   └── package.json
├── docs/                     # Documentation
│   └── USER_GUIDE.md
├── website/                  # LANDING PAGE
│   └── index.html
├── scripts/                  # Build scripts
├── docker/                   # Docker setup
├── installer/                # Setup scripts
└── openclaw/                 # Original OpenClaw source
```

## Next Steps

After pushing to GitHub:

1. ✅ **Verify**: Visit https://github.com/Drepheus/Otacon
2. 🏷️ **Create a release**: Tag v1.0.0 and add release notes
3. 📦 **Build installers**: Run build scripts and attach to release
4. 🌐 **Deploy website**: Enable GitHub Pages or deploy to otacon.ai
5. 📣 **Share**: Post on Product Hunt, Reddit, Twitter, etc.

## Need Help?

- Git documentation: https://git-scm.com/doc
- GitHub docs: https://docs.github.com
- Otacon Discord: https://discord.gg/otacon

---

**Good luck! 🚀**
