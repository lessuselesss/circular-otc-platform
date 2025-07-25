#!/bin/bash

# PRP Integration for UniswapV3 Clone Project
echo "🚀 Integrating PRP Framework with UniswapV3 Clone"
echo "================================================"

# Create PRP directory structure for this project
echo "✓ Creating PRP-compatible project structure..."
mkdir -p tasks/completed tasks/backlog
mkdir -p quality security ux
mkdir -p docs/architecture docs/api

# Create .claude directory if it doesn't exist
if [ ! -d ".claude" ]; then
    mkdir -p .claude
    echo "✓ Created .claude directory"
fi

# Create auto plan mode configuration
echo "✓ Setting up Auto Plan Mode..."
cat > .claude/auto_plan_mode.txt << 'EOF'
# Auto Plan Mode Configuration
# This file enables safe AI-assisted development

## Planning Phase
When asked to implement features or make changes:
1. ALWAYS create a detailed plan before coding
2. Break down complex tasks into smaller steps
3. Identify potential risks and dependencies
4. Get user approval before proceeding

## Implementation Phase
- Make incremental changes
- Test after each step
- Document decisions and trade-offs
- Stop and re-plan if blocked

## Safety Measures
- Never make breaking changes without approval
- Always backup before major refactoring
- Use feature flags for experimental code
- Maintain backward compatibility when possible

## Smart Contract Specific
- Always run `forge test` after contract changes
- Use `forge snapshot` to monitor gas usage
- Deploy to testnet before mainnet
- Verify contract security before deployment

## Frontend Specific
- Test UI changes in development mode
- Ensure responsive design works
- Validate Web3 integrations
- Check Cloudflare Pages compatibility
EOF

# Create environment configuration
echo "✓ Creating environment configuration..."
cat > .env.example << 'EOF'
# UniswapV3 Clone Environment Configuration

# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# Frontend Configuration
NUXT_PUBLIC_CHAIN_ID=1337
NUXT_PUBLIC_RPC_URL=http://localhost:8545

# Development
NODE_ENV=development
DEBUG=true

# Cloudflare (for deployment)
CF_PAGES_URL=your_pages_url_here
EOF

# Update CLAUDE.md to include PRP integration
echo "✓ Updating CLAUDE.md with PRP integration..."
cat >> CLAUDE.md << 'EOF'

## PRP Framework Integration

This project now includes the PRP (Product Requirements and Planning) framework for enhanced AI-assisted development.

### Auto Plan Mode

The project is configured with Auto Plan Mode for safe development:
- **Planning First**: Claude creates detailed plans before implementation
- **Incremental Changes**: Small, testable changes with validation
- **Smart Contract Safety**: Automatic testing and gas monitoring
- **User Approval**: Major changes require explicit approval

### PRP Directory Structure

- `tasks/` - Task management and project planning
  - `completed/` - Finished tasks and features
  - `backlog/` - Planned features and improvements
- `ai_docs/` - AI-generated documentation and patterns
- `quality/` - Code quality metrics and reports
- `security/` - Security audit results and configurations
- `ux/` - User experience research and designs

### AI-Assisted Workflow

1. **Feature Planning**: Ask Claude to create a PRD for new features
2. **Implementation**: Use Auto Plan Mode for safe development
3. **Testing**: Automated testing after each change
4. **Documentation**: AI-generated docs in `ai_docs/`

### Commands

```bash
# Start development with PRP
./start-prp.sh

# Create a new feature plan
claude "Create a PRD for [feature description]"

# Implement with Auto Plan Mode
claude "Implement the user authentication system using Auto Plan Mode"
```

### Integration Benefits

- **Safer Development**: Auto Plan Mode prevents breaking changes
- **Better Documentation**: AI-generated docs and patterns
- **Structured Planning**: Task management and feature tracking
- **Quality Focus**: Built-in quality and security checks
EOF

# Create start script for PRP workflow
echo "✓ Creating PRP start script..."
cat > start-prp.sh << 'EOF'
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
EOF

# Make scripts executable
chmod +x start-prp.sh

# Create initial task structure
echo "✓ Creating initial task structure..."
cat > tasks/backlog/README.md << 'EOF'
# Project Backlog

## Core DEX Implementation
- [ ] Replace Counter contract with UniswapV3 core contracts
- [ ] Implement liquidity pool management
- [ ] Create swap router functionality
- [ ] Add position manager for liquidity providers

## Frontend Integration
- [ ] Connect frontend to smart contracts
- [ ] Implement wallet integration
- [ ] Create swap interface
- [ ] Build liquidity management UI
- [ ] Add transaction history

## Testing & Quality
- [ ] Comprehensive smart contract testing
- [ ] Frontend E2E testing
- [ ] Gas optimization
- [ ] Security audit preparation

## Deployment
- [ ] Testnet deployment
- [ ] Frontend deployment to Cloudflare Pages
- [ ] Mainnet preparation
- [ ] Documentation completion
EOF

cat > tasks/completed/README.md << 'EOF'
# Completed Tasks

## Project Setup
- [x] Initial Foundry project structure
- [x] Nuxt.js frontend setup
- [x] Cloudflare Pages configuration
- [x] Jujutsu version control setup
- [x] PRP framework integration

## Development Environment
- [x] Local blockchain (Anvil) configuration
- [x] Smart contract compilation pipeline
- [x] Frontend development server
- [x] Auto Plan Mode setup
EOF

echo "✅ PRP Framework Integration Complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Run './start-prp.sh' to start the development environment"
echo "2. Copy '.env.example' to '.env' and configure your settings"
echo "3. Start Claude Code with 'claude' in this directory"
echo "4. Ask Claude: 'Help me create a PRD for the UniswapV3 DEX implementation'"
echo ""
echo "🎉 Your UniswapV3 Clone is now PRP-enhanced! 🚀"