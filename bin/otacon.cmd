@echo off
:: Otacon CLI Wrapper for Windows
:: This allows running 'otacon' command from anywhere
:: Add this directory to your PATH to use globally

set OTACON_DIR=%~dp0..
set OPENCLAW_DIR=%OTACON_DIR%\openclaw
set NODE_CMD=node

:: Check if Node.js is available
%NODE_CMD% --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js 22+ from https://nodejs.org
    exit /b 1
)

:: Check if openclaw exists
if not exist "%OPENCLAW_DIR%\openclaw.mjs" (
    echo Error: OpenClaw not found at %OPENCLAW_DIR%
    echo Please run setup.bat first
    exit /b 1
)

:: Set environment variables
set OPENCLAW_PORT=18789
set CLAWDBOT_PORT=18789
set OPENCLAW_BIND=localhost
set CLAWDBOT_BIND=localhost

:: Read API keys from config if exists
set CONFIG_FILE=%USERPROFILE%\.openclaw\clawdbot.json
if exist "%CONFIG_FILE%" (
    :: Note: In a real implementation, you'd parse the JSON properly
    :: For now, users can set env vars manually or rely on the dashboard
)

:: Run the command
%NODE_CMD% "%OPENCLAW_DIR%\openclaw.mjs" %*
