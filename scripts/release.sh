#!/bin/bash

# Otacon Release Script
# Creates a new release with all builds

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Otacon Release Script${NC}"
echo "========================"
echo ""

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it: https://cli.github.com/"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not logged in to GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${GREEN}v${CURRENT_VERSION}${NC}"
echo ""

# Ask for new version
read -p "Enter new version (e.g., 1.0.1): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo -e "${RED}Version cannot be empty${NC}"
    exit 1
fi

# Validate version format
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Invalid version format. Use semantic versioning (e.g., 1.0.1)${NC}"
    exit 1
fi

echo ""
echo -e "Creating release ${GREEN}v${NEW_VERSION}${NC}"
echo ""

# Update version in package.json
echo "📦 Updating version..."
npm version $NEW_VERSION --no-git-tag-version

# Update dashboard version too
cd dashboard
npm version $NEW_VERSION --no-git-tag-version
cd ..

# Update CHANGELOG
echo "📝 Updating CHANGELOG..."
DATE=$(date +%Y-%m-%d)
sed -i '' "s/## \[Unreleased\]/## [Unreleased]\n\n## [${NEW_VERSION}] - ${DATE}/g" CHANGELOG.md 2>/dev/null || \
sed -i "s/## \[Unreleased\]/## [Unreleased]\n\n## [${NEW_VERSION}] - ${DATE}/g" CHANGELOG.md

# Commit changes
echo "💾 Committing changes..."
git add package.json dashboard/package.json CHANGELOG.md
git commit -m "Release v${NEW_VERSION}"

# Create tag
echo "🏷️  Creating tag..."
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

# Push to remote
echo "☁️  Pushing to GitHub..."
git push origin main
git push origin "v${NEW_VERSION}"

echo ""
echo -e "${GREEN}✅ Release v${NEW_VERSION} created!${NC}"
echo ""
echo -e "${YELLOW}The GitHub Actions workflow will now build the installers.${NC}"
echo -e "${YELLOW}Check progress at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions${NC}"
echo ""
echo "🎉 Done!"
