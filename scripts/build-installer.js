#!/usr/bin/env node

/**
 * Build native installers for Windows and Mac
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const BUILD_DIR = './build';
const DIST_DIR = './dist';

console.log(chalk.cyan(`
╔════════════════════════════════════════╗
║      🔨 Building Otacon Installers      ║
╚════════════════════════════════════════╝
`));

// Create directories
if (!existsSync(BUILD_DIR)) mkdirSync(BUILD_DIR, { recursive: true });
if (!existsSync(DIST_DIR)) mkdirSync(DIST_DIR, { recursive: true });

// Build Windows Installer
async function buildWindowsInstaller() {
  console.log(chalk.blue('\n📦 Building Windows Installer...\n'));
  
  try {
    // Create NSIS installer script
    const nsisScript = `
; Otacon Windows Installer
!include "MUI2.nsh"

Name "Otacon"
OutFile "dist/Otacon-Setup.exe"
InstallDir "$PROFILE\\Otacon"
InstallDirRegKey HKCU "Software\\Otacon" "InstallDir"
RequestExecutionLevel user

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "assets\\otacon.ico"
!define MUI_UNICON "assets\\otacon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

Section "Install"
  SetOutPath "$INSTDIR"
  
  ; Copy files
  File /r "bin\\*"
  File /r "installer\\*"
  File /r "docker\\*"
  File "package.json"
  File "README.md"
  File "LICENSE"
  
  ; Create desktop shortcut
  CreateShortcut "$DESKTOP\\Otacon.lnk" "$INSTDIR\\bin\\otacon-start.js" "" "$INSTDIR\\assets\\otacon.ico"
  
  ; Create start menu shortcut
  CreateDirectory "$SMPROGRAMS\\Otacon"
  CreateShortcut "$SMPROGRAMS\\Otacon\\Otacon.lnk" "$INSTDIR\\bin\\otacon-start.js"
  CreateShortcut "$SMPROGRAMS\\Otacon\\Uninstall.lnk" "$INSTDIR\\Uninstall.exe"
  
  ; Add to PATH
  EnVar::AddValue "PATH" "$INSTDIR\\bin"
  
  ; Registry entries
  WriteRegStr HKCU "Software\\Otacon" "InstallDir" $INSTDIR
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  
  ; Run installer
  ExecWait '"node" "$INSTDIR\\installer\\install.js"'
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\\*"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\\Otacon.lnk"
  RMDir /r "$SMPROGRAMS\\Otacon"
  DeleteRegKey HKCU "Software\\Otacon"
SectionEnd
`;
    
    writeFileSync(join(BUILD_DIR, 'installer.nsi'), nsisScript);
    
    // Build with NSIS (if available)
    try {
      execSync('makensis build/installer.nsi', { stdio: 'inherit' });
      console.log(chalk.green('✅ Windows installer built: dist/Otacon-Setup.exe\n'));
    } catch {
      console.log(chalk.yellow('⚠️  NSIS not found. Install NSIS to build Windows installer.\n'));
      console.log(chalk.cyan('   Download: https://nsis.sourceforge.io/Download\n'));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error building Windows installer: ${error.message}\n`));
  }
}

// Build Mac Installer
async function buildMacInstaller() {
  console.log(chalk.blue('\n📦 Building macOS Installer...\n'));
  
  try {
    // Create macOS app bundle structure
    const appDir = join(BUILD_DIR, 'Otacon.app');
    const contentsDir = join(appDir, 'Contents');
    const macOSDir = join(contentsDir, 'MacOS');
    const resourcesDir = join(contentsDir, 'Resources');
    
    mkdirSync(macOSDir, { recursive: true });
    mkdirSync(resourcesDir, { recursive: true });
    
    // Create Info.plist
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>otacon</string>
  <key>CFBundleIdentifier</key>
  <string>ai.otacon.app</string>
  <key>CFBundleName</key>
  <string>Otacon</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0.0</string>
  <key>LSMinimumSystemVersion</key>
  <string>10.15</string>
  <key>LSUIElement</key>
  <false/>
</dict>
</plist>`;
    
    writeFileSync(join(contentsDir, 'Info.plist'), plist);
    
    // Create launcher script
    const launcher = `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/../../Resources"
exec node bin/otacon-start.js
`;
    
    writeFileSync(join(macOSDir, 'otacon'), launcher);
    execSync(`chmod +x "${join(macOSDir, 'otacon')}"`);
    
    // Copy resources
    copyFileSync('bin/otacon-start.js', join(resourcesDir, 'bin', 'otacon-start.js'));
    copyFileSync('bin/otacon-stop.js', join(resourcesDir, 'bin', 'otacon-stop.js'));
    copyFileSync('bin/otacon-help.js', join(resourcesDir, 'bin', 'otacon-help.js'));
    copyFileSync('installer/install.js', join(resourcesDir, 'installer', 'install.js'));
    copyFileSync('package.json', join(resourcesDir, 'package.json'));
    copyFileSync('README.md', join(resourcesDir, 'README.md'));
    
    // Create DMG
    try {
      execSync(`create-dmg \
        --volname "Otacon Installer" \
        --window-pos 200 120 \
        --window-size 800 400 \
        --icon-size 100 \
        --app-drop-link 600 185 \
        "dist/Otacon-Setup.dmg" \
        "${appDir}"`, { stdio: 'inherit' });
      console.log(chalk.green('✅ macOS installer built: dist/Otacon-Setup.dmg\n'));
    } catch {
      console.log(chalk.yellow('⚠️  create-dmg not found. Install create-dmg to build macOS installer.\n'));
      console.log(chalk.cyan('   Install: brew install create-dmg\n'));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error building macOS installer: ${error.message}\n`));
  }
}

// Build portable binary using pkg
async function buildPortableBinary() {
  console.log(chalk.blue('\n📦 Building Portable Binary...\n'));
  
  try {
    // Build for Windows
    try {
      execSync('pkg . --targets node22-win-x64 --output dist/otacon-win.exe', { stdio: 'inherit' });
      console.log(chalk.green('✅ Windows portable binary built: dist/otacon-win.exe\n'));
    } catch {
      console.log(chalk.yellow('⚠️  pkg not found. Install with: npm install -g pkg\n'));
    }
    
    // Build for Mac
    try {
      execSync('pkg . --targets node22-macos-x64 --output dist/otacon-mac', { stdio: 'inherit' });
      console.log(chalk.green('✅ macOS portable binary built: dist/otacon-mac\n'));
    } catch {
      console.log(chalk.yellow('⚠️  pkg not found. Install with: npm install -g pkg\n'));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Error building portable binary: ${error.message}\n`));
  }
}

// Main build process
async function main() {
  const target = process.argv[2];
  
  switch (target) {
    case 'win':
      await buildWindowsInstaller();
      break;
    case 'mac':
      await buildMacInstaller();
      break;
    case 'portable':
      await buildPortableBinary();
      break;
    default:
      await buildWindowsInstaller();
      await buildMacInstaller();
      await buildPortableBinary();
  }
  
  console.log(chalk.cyan(`
╔════════════════════════════════════════╗
║         ✅ Build Complete!              ║
╚════════════════════════════════════════╝

📦 Installers created in: ./dist/

`));
}

main().catch(console.error);
