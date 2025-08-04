/**
 * useWallet - Main wallet composable that aggregates multi-wallet functionality
 * Provides a unified interface for Ethereum and Solana wallets
 */

export const useWallet = () => {
  // Use the wallet store
  const walletStore = useWalletStore()
  
  // Mock balances for development (will be replaced with real contract calls)
  const mockBalances = {
    ETH: '2.5234',
    USDC: '1500.00',
    USDT: '750.50',
    SOL: '45.25',
    USDC_SOL: '850.75',
    CIRX: '0.00'
  }
  
  // Computed properties from store
  const isConnected = computed(() => walletStore.isConnected)
  const account = computed(() => walletStore.activeWallet?.address || null)
  const connectedWallet = computed(() => walletStore.activeWallet?.type || null)
  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  })
  
  // Mock balance based on connected wallet
  const balance = computed(() => {
    if (!isConnected.value) return '0.0'
    
    // Return different balance based on wallet type
    if (connectedWallet.value === 'phantom') {
      return mockBalances.SOL
    } else {
      return mockBalances.ETH
    }
  })
  
  // Get token balance
  const getTokenBalance = (token) => {
    if (!isConnected.value) return '0.0'
    
    // Adjust token based on connected wallet
    if (connectedWallet.value === 'phantom') {
      if (token === 'ETH') token = 'SOL'
      if (token === 'USDC') token = 'USDC_SOL'
    }
    
    return mockBalances[token] || '0.0'
  }
  
  // Execute swap (mock implementation)
  const executeSwap = async (fromToken, amount, toToken, isOTC = false) => {
    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock success
      return {
        success: true,
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        amount: amount,
        toToken: toToken,
        isOTC: isOTC
      }
    } catch (error) {
      console.error('Swap execution failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  return {
    // State
    isConnected,
    account,
    balance,
    connectedWallet,
    shortAddress,
    
    // Methods
    getTokenBalance,
    executeSwap,
    
    // Store methods
    connectWallet: walletStore.connectWallet,
    disconnectWallet: walletStore.disconnectWallet,
    clearError: walletStore.clearError
  }
}