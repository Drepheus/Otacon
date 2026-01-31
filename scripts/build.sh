#!/bin/bash

# Otacon Build Script
# Builds installers for all platforms

set -e

echo "🔨 Otacon Build Script"
echo "======================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from Otacon root directory${NC}"
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}Building Otacon v${VERSION}${NC}"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/
mkdir -p dist
mkdir -p build

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the dashboard
echo "🎨 Building Desktop Dashboard..."
cd dashboard
npm install

# Build for current platform first
echo "   Building dashboard..."
npm run build

# Build for all platforms
echo "   Building for all platforms..."
npm run build:win 2>/dev/null || echo -e "${YELLOW}   Windows build skipped (may require Windows or Wine)${NC}"
npm run build:mac 2>/dev/null || echo -e "${YELLOW}   macOS build skipped (requires macOS)${NC}"
npm run build:linux 2>/dev/null || echo -e "${YELLOW}   Linux build skipped${NC}"

cd ..

# Copy dashboard builds
echo "📋 Copying builds to dist/..."
if [ -d "dashboard/dist" ]; then
    cp -r dashboard/dist/* dist/ 2>/dev/null || true
fi

# Build CLI installer
echo "💻 Building CLI version..."
node scripts/build-installer.js

# Create release package
echo "📦 Creating release package..."
cd dist

# Create checksums
echo "🔐 Generating checksums..."
if command -v sha256sum &> /dev/null; then
    sha256sum * > checksums.txt 2>/dev/null || true
elif command -v shasum &> /dev/null; then
    shasum -a 256 * > checksums.txt 2>/dev/null || true
fi

cd ..

echo ""
echo -e "${GREEN}✅ Build Complete!${NC}"
echo ""
echo "📁 Output files in dist/:"
ls -lh dist/ 2>/dev/null || echo "   (Check dist/ folder)"
echo ""
echo "🚀 Next steps:"
echo "   1. Test the installers"
echo "   2. Create GitHub release"
echo "   3. Upload dist/ contents to release"
echo ""
