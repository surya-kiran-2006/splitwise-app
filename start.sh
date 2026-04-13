#!/bin/bash

# SplitEase Quick Start Script for Mac
# Run this from the root splitwise-app/ directory: bash start.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "🚀 SplitEase — Quick Start"
echo "=========================="
echo ""

# Check Node
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Run: brew install node${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check MongoDB
if ! brew services list | grep mongodb-community | grep started &>/dev/null; then
  echo -e "${YELLOW}⚠ MongoDB not running. Starting it...${NC}"
  brew services start mongodb-community
  sleep 2
fi
echo -e "${GREEN}✓ MongoDB running${NC}"

# Install backend deps
echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install --silent
echo -e "${GREEN}✓ Backend ready${NC}"

# Install frontend deps
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install --silent
echo -e "${GREEN}✓ Frontend ready${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Now open TWO terminal windows and run:"
echo ""
echo -e "  ${YELLOW}Terminal 1 (Backend):${NC}"
echo "    cd splitwise-app/backend && npm run dev"
echo ""
echo -e "  ${YELLOW}Terminal 2 (Frontend):${NC}"
echo "    cd splitwise-app/frontend && npm start"
echo ""
echo "  App will open at: http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
