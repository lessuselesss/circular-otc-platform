# Archive Directory

This directory contains code that was removed from the active codebase to eliminate code slop but preserved for reference.

## Components Archived

### Wallet Components (Duplicates/Unused)
- **`WalletConnectButton.vue`** - Broken component that references non-existent `AccountModal` and `WalletSelectionModal`
- **`WalletConnector.vue`** - Complex tab-based wallet selector, unused in production
- **`WalletConnect.vue`** - Simplified wallet component, unused in production  
- **`WalletButton.vue`** - Basic wallet button, unused in production
- **`MetaMaskButton.vue`** - MetaMask-specific button, unused in production
- **`SwapHeader.vue`** - Header component that used broken `WalletConnectButton`

### Pages Archived

- **`swap-new.vue`** - Alternative swap page implementation using `SwapHeader` (unused)
- **`test-metamask.vue`** - Test page for wallet integration, not needed in production

### Documentation Archived

- **`WALLET_INTEGRATION.md`** - Outdated multi-wallet documentation (described Phantom/WalletConnect support that was removed)

## Current Active Implementation

**Active Wallet Component:** `MultiWalletButton.vue`
- Used in: `index.vue`, `swap.vue`, `history.vue`, `test-metamask.vue`
- Features: Direct MetaMask connection, no unnecessary modals, real wallet store integration
- Status: ✅ Working and maintained

## Why These Were Archived

1. **Code Slop Elimination**: Multiple components doing the same job creates maintenance burden
2. **Broken Dependencies**: Some components referenced non-existent modals  
3. **Unused Code**: Components not imported/used anywhere in production
4. **Consolidation**: Simplified to single working wallet component

## Archive Date

Archived: 2025-08-04
Reason: Code slop cleanup initiative - consolidate duplicate wallet components