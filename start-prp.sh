#!/bin/bash

echo "🚀 Starting UniswapV3 Clone with PRP Framework"
echo "=============================================="

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not found. Please install: https://getfoundry.sh/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Start Anvil in background if not running
if ! pgrep -f "anvil" > /dev/null; then
    echo "🔧 Starting Anvil (local blockchain)..."
    anvil &
    ANVIL_PID=$!
    echo "  Anvil started with PID: $ANVIL_PID"
    sleep 2
fi

# Build contracts
echo "🏗️  Building smart contracts..."
forge build
if [ $? -ne 0 ]; then
    echo "❌ Contract build failed"
    exit 1
fi

# Run tests
echo "🧪 Running smart contract tests..."
forge test
if [ $? -ne 0 ]; then
    echo "❌ Contract tests failed"
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "ui/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd ui && npm install && cd ..
fi

# Start frontend development server
echo "🌐 Starting frontend development server..."
cd ui
npm run dev &
NUXT_PID=$!
cd ..

echo "✅ PRP Development Environment Ready!"
echo ""
echo "🎯 Available Services:"
echo "  - Anvil (Blockchain): http://localhost:8545"
echo "  - Frontend: http://localhost:3000"
echo "  - Claude Code: Ready for Auto Plan Mode"
echo ""
echo "🚀 Next Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Start Claude Code: 'claude'"
echo "3. Ask Claude: 'Help me create a PRD for the DEX implementation'"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo '🛑 Stopping services...'; kill $ANVIL_PID $NUXT_PID; exit" INT
wait
