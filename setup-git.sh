#!/bin/bash

# Setup script to initialize Otacon repo and push to GitHub
# Run this in your Otacon folder

echo "🚀 Setting up Otacon Git Repository"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from Otacon root directory"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed"
    echo "   Please install Git first: https://git-scm.com/downloads"
    exit 1
fi

# Initialize git repo if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
else
    echo "📦 Git repository already initialized"
fi

# Add the remote repository
echo "🔗 Adding remote repository..."
git remote add origin https://github.com/Drepheus/Otacon.git 2>/dev/null || echo "   Remote already exists"

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
*.exe
*.dmg
*.pkg
*.msi
*.AppImage

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output/

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Docker
.docker/
docker-compose.override.yml

# Config (user-specific)
config/local.json

# Temporary
tmp/
temp/
*.tmp

# Dashboard build
dashboard/dist/
dashboard/node_modules/
EOF
fi

# Add all files
echo "➕ Adding files to git..."
git add .

# Check status
echo ""
echo "📊 Git Status:"
git status --short | head -20

# Commit
echo ""
echo "💾 Committing files..."
git commit -m "Initial commit: Otacon - Simplified AI Assistant Dashboard

Features:
- Electron desktop app with black & white theme
- One-click installer scripts for Windows/Mac/Linux
- Comprehensive documentation and user guides
- GitHub Actions CI/CD for automated builds
- Website landing page
- Docker support
- CLI commands

Based on OpenClaw but simplified for non-technical users."

# Push to GitHub
echo ""
echo "☁️ Pushing to GitHub..."
echo "   Repository: https://github.com/Drepheus/Otacon.git"
echo ""

git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Repository pushed to GitHub"
    echo ""
    echo "🔗 Your repository: https://github.com/Drepheus/Otacon"
    echo ""
    echo "🎉 Next steps:"
    echo "   1. Visit https://github.com/Drepheus/Otacon to see your code"
    echo "   2. Enable GitHub Pages for the website (if desired)"
    echo "   3. Create a release with built installers"
    echo "   4. Share your project!"
else
    echo ""
    echo "⚠️  Push failed. You may need to:"
    echo "   1. Log in to GitHub: git config --global user.name 'Your Name'"
    echo "   2. Set email: git config --global user.email 'your@email.com'"
    echo "   3. Authenticate: gh auth login (if using GitHub CLI)"
    echo "   4. Or use HTTPS with a Personal Access Token"
    echo ""
    echo "   Then run: git push -u origin main"
fi
