# Multi-Wallet Integration Guide

## Overview

The Circular CIRX OTC Platform supports three major wallet types, providing users with maximum flexibility for their preferred blockchain ecosystems:

- **MetaMask** - Ethereum and EVM-compatible chains
- **Phantom** - Solana blockchain 
- **WalletConnect** - Universal protocol supporting 100+ wallet apps

## Features

### ✅ Complete Implementation

- **Auto-detection** of installed wallets
- **Seamless switching** between different wallet types
- **Chain-specific token support** (ETH/USDC for Ethereum, SOL/USDC for Solana)
- **Real-time balance updates** across all wallet types
- **Transaction execution** with wallet-specific protocols
- **Network validation** and switching capabilities
- **Error handling** with clear user feedback

### 🎯 User Experience

- **One-click connection** for each wallet type
- **Installation prompts** for missing wallets
- **Visual wallet indicators** in connected state
- **Contextual token options** based on connected wallet
- **Unified transaction interface** regardless of wallet type

## Wallet Support Details

### MetaMask Integration
- **Chains**: Ethereum Mainnet, Sepolia Testnet, Local Development
- **Tokens**: ETH, USDC, USDT → CIRX
- **Features**: Network switching, automatic chain detection, gas estimation
- **Transaction Types**: EIP-1559 compatible transactions

### Phantom Integration  
- **Chain**: Solana Mainnet/Devnet
- **Tokens**: SOL, USDC → CIRX
- **Features**: Account monitoring, transaction signing
- **Transaction Types**: Solana program instructions

### WalletConnect Integration
- **Compatibility**: 100+ mobile and desktop wallets
- **Chains**: Ethereum and EVM-compatible
- **Features**: QR code connection, mobile wallet support
- **Transaction Types**: Standard Ethereum transactions

## Implementation Architecture

### Core Composable: `useMultiWallet()`

```javascript
// Main composable providing unified wallet interface
const {
  isConnected,           // boolean - wallet connection status
  connectedWallet,       // string - 'metamask' | 'phantom' | 'walletconnect'
  account,               // string - wallet address
  balance,               // string - native token balance
  chainId,               // number|string - chain identifier
  
  // Wallet availability
  isMetaMaskInstalled,   // boolean
  isPhantomInstalled,    // boolean
  isWalletConnectAvailable, // boolean (always true)
  
  // Connection methods
  connectMetaMask,       // () => Promise<boolean>
  connectPhantom,        // () => Promise<boolean>
  connectWalletConnect,  // () => Promise<boolean>
  disconnect,            // () => Promise<void>
  
  // Utility methods
  getTokenBalance,       // (symbol: string) => string
  executeSwap,           // (from, amount, to, isOTC) => Promise<TxResult>
  switchToMainnet,       // () => Promise<boolean> (Ethereum only)
  updateBalance          // () => Promise<void>
} = useMultiWallet()
```

### Component: `MultiWalletButton.vue`

```vue
<!-- Unified wallet connection interface -->
<MultiWalletButton />
```

**Features:**
- Modal with all wallet options
- Installation status indicators  
- Connection state management
- Error display and handling
- Network warnings
- Wallet-specific icons and branding

## Testing

### Test Page: `/test-metamask`

Visit `http://localhost:3000/test-metamask` to test all wallet integrations:

**Test Functions:**
- Wallet detection and installation status
- Connection/disconnection flows
- Balance fetching and updates
- Transaction simulation (both liquid and OTC)
- Network switching (Ethereum)
- Error handling scenarios

### Manual Testing Checklist

#### MetaMask Testing
- [ ] Install/detect MetaMask browser extension
- [ ] Connect to Ethereum Mainnet
- [ ] Switch to Sepolia testnet
- [ ] Check ETH balance display
- [ ] Execute test swap transaction
- [ ] Handle account switching
- [ ] Test disconnection

#### Phantom Testing  
- [ ] Install/detect Phantom browser extension
- [ ] Connect to Solana network
- [ ] Check SOL balance display
- [ ] Execute test swap transaction
- [ ] Handle account switching
- [ ] Test disconnection

#### WalletConnect Testing
- [ ] Test QR code generation (mock)
- [ ] Simulate mobile wallet connection
- [ ] Verify transaction flow
- [ ] Test session management

## Production Deployment

### Environment Variables

```bash
# Optional - WalletConnect Project ID for production
NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional - RPC endpoints for better reliability
NUXT_PUBLIC_INFURA_KEY=your_infura_key
NUXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key

# Contract addresses (set after deployment)
NUXT_PUBLIC_CIRX_TOKEN_ADDRESS=0x...
NUXT_PUBLIC_OTC_SWAP_ADDRESS=0x...
NUXT_PUBLIC_VESTING_ADDRESS=0x...
```

### Performance Considerations

- **Bundle Size**: Each wallet connector adds ~50KB gzipped
- **Load Time**: Lazy loading of wallet SDKs
- **RPC Calls**: Batched balance updates to minimize API usage
- **Caching**: Wallet states persisted across page reloads

### Security Best Practices

- **No Private Keys**: Never store or transmit private keys
- **Secure RPC**: Use HTTPS endpoints for all blockchain calls  
- **Input Validation**: Sanitize all user inputs before transactions
- **Error Handling**: Never expose sensitive error details
- **CSP Headers**: Content Security Policy for XSS protection

## Troubleshooting

### Common Issues

**MetaMask Connection Fails**
```
Error: User rejected the request
Solution: Ensure user clicks "Connect" in MetaMask popup
```

**Phantom Not Detected**
```
Error: window.solana is undefined
Solution: Ensure Phantom extension is installed and enabled
```

**Wrong Network**
```
Error: Unsupported chain ID
Solution: Use switchToMainnet() or prompt user to switch manually
```

**Transaction Fails**
```
Error: Insufficient funds for gas
Solution: Check balance includes gas fees, suggest lower amount
```

### Debug Mode

Enable debug logging in development:

```javascript
// In useMultiWallet.js, uncomment console.log statements
console.log('🔄 Wallet state:', { isConnected, connectedWallet, account })
```

## Future Enhancements

### Phase 2 Features
- **Hardware Wallet Support**: Ledger, Trezor integration
- **Multi-Chain Swaps**: Cross-chain CIRX purchases  
- **Wallet Aggregator**: Integrate with Rainbow, Frame, etc.
- **Mobile Optimization**: Native mobile app wallet connections
- **Gas Optimization**: Smart gas fee estimation and batching

### Advanced Features
- **Account Abstraction**: Gasless transactions for users
- **Social Recovery**: Email/phone based wallet recovery
- **DeFi Integration**: Yield farming with CIRX tokens
- **NFT Support**: CIRX holder exclusive NFTs
- **DAO Integration**: Governance token voting

## Technical Notes

### Browser Compatibility
- **Chrome/Edge**: Full support for all wallet types
- **Firefox**: Full support for all wallet types  
- **Safari**: MetaMask and WalletConnect only (Phantom limited)
- **Mobile Browsers**: WalletConnect recommended

### Network Support Matrix

| Wallet | Ethereum | Polygon | BSC | Arbitrum | Solana |
|--------|----------|---------|-----|----------|--------|
| MetaMask | ✅ | ✅ | ✅ | ✅ | ❌ |
| Phantom | ❌ | ❌ | ❌ | ❌ | ✅ |
| WalletConnect | ✅ | ✅ | ✅ | ✅ | ⚠️ |

## Support

For wallet integration issues:

1. **Check Installation**: Ensure wallet browser extension is installed
2. **Verify Network**: Confirm correct network/chain selection
3. **Clear Cache**: Reset browser cache and wallet permissions
4. **Test Environment**: Use test page at `/test-metamask`
5. **Error Logs**: Check browser console for detailed error messages

The multi-wallet integration provides a robust, user-friendly foundation for the Circular CIRX OTC Platform with support for the most popular Web3 wallets across Ethereum and Solana ecosystems.