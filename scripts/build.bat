@echo off
REM Otacon Build Script for Windows
REM Builds installers for Windows

setlocal enabledelayedexpansion

echo 🔨 Otacon Build Script for Windows
echo ===================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Must run from Otacon root directory
    exit /b 1
)

REM Get version from package.json
for /f "tokens=*" %%a in ('node -p "require('./package.json').version"') do set VERSION=%%a
echo Building Otacon v%VERSION%
echo.

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build
mkdir dist
mkdir build

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error installing dependencies
    exit /b 1
)

REM Build the dashboard
echo 🎨 Building Desktop Dashboard...
cd dashboard
call npm install
if errorlevel 1 (
    echo Error installing dashboard dependencies
    cd ..
    exit /b 1
)

echo    Building dashboard for Windows...
call npm run build:win
if errorlevel 1 (
    echo Warning: Windows build may have failed. Continuing...
)

cd ..

REM Copy dashboard builds
echo 📋 Copying builds to dist\...
if exist "dashboard\dist" (
    xcopy /e /i /y "dashboard\dist\*" "dist\" >nul 2>&1
)

REM Build CLI installer
echo 💻 Building CLI version...
node scripts\build-installer.js win

echo.
echo ✅ Build Complete!
echo.
echo 📁 Output files in dist\:
dir /b dist\
echo.
echo 🚀 Next steps:
echo    1. Test the installer: dist\Otacon-Setup.exe
echo    2. Create GitHub release
echo    3. Upload dist\* to release
echo.

pause
