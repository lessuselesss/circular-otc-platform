import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * Unified wallet store with MetaMask enabled
 */
export const useWalletStore = defineStore('wallet', () => {
  // Global wallet state
  const activeChain = ref(null) // 'ethereum' | 'solana'
  const isInitialized = ref(false)
  const globalError = ref(null)
  const lastActivity = ref(Date.now())

  // MetaMask state
  const metaMaskWallet = ref(null)
  const metaMaskConnected = ref(false)

  // Connection states
  const isConnecting = ref(false)
  const isConnected = computed(() => metaMaskConnected.value)

  // Active wallet information
  const activeWallet = computed(() => {
    if (metaMaskConnected.value && metaMaskWallet.value) {
      return {
        type: 'metamask',
        address: metaMaskWallet.value.account,
        chain: 'ethereum'
      }
    }
    return null
  })

  // Available wallets
  const availableWallets = computed(() => {
    const wallets = []
    
    // MetaMask is always available (will show install prompt if needed)
    wallets.push({
      type: 'metamask',
      name: 'MetaMask',
      chain: 'ethereum',
      available: true
    })
    
    return wallets
  })

  // Error aggregation
  const currentError = computed(() => globalError.value)

  // Connection methods
  const connectWallet = async (walletType, chain = 'ethereum') => {
    if (walletType === 'metamask' && chain === 'ethereum') {
      return await connectMetaMask()
    } else if (walletType === 'phantom') {
      console.warn('Phantom wallet connection is currently disabled.')
      globalError.value = 'Phantom wallet connection is currently disabled.'
      throw new Error('Phantom wallet functionality disabled')
    } else {
      console.warn(`Wallet connection for ${walletType} on ${chain} is not supported.`)
      globalError.value = `Wallet connection for ${walletType} on ${chain} is not supported.`
      throw new Error('Unsupported wallet')
    }
  }

  // MetaMask connection logic
  const connectMetaMask = async () => {
    try {
      isConnecting.value = true
      globalError.value = null

      // Import MetaMask composable dynamically
      const { useMetaMask } = await import('../composables/useMetaMask.js')
      const metaMask = useMetaMask()
      
      const success = await metaMask.connect()
      
      if (success) {
        metaMaskWallet.value = metaMask
        metaMaskConnected.value = true
        activeChain.value = 'ethereum'
        updateActivity()
        
        console.log('✅ MetaMask connected successfully')
        return { success: true, wallet: metaMask }
      } else {
        throw new Error('Failed to connect to MetaMask')
      }
    } catch (error) {
      console.error('❌ MetaMask connection failed:', error)
      globalError.value = error.message || 'Failed to connect to MetaMask'
      throw error
    } finally {
      isConnecting.value = false
    }
  }

  const disconnectWallet = async (clearPreference = true) => {
    try {
      if (metaMaskConnected.value && metaMaskWallet.value) {
        await metaMaskWallet.value.disconnect()
        metaMaskWallet.value = null
        metaMaskConnected.value = false
        activeChain.value = null
        globalError.value = null
        console.log('✅ MetaMask disconnected successfully')
      }
      
      if (clearPreference) {
        clearConnectionPreference()
      }
    } catch (error) {
      console.error('❌ Failed to disconnect wallet:', error)
      globalError.value = error.message || 'Failed to disconnect wallet'
      throw error
    }
  }

  const disconnectAll = async (clearPreference = true) => {
    return await disconnectWallet(clearPreference)
  }

  const switchChain = async (chainId) => {
    if (metaMaskConnected.value && metaMaskWallet.value) {
      try {
        await metaMaskWallet.value.switchToMainnet()
        console.log('✅ Chain switched successfully')
        return true
      } catch (error) {
        console.error('❌ Failed to switch chain:', error)
        globalError.value = error.message || 'Failed to switch chain'
        throw error
      }
    } else {
      console.warn('No wallet connected for chain switching')
      globalError.value = 'No wallet connected for chain switching'
      throw new Error('No wallet connected')
    }
  }

  const refreshBalance = async () => {
    if (metaMaskConnected.value && metaMaskWallet.value) {
      try {
        await metaMaskWallet.value.updateBalance()
        console.log('✅ Balance refreshed successfully')
      } catch (error) {
        console.error('❌ Failed to refresh balance:', error)
        globalError.value = error.message || 'Failed to refresh balance'
        throw error
      }
    } else {
      console.warn('No wallet connected for balance refresh')
      globalError.value = 'No wallet connected for balance refresh'
      throw new Error('No wallet connected')
    }
  }

  const attemptAutoReconnect = async () => {
    try {
      // Check if MetaMask was previously connected
      if (typeof window !== 'undefined' && window.ethereum) {
        const { useMetaMask } = await import('../composables/useMetaMask.js')
        const metaMask = useMetaMask()
        
        // Check if already connected
        await metaMask.checkConnection()
        
        if (metaMask.isConnected.value) {
          metaMaskWallet.value = metaMask
          metaMaskConnected.value = true
          activeChain.value = 'ethereum'
          updateActivity()
          console.log('✅ MetaMask auto-reconnected')
          return true
        }
      }
      return false
    } catch (error) {
      console.error('❌ Auto-reconnect failed:', error)
      return false
    }
  }

  // Initialization (simplified)
  const initialize = async () => {
    if (isInitialized.value) {
      return
    }
    console.log('✅ Wallet store initialized (wallet functionality disabled)')
    isInitialized.value = true
  }

  // Error management
  const clearErrors = () => {
    globalError.value = null
  }

  const clearError = () => {
    clearErrors()
  }

  // Activity tracking
  const updateActivity = () => {
    lastActivity.value = Date.now()
  }

  // Persistence helpers (simplified to no-ops)
  const saveConnectionPreference = (walletType, chain) => {}
  const getConnectionPreference = () => null
  const clearConnectionPreference = () => {}

  // Utility functions (simplified)
  const getWalletIcon = (walletType, chain) => '/icons/wallet-generic.svg'

  const validateWalletForToken = (tokenSymbol) => {
    // Ethereum tokens require MetaMask
    const ethereumTokens = ['ETH', 'USDC', 'USDT', 'CIRX']
    
    if (ethereumTokens.includes(tokenSymbol)) {
      if (!metaMaskConnected.value) {
        throw new Error(`${tokenSymbol} requires MetaMask wallet connection`)
      }
      return true
    }
    
    // Solana tokens are disabled for now
    const solanaTokens = ['SOL', 'USDC_SOL']
    if (solanaTokens.includes(tokenSymbol)) {
      throw new Error(`${tokenSymbol} trading is currently disabled`)
    }
    
    throw new Error(`Unsupported token: ${tokenSymbol}`)
  }

  // Cleanup
  const cleanup = () => {
    if (metaMaskWallet.value) {
      metaMaskWallet.value.cleanup?.()
    }
    metaMaskWallet.value = null
    metaMaskConnected.value = false
    activeChain.value = null
    globalError.value = null
    isInitialized.value = false
  }

  // Return store interface
  return {
    // State
    activeChain,
    isInitialized,
    isConnecting,
    isConnected,
    activeWallet,
    availableWallets,
    currentError,
    lastActivity,

    // Actions
    connectWallet,
    disconnectWallet,
    disconnectAll,
    switchChain,
    refreshBalance,
    attemptAutoReconnect,
    initialize,
    clearError,
    validateWalletForToken,
    cleanup,

    // Utilities
    updateActivity,
    getConnectionPreference,
    clearConnectionPreference
  }
})