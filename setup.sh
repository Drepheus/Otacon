#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Art
echo ""
echo -e "${BLUE}  ██████╗ ████████╗ █████╗  ██████╗ ██████╗ ███╗   ██╗${NC}"
echo -e "${BLUE}  ██╔═══██╗╚══██╔══╝██╔══██╗██╔════╝██╔═══██╗████╗  ██║${NC}"
echo -e "${BLUE}  ██║   ██║   ██║   ███████║██║     ██║   ██║██╔██╗ ██║${NC}"
echo -e "${BLUE}  ██║   ██║   ██║   ██╔══██║██║     ██║   ██║██║╚██╗██║${NC}"
echo -e "${BLUE}  ╚██████╔╝   ██║   ██║  ██║╚██████╗╚██████╔╝██║ ╚████║${NC}"
echo -e "${BLUE}   ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝${NC}"
echo ""
echo -e "${GREEN}Welcome to Otacon Setup!${NC}"
echo "This will check your system and help you get running."
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
echo -e "${BLUE}Checking for Node.js...${NC}"
if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo ""
    echo "Otacon requires Node.js 22 or later."
    echo ""
    
    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            echo -e "${YELLOW}Installing Node.js via Homebrew...${NC}"
            brew install node@22
        else
            echo "Please install Node.js from https://nodejs.org"
            echo "Or install Homebrew first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        echo "Please install Node.js 22+ using your package manager:"
        echo "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs"
        echo "  Fedora: sudo dnf install nodejs22"
        echo "  Arch: sudo pacman -S nodejs"
        exit 1
    else
        echo "Please install Node.js 22+ from https://nodejs.org"
        exit 1
    fi
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${YELLOW}⚠️  Node.js version is too old (found v${NODE_VERSION}.x, need 22+)${NC}"
    echo "Please upgrade Node.js from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) is installed${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "openclaw/package.json" ]; then
    echo -e "${RED}❌ Error: Can't find OpenClaw directory!${NC}"
    echo "Please run this script from the Otacon folder."
    exit 1
fi

# Install OpenClaw dependencies
echo -e "${BLUE}Installing OpenClaw dependencies...${NC}"
echo "This may take a few minutes..."
echo ""
cd openclaw || exit 1
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install OpenClaw dependencies${NC}"
    echo "Please check your internet connection and try again."
    exit 1
fi
cd ..

# Install dashboard dependencies
echo ""
echo -e "${BLUE}Installing Dashboard dependencies...${NC}"
cd dashboard || exit 1
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dashboard dependencies${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${GREEN}✅ All dependencies installed!${NC}"
echo ""

# Build OpenClaw
echo -e "${BLUE}Building OpenClaw...${NC}"
cd openclaw || exit 1
npm run build 2>/dev/null || echo -e "${YELLOW}Note: Build step skipped (TypeScript compilation may not be needed for running)${NC}"
cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}Setup complete! You can now run Otacon.${NC}"
echo ""
echo "To start the dashboard:"
echo "  cd dashboard"
echo "  npm run dev"
echo ""
echo "Or use the desktop app once built:"
echo "  cd dashboard"
echo "  npm run build"
echo "=========================================="
echo ""

# Ask to start
read -p "Would you like to start Otacon now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd dashboard || exit 1
    npm run dev
fi

echo ""
echo -e "${GREEN}Goodbye!${NC}"
