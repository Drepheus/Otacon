@echo off
REM Setup script to initialize Otacon repo and push to GitHub
REM Run this in your Otacon folder

echo 🚀 Setting up Otacon Git Repository
echo ====================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Must run from Otacon root directory
    echo    Current directory: %cd%
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed
    echo    Please install Git first: https://git-scm.com/downloads
    exit /b 1
)

REM Initialize git repo if not already initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
) else (
    echo 📦 Git repository already initialized
)

REM Add the remote repository
echo 🔗 Adding remote repository...
git remote add origin https://github.com/Drepheus/Otacon.git 2>nul
if errorlevel 1 (
    echo    Remote already exists
)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo 📝 Creating .gitignore...
    (
        echo # Dependencies
        echo node_modules/
        echo .pnp
        echo .pnp.js
        echo.
        echo # Build outputs
        echo dist/
        echo build/
        echo *.exe
        echo *.dmg
        echo *.pkg
        echo *.msi
        echo *.AppImage
        echo.
        echo # Environment
        echo .env
        echo .env.local
        echo .env.*.local
        echo.
        echo # Logs
        echo logs/
        echo *.log
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # OS files
        echo .DS_Store
        echo Thumbs.db
        echo desktop.ini
        echo.
        echo # IDE
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo *~
        echo.
        echo # Dashboard build
        echo dashboard/dist/
        echo dashboard/node_modules/
    ) > .gitignore
)

REM Add all files
echo ➕ Adding files to git...
git add .

REM Check status
echo.
echo 📊 Git Status:
git status --short

REM Commit
echo.
echo 💾 Committing files...
git commit -m "Initial commit: Otacon - Simplified AI Assistant Dashboard"

REM Push to GitHub
echo.
echo ☁️ Pushing to GitHub...
echo    Repository: https://github.com/Drepheus/Otacon.git
echo.

git push -u origin main 2>nul
if errorlevel 1 (
    git push -u origin master 2>nul
)

if errorlevel 1 (
    echo.
    echo ⚠️ Push failed. You may need to:
    echo    1. Log in to GitHub: git config --global user.name "Your Name"
    echo    2. Set email: git config --global user.email "your@email.com"
    echo    3. Authenticate when prompted for username/password
    echo    4. Or use a Personal Access Token as password
    echo.
    echo    Then run: git push -u origin main
    pause
) else (
    echo.
    echo ✅ SUCCESS! Repository pushed to GitHub
    echo.
    echo 🔗 Your repository: https://github.com/Drepheus/Otacon
    echo.
    echo 🎉 Next steps:
    echo    1. Visit https://github.com/Drepheus/Otacon to see your code
    echo    2. Enable GitHub Pages for the website (if desired)
    echo    3. Create a release with built installers
    echo    4. Share your project!
    pause
)
