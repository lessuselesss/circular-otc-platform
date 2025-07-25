# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Circular CIRX OTC Trading Platform** built on **UniswapV4** infrastructure:
- **Smart contracts** using UniswapV4 core and custom hooks for OTC trading
- **Nuxt.js frontend** with dual-tab interface (liquid/vested purchases)
- **Phase 1**: Simple OTC purchase form with wallet integration and vesting logic

**Current Status**: UniswapV4 integrated, building Phase 1 OTC functionality per PRP requirements.

## Technology Stack

- **Smart Contracts**: Solidity ^0.8.26, UniswapV4 core, Foundry framework
- **UniswapV4**: Production-ready (launched Jan 2025), 30% gas savings, hook system
- **Frontend**: Nuxt.js 3, Vue.js, Nuxt UI (Tailwind CSS)  
- **Web3 Integration**: Viem + Wagmi (Ethereum), Solana Wallet Adapter
- **Version Control**: Jujutsu (jj) in colocated mode with Git compatibility
- **Deployment**: Cloudflare Pages with edge computing
- **Testing**: Forge (smart contracts), Vitest (frontend)
- **Local Development**: Anvil (local Ethereum node)

## Development Commands

### Smart Contract Development

```bash
# From project root (/uniswapv3clone/)
forge build                    # Compile contracts
forge test                     # Run all tests
forge test --match-contract CounterTest  # Run specific test contract
forge test --match-test test_Increment   # Run specific test
forge fmt                      # Format Solidity code
forge snapshot                 # Generate gas usage snapshots
anvil                         # Start local Ethereum node (port 8545)

# Deployment (replace placeholders)
forge script script/Counter.s.sol:CounterScript --rpc-url <rpc_url> --private-key <private_key>

# Blockchain interactions
cast <subcommand>             # Various blockchain utilities
```

### Frontend Development

```bash
# From UI directory (/uniswapv3clone/ui/)
npm run dev                   # Start Nuxt development server (localhost:3000)
npm run build                 # Build for production (Cloudflare Pages)
npm run generate              # Generate static site
npm run preview               # Preview production build locally

# Cloudflare deployment
wrangler pages deploy .output/public  # Deploy to Cloudflare Pages
```

## Architecture

### Smart Contract Layer (`/src/`)
- **Foundation**: UniswapV4 core contracts (installed in `/lib/v4-core/`)
- **Phase 1 OTC Contracts**:
  - `CIRXToken.sol` - ERC20 token contract for CIRX
  - `SimpleOTCSwap.sol` - Basic swap logic using V4 infrastructure
  - `VestingContract.sol` - 6-month linear vesting for OTC purchases
  - `PriceOracle.sol` - Simple price feeds for discount calculations
- **UniswapV4 Integration**: Direct pool interaction, 30% gas savings, flash accounting
- **Future**: Custom hooks for access control, advanced pricing, bulk trading

### Frontend Layer (`/ui/`)
- **Framework**: Nuxt.js 3 with Vue.js components
- **UI Library**: Nuxt UI (built on Tailwind CSS)
- **Structure**: File-based routing with pages/, components/, layouts/
- **Phase 1 Implementation**: 
  - Dual-tab OTC interface (liquid/vested purchases)
  - Wallet integration (MetaMask, Phantom, WalletConnect)
  - CIRX token swaps with discount calculator
  - Vesting dashboard for OTC positions
  - Matcha/Jupiter inspired layout (form + chart)
- **Deployment**: Configured for Cloudflare Pages with edge computing

### Testing Structure
- **Smart Contracts**: `/test/` - Uses Forge testing framework with fuzz testing support
- **Frontend**: Nuxt.js built-in testing with Vitest support

## Development Workflow

### Jujutsu (jj) Version Control Setup

This project uses **Jujutsu (jj)** in colocated mode for version control, providing a modern change-centric workflow while maintaining Git compatibility.

#### Initial Setup
```bash
# Initialize jj in existing Git repository (colocated mode)
jj git init --colocate

# Or when cloning
jj git clone --colocate <repository-url>

# Configure user information
jj config set --user user.name "Your Name" 
jj config set --user user.email "your.email@example.com"
```

#### Daily Development Commands
```bash
# Check status and view changes
jj st                          # Show working directory status
jj diff                        # Show current changes
jj log                         # View commit history with smart defaults

# Working with changes
jj new                         # Finalize current change, start new one
jj describe -m "Add feature"   # Add description to current change

# Sync with remote
jj git fetch                   # Update from remote
jj git push --allow-new        # Push new changes

# View your work
jj log -r "mine()"            # Show only your changes
jj log -r "::@"               # Show stack leading to current change
```

#### Bookmark Management (Replaces Git Branches)
```bash
# Create and manage bookmarks for features
jj bookmark create feature-name -r @-     # Create bookmark for previous change
jj bookmark create hotfix -r main         # Create bookmark from main
jj bookmark list                          # List all bookmarks
jj bookmark track main@origin             # Track remote bookmarks

# Switch between work
jj edit -r feature-name                   # Switch to bookmark
jj edit -r main                           # Switch to main
```

#### Smart Contract Development Workflow
```bash
# Start new contract feature
jj new -r main
jj describe -m "Add DEX pool contract"
# Edit contracts in src/
forge build && forge test                 # Build and test

# Move to frontend work
jj new
jj describe -m "Add swap interface"  
# Edit frontend in ui/
cd ui && npm run dev                      # Test frontend

# Create feature bookmark when ready
jj bookmark create dex-swap-feature -r @-
jj git push --allow-new
```

#### Stacked Changes Workflow
```bash
# Create a stack of related changes
jj new -r main                            # Foundation change
jj describe -m "Add liquidity pool model"
# Implement pool model

jj new                                    # Build on previous change  
jj describe -m "Add pool factory"
# Implement factory

jj new                                    # Build on factory
jj describe -m "Add swap router"
# Implement router

# Push entire stack for review
jj bookmark create liquidity-system -r @-
jj git push --allow-new
```

### Local Development Setup
1. **Initialize jj**: `jj git init --colocate` (if not already done)
2. **Start Anvil**: `anvil` (provides local blockchain at localhost:8545)  
3. **Deploy Contracts**: Use forge script commands
4. **Start Frontend**: `cd ui && npm run dev`
5. **Run Tests**: `forge test` for contracts, `npm run test` for frontend

### Testing Strategy
- **Smart Contracts**: Use `forge test` with both unit tests and fuzz testing
- **Gas Optimization**: Use `forge snapshot` to track gas usage changes  
- **Frontend**: Vitest for unit tests, Playwright for E2E tests
- **Change Isolation**: Each jj change represents a testable unit of work

### Code Organization Conventions  
- **Solidity**: Follow Foundry project structure (src/, test/, script/)
- **Nuxt.js**: File-based routing, component structure, and composables pattern
- **Testing**: Mirror source structure in test directories
- **Changes**: One logical feature/fix per jj change for clean history

### Deployment Strategy
- **Smart Contracts**: Deploy to testnets/mainnet using Foundry scripts
- **Frontend**: Automatic deployment to Cloudflare Pages via jj bookmark integration
- **Environment**: Separate staging and production environments
- **CI/CD**: Use `jj git push` for pipeline compatibility

## Key Implementation Notes

### Smart Contract Development
- Uses Solidity ^0.8.26 for UniswapV4 compatibility
- UniswapV4 provides 30% gas savings and 99% cheaper pool creation
- Foundry provides advanced testing capabilities including fuzz testing
- V4 core contracts installed, building OTC-specific functionality on top

### Frontend Development
- **Nuxt.js 3**: Modern Vue.js framework with SSR/SSG capabilities
- **Cloudflare Pages**: Edge deployment with fast global CDN
- **Nuxt UI**: Professional UI components with Tailwind CSS
- **Ready for Web3**: Structured for wallet connection and contract interaction
- **Performance**: Optimized for Core Web Vitals and SEO

### Development Status (Phase 1 OTC Platform)
- ✅ UniswapV4 core contracts integrated
- ✅ Foundry configured for V4 (Solidity 0.8.26, Cancun EVM)
- ✅ Development environment ready
- ✅ Phase 1 PRP completed
- ⏳ CIRX token contract implementation
- ⏳ Simple OTC swap logic using V4
- ⏳ Dual-tab interface (liquid/vested)
- ⏳ Vesting contract with 6-month linear unlock

## Circular CIRX OTC Platform Specifications

### Core Requirements (Phase 1)
- **Dual Purchase Options**: 
  - Liquid tokens (immediate delivery at market rate)
  - OTC vested tokens (6-month lockup with 5-15% discount)
- **Supported Tokens**: ETH, USDC, USDT → CIRX swaps
- **Wallet Integration**: MetaMask, Phantom, WalletConnect (no Circular wallet needed)
- **UI Design**: Matcha/Jupiter inspired (form + chart layout)

### Technical Implementation
- **UniswapV4 Foundation**: Direct pool interaction, flash accounting
- **Smart Contracts**: `/src/tokens/`, `/src/swap/`, `/src/vesting/`
- **Frontend**: Dual-tab interface in `/ui/pages/swap.vue`
- **Vesting Logic**: Linear 6-month unlock, claimable anytime
- **Discount Tiers**: $1K-$10K (5%), $10K-$50K (8%), $50K+ (12%)

### Key Features
- **No Wallet Connection Required**: Users can paste wallet addresses directly
- **Real-time Pricing**: Live quotes with slippage protection
- **Transaction History**: Basic swap and vesting position tracking
- **Error Handling**: Comprehensive edge case management
- **Mobile Responsive**: Optimized for all device sizes

### Development Workflow
1. **Week 1-2**: CIRX token + basic V4 swap integration
2. **Week 3-4**: Vesting contract + OTC discount logic
3. **Week 5-6**: Dual-tab frontend + wallet integration
4. **Week 7-8**: Testing, error handling, deployment

## Jujutsu Configuration

### Recommended .jjconfig.toml Setup
Create `.jjconfig.toml` in your home directory with smart contract development optimizations:

```toml
[user]
name = "Your Name"
email = "your.email@example.com"

[ui]
# Enhanced diff display for Solidity files
diff.tool = ["code", "--wait", "--diff", "$left", "$right"]

[revsets]
# Custom queries for smart contract development
"contracts" = "file_type:sol"
"frontend" = "file_type:js | file_type:ts | file_type:vue"
"tests" = "file_type:test.js | file_type:test.ts | file_type:t.sol"

[aliases]
# Smart contract development aliases
"build" = ["!forge", "build"]
"test-contracts" = ["!forge", "test"]
"test-gas" = ["!forge", "snapshot"]
"anvil-start" = ["!anvil"]

# Frontend development aliases  
"dev-ui" = ["!cd", "ui", "&&", "npm", "run", "dev"]
"build-ui" = ["!cd", "ui", "&&", "npm", "run", "build"]
"test-ui" = ["!cd", "ui", "&&", "npm", "run", "test"]

# Common jj workflow shortcuts
"sync" = ["git", "fetch"]
"stack" = ["log", "-r", "::@"]
"mine" = ["log", "-r", "mine()"]
"recent" = ["log", "-r", "@---.."]

[git]
# Auto-create local bookmarks for pushed changes
auto-local-bookmark = true

[template]
# Custom log template showing bookmarks and descriptions
log = '''
commit_id.short() ++ " " ++
if(bookmarks, bookmarks.join(" ") ++ " ") ++
if(description, description.first_line()) ++
"\n"
'''
```

### Colocated Workflow Best Practices

1. **Use jj for Changes, Git for Compatibility**:
   - All development work through `jj` commands
   - Use `git` commands only when needed for tool compatibility
   - IDE and CI/CD systems work transparently with colocated setup

2. **Change Granularity**:
   - One logical feature per change (contract + tests + frontend)
   - Use stacked changes for complex features spanning multiple contracts
   - Keep changes focused and reviewable

3. **Bookmark Strategy**:
   - Create bookmarks only when ready to push/review
   - Use descriptive names: `pool-factory-v2`, `swap-optimization`, `frontend-wallet-integration`
   - Track upstream bookmarks: `jj bookmark track main@origin`

4. **Conflict Resolution**:
   - Conflicts can be committed and resolved later
   - Use `jj resolve` for interactive conflict resolution
   - Automatic rebasing reduces merge conflicts

5. **Team Integration**:
   - Teammates can use Git normally while you use jj
   - `jj git push` creates standard Git commits
   - CI/CD pipelines work without modification

## External Resources

- **Jujutsu Documentation**: https://jj-vcs.github.io/jj/latest/
- **Foundry Documentation**: https://book.getfoundry.sh/
- **Nuxt.js Documentation**: https://nuxt.com/docs
- **Nuxt UI Documentation**: https://ui.nuxt.com/
- **Cloudflare Pages**: https://pages.cloudflare.com/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
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
