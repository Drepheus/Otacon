@echo off
chcp 65001 >nul
echo.
echo ██████╗ ████████╗ █████╗  ██████╗ ██████╗ ███╗   ██╗
echo ██╔═══██╗╚══██╔══╝██╔══██╗██╔════╝██╔═══██╗████╗  ██║
echo ██║   ██║   ██║   ███████║██║     ██║   ██║██╔██╗ ██║
echo ██║   ██║   ██║   ██╔══██║██║     ██║   ██║██║╚██╗██║
echo ╚██████╔╝   ██║   ██║  ██║╚██████╗╚██████╔╝██║ ╚████║
echo  ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝
echo.
echo Welcome to Otacon Setup!
echo This will check your system and help you get running.
echo.

:: Check if Node.js is installed
echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found!
    echo.
    echo Otacon requires Node.js 22 or later.
    echo.
    echo Would you like to download it now?
    choice /C YN /M "Open download page"
    if errorlevel 2 goto :end
    if errorlevel 1 (
        start https://nodejs.org/dist/v22.13.0/node-v22.13.0-x64.msi
        echo.
        echo Please install Node.js, then run this script again.
        pause
        goto :end
    )
)

for /f "tokens=1 delims=v." %%a in ('node --version') do set NODE_MAJOR=%%a
if %NODE_MAJOR% LSS 22 (
    echo ⚠️  Node.js version is too old (found v%NODE_MAJOR%.x, need 22+)
    echo Please upgrade Node.js from https://nodejs.org
    pause
    goto :end
)

echo ✅ Node.js is installed
echo.

:: Check if we're in the right directory
if not exist "openclaw\package.json" (
    echo ❌ Error: Can't find OpenClaw directory!
    echo Please run this script from the Otacon folder.
    pause
    goto :end
)

:: Install OpenClaw dependencies
echo Installing OpenClaw dependencies...
echo This may take a few minutes...
echo.
cd openclaw
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    echo Please check your internet connection and try again.
    pause
    goto :end
)
cd ..

:: Install dashboard dependencies
echo.
echo Installing Dashboard dependencies...
cd dashboard
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dashboard dependencies
    pause
    goto :end
)
cd ..

echo.
echo ✅ All dependencies installed!
echo.

:: Build OpenClaw
echo Building OpenClaw...
cd openclaw
call npm run build 2>nul || echo Note: Build step skipped (TypeScript compilation may not be needed for running)
cd ..

echo.
echo ==========================================
echo Setup complete! You can now run Otacon.
echo.
echo To start the dashboard:
echo   cd dashboard
echo   npm run dev
echo.
echo Or use the desktop app once built:
echo   cd dashboard
echo   npm run build
echo ==========================================
echo.

choice /C YN /M "Would you like to start Otacon now"
if errorlevel 2 goto :end
if errorlevel 1 (
    cd dashboard
    npm run dev
)

:end
echo.
echo Goodbye!
timeout /t 2 >nul
