# Phase 1 PRP: Circular CIRX OTC Purchase Form

## Executive Summary
Build a simple OTC purchase interface for CIRX tokens with dual tabs (liquid/vested), wallet integration, and basic swap functionality using UniswapV4 as the underlying AMM.

---

## 1. Core Requirements (From Original PRD)

### Primary Features
- **Dual Tab Interface**: Liquid tokens (immediate) vs OTC vested tokens (6-month lockup with discount)
- **Wallet Integration**: Phantom, MetaMask, WalletConnect - **no Circular wallet connection needed**
- **Token Support**: ETH, USDC, USDT, SOL → CIRX swaps
- **UI Design**: Inspired by Matcha/Jupiter (form + chart layout)

### Key Simplifications
- Users paste wallet address directly (no wallet connection required for some flows)
- Basic swap functionality using existing UniswapV4 infrastructure
- Minimal KYC requirements for Phase 1
- Focus on core trading experience

---

## 2. Technical Architecture

### Smart Contracts (Minimal Phase 1)
```
Phase 1 Contracts:
├── CIRXToken.sol                    // Basic ERC20 CIRX token
├── SimpleOTCSwap.sol               // Basic swap logic using V4
├── VestingContract.sol             // 6-month linear vesting
└── PriceOracle.sol                 // Simple price feeds
```

### Frontend Stack
```
Framework:      Nuxt.js 3 (existing)
UI:             Nuxt UI + Tailwind (existing)
Web3:           Viem + Wagmi
Charts:         Lightweight alternative (not full TradingView)
Deployment:     Cloudflare Pages (existing)
```

---

## 3. User Interface Design

### Layout (Matcha/Jupiter Inspired)
```
Header: Logo + Wallet Connection Status
Main Content:
├── Trading Panel (60%)
│   ├── Tab 1: "Buy Liquid" (immediate delivery)
│   ├── Tab 2: "Buy OTC" (vested with discount)
│   ├── Token Input (ETH/USDC/USDT/SOL)
│   ├── CIRX Output (calculated)
│   ├── Price Display + Discount % (OTC tab)
│   └── Swap Button
└── Chart Panel (40%)
    ├── Simple Price Chart
    ├── Recent Trades
    └── Transaction Status
```

### Tab Differences
**Liquid Tab:**
- Immediate swap at market rate
- Standard fees (0.3%)
- No lockup period

**OTC Tab:**
- 6-month vesting period
- 5-15% discount based on amount
- Linear unlock starting immediately
- Visual vesting schedule

---

## 4. Core Functionality

### 4.1 Wallet Integration
- **MetaMask**: Primary Ethereum wallet
- **Phantom**: Solana support (future)
- **WalletConnect**: Universal wallet support
- **Manual Address**: Paste address option (no connection needed)

### 4.2 Swap Flow
1. Select tab (Liquid/OTC)
2. Choose input token (ETH/USDC/USDT)
3. Enter amount
4. View calculated CIRX output + fees/discount
5. Review transaction details
6. Sign and execute

### 4.3 Vesting Logic (OTC Tab)
```solidity
struct VestingPosition {
    uint256 totalAmount;      // Total CIRX purchased
    uint256 startTime;        // Purchase timestamp
    uint256 claimedAmount;    // Already claimed
}

// 6-month linear vesting
function getClaimableAmount(address user) external view returns (uint256) {
    VestingPosition memory position = positions[user];
    uint256 elapsed = block.timestamp - position.startTime;
    uint256 vestingPeriod = 180 days; // 6 months
    
    if (elapsed >= vestingPeriod) {
        return position.totalAmount - position.claimedAmount;
    }
    
    uint256 vested = (position.totalAmount * elapsed) / vestingPeriod;
    return vested - position.claimedAmount;
}
```

---

## 5. Implementation Plan

### Week 1-2: Foundation
- [ ] Set up CIRX token contract
- [ ] Basic swap contract using V4
- [ ] Update frontend for dual tabs
- [ ] Basic wallet integration

### Week 3-4: Core Features
- [ ] Implement liquid swaps
- [ ] Add vesting contract
- [ ] OTC discount calculation
- [ ] Price display and quotes

### Week 5-6: Polish
- [ ] Error handling
- [ ] Transaction history
- [ ] Basic chart integration
- [ ] Mobile responsiveness

### Week 7-8: Testing & Deploy
- [ ] Local testing with Anvil
- [ ] Testnet deployment
- [ ] User testing
- [ ] Production deployment

---

## 6. Success Criteria

### Minimum Viable Product (MVP)
- [ ] Both tabs functional (liquid/OTC)
- [ ] At least ETH → CIRX swaps working
- [ ] Vesting positions trackable
- [ ] Mobile-friendly interface
- [ ] <3 second swap confirmation

### Phase 1 Goals
- 50+ test users
- $100K+ test volume
- <5% error rate
- Basic analytics working

---

## 7. Technical Specifications

### Supported Tokens (Phase 1)
```
Input Tokens:
- ETH (native)
- USDC
- USDT

Output Token:
- CIRX (new ERC20)
```

### Discount Structure (OTC Tab)
```
$1K - $10K:    5% discount
$10K - $50K:   8% discount  
$50K+:         12% discount
```

### Fee Structure
```
Liquid Swaps:  0.3% fee
OTC Swaps:     0.15% fee (50% reduction)
```

---

## 8. File Structure

### Smart Contracts (`/src/`)
```
src/
├── tokens/
│   └── CIRXToken.sol
├── swap/
│   ├── SimpleOTCSwap.sol
│   └── PriceOracle.sol
├── vesting/
│   └── VestingContract.sol
└── interfaces/
    └── IOTC.sol
```

### Frontend Updates (`/ui/`)
```
ui/pages/
├── swap.vue              // Update existing with tabs
└── vesting.vue           // New vesting dashboard

ui/components/
├── OTCTabs.vue          // Tab switcher
├── LiquidSwap.vue       // Liquid swap form
├── VestedSwap.vue       // OTC swap form
└── VestingDashboard.vue // Vesting positions
```

---

## 9. Dependencies & Risks

### External Dependencies
- UniswapV4 core contracts (already installed)
- Price oracle (Chainlink or simple aggregator)
- Wallet connection libraries

### Main Risks
- V4 integration complexity
- Vesting contract security
- Price oracle reliability
- User experience complexity

### Mitigations
- Start with simple V4 usage
- Audit vesting contract thoroughly
- Use proven oracle solutions
- Extensive user testing

---

## 10. Next Steps

1. **Create CIRX token contract** - Basic ERC20 with proper metadata
2. **Implement simple V4 integration** - Direct pool interaction
3. **Build dual-tab interface** - Update existing swap.vue
4. **Add vesting logic** - Separate contract for OTC purchases
5. **Test end-to-end** - Full user flow testing

This Phase 1 PRP focuses on delivering the core functionality specified in the original requirements document without over-engineering. Once this foundation is solid, we can iterate and add more advanced features.

---

*This PRP represents a practical, achievable Phase 1 that directly implements the requirements from the Circular CIRX OTC Purchase Form PRD.*