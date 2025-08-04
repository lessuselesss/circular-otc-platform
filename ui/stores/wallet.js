import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useEthereumWallet } from '~/composables/useEthereumWallet'
import { useSolanaWallet } from '~/composables/useSolanaWallet'

/**
 * Unified wallet store that coordinates between Ethereum and Solana wallets
 * Provides a single interface for the UI to interact with multiple wallet types
 * Prevents conflicts and manages cross-chain operations
 */
export const useWalletStore = defineStore('wallet', () => {
  // Initialize wallet providers
  const ethereumWallet = useEthereumWallet()
  const solanaWallet = useSolanaWallet()

  // Global wallet state
  const activeChain = ref(null) // 'ethereum' | 'solana'
  const isInitialized = ref(false)
  const globalError = ref(null)
  const lastActivity = ref(Date.now())

  // Connection states
  const isConnecting = computed(() => {
    return ethereumWallet.isConnecting.value || solanaWallet.isConnecting.value
  })

  const isConnected = computed(() => {
    return ethereumWallet.isConnected.value || solanaWallet.isConnected.value
  })

  // Active wallet information
  const activeWallet = computed(() => {
    if (ethereumWallet.isConnected.value) {
      return {
        chain: 'ethereum',
        type: ethereumWallet.connectedWalletType.value,
        address: ethereumWallet.address.value,
        shortAddress: ethereumWallet.shortAddress.value,
        balance: ethereumWallet.balance.value,
        chainId: ethereumWallet.chainId.value,
        chainInfo: ethereumWallet.currentChain.value,
        isOnSupportedChain: ethereumWallet.isOnSupportedChain.value
      }
    }

    if (solanaWallet.isConnected.value) {
      return {
        chain: 'solana',
        type: solanaWallet.walletType.value,
        address: solanaWallet.address.value,
        shortAddress: solanaWallet.shortAddress.value,
        balance: solanaWallet.balance.value,
        chainId: null,
        chainInfo: { name: 'Solana', symbol: 'SOL' },
        isOnSupportedChain: true
      }
    }

    return null
  })

  // Available wallets across both chains
  const availableWallets = computed(() => {
    const wallets = []

    // Add Ethereum wallets
    ethereumWallet.availableWallets.value.forEach(wallet => {
      wallets.push({
        ...wallet,
        chain: 'ethereum',
        icon: getWalletIcon(wallet.type, 'ethereum')
      })
    })

    // Add Solana wallets
    solanaWallet.availableWallets.value.forEach(wallet => {
      wallets.push({
        ...wallet,
        chain: 'solana',
        icon: getWalletIcon(wallet.type, 'solana')
      })
    })

    return wallets
  })

  // Error aggregation
  const currentError = computed(() => {
    return globalError.value || 
           ethereumWallet.error.value || 
           solanaWallet.error.value
  })

  // Connection methods
  const connectWallet = async (walletType, chain) => {
    try {
      clearErrors()
      updateActivity()

      // Disconnect any existing connections first to prevent conflicts
      await disconnectAll(false)

      let result
      if (chain === 'ethereum') {
        result = await ethereumWallet.connectEthereumWallet(walletType)
        activeChain.value = 'ethereum'
      } else if (chain === 'solana') {
        result = await solanaWallet.connectSolanaWallet(walletType)
        activeChain.value = 'solana'
      } else {
        throw new Error(`Unsupported chain: ${chain}`)
      }

      // Save global preferences
      saveConnectionPreference(walletType, chain)

      return {
        success: true,
        chain,
        walletType,
        address: result.address,
        ...result
      }

    } catch (error) {
      console.error(`Failed to connect ${walletType} on ${chain}:`, error)
      globalError.value = error.message
      throw error
    }
  }

  const disconnectWallet = async (clearPreference = true) => {
    try {
      updateActivity()
      
      const results = await Promise.allSettled([
        ethereumWallet.disconnectEthereumWallet(),
        solanaWallet.disconnectSolanaWallet()
      ])

      // Check if any disconnection failed
      const failures = results.filter(result => result.status === 'rejected')
      if (failures.length > 0) {
        console.warn('Some wallet disconnections failed:', failures)
      }

      // Reset global state
      activeChain.value = null
      clearErrors()

      if (clearPreference) {
        clearConnectionPreference()
      }

      return { success: true }

    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      globalError.value = error.message
      throw error
    }
  }

  const disconnectAll = async (clearPreference = true) => {
    return await disconnectWallet(clearPreference)
  }

  // Chain switching (Ethereum only)
  const switchChain = async (chainId) => {
    try {
      if (activeChain.value !== 'ethereum') {
        throw new Error('Chain switching only available for Ethereum wallets')
      }

      updateActivity()
      const result = await ethereumWallet.switchToChain(chainId)
      return result

    } catch (error) {
      console.error(`Failed to switch to chain ${chainId}:`, error)
      globalError.value = error.message
      throw error
    }
  }

  // Balance refresh
  const refreshBalance = async () => {
    try {
      updateActivity()

      if (activeChain.value === 'solana') {
        await solanaWallet.refreshBalance()
      }
      // Ethereum balance is automatically updated by Wagmi

      return { success: true }

    } catch (error) {
      console.error('Failed to refresh balance:', error)
      globalError.value = error.message
      throw error
    }
  }

  // Auto-reconnection
  const attemptAutoReconnect = async () => {
    if (isConnected.value) {
      return true
    }

    try {
      const preference = getConnectionPreference()
      if (!preference) {
        return false
      }

      const { walletType, chain } = preference

      let success = false
      if (chain === 'ethereum') {
        success = await ethereumWallet.attemptAutoReconnect()
      } else if (chain === 'solana') {
        success = await solanaWallet.attemptAutoReconnect()
      }

      if (success) {
        activeChain.value = chain
      }

      return success

    } catch (error) {
      console.warn('Auto-reconnect failed:', error)
      clearConnectionPreference()
      return false
    }
  }

  // Initialization
  const initialize = async () => {
    if (isInitialized.value) {
      return
    }

    try {
      clearErrors()
      
      // Wait a bit for browser environment to be fully ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Attempt auto-reconnection with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auto-reconnect timeout')), 5000)
      )
      
      try {
        await Promise.race([attemptAutoReconnect(), timeoutPromise])
      } catch (reconnectError) {
        console.warn('Auto-reconnect failed or timed out:', reconnectError)
        // Continue initialization even if auto-reconnect fails
      }
      
      isInitialized.value = true
      console.log('✅ Wallet store initialized')

    } catch (error) {
      console.error('❌ Wallet store initialization failed:', error)
      // Don't set globalError here to prevent critical error dialog
      // Just log and continue - the app should work without wallet connectivity
      isInitialized.value = true // Mark as initialized to prevent retries
    }
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

  // Persistence helpers
  const saveConnectionPreference = (walletType, chain) => {
    if (typeof window !== 'undefined') {
      const preference = { walletType, chain, timestamp: Date.now() }
      localStorage.setItem('wallet-connection-preference', JSON.stringify(preference))
    }
  }

  const getConnectionPreference = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wallet-connection-preference')
        if (stored) {
          const preference = JSON.parse(stored)
          
          // Expire preferences older than 7 days
          const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
          if (Date.now() - preference.timestamp > maxAge) {
            clearConnectionPreference()
            return null
          }

          return preference
        }
      } catch (error) {
        console.warn('Failed to parse wallet preference:', error)
        clearConnectionPreference()
      }
    }
    return null
  }

  const clearConnectionPreference = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wallet-connection-preference')
    }
  }

  // Utility functions
  const getWalletIcon = (walletType, chain) => {
    const icons = {
      ethereum: {
        metamask: '/icons/metamask.svg',
        walletconnect: '/icons/walletconnect.svg',
        coinbase: '/icons/coinbase.svg'
      },
      solana: {
        phantom: '/icons/phantom.svg',
        solflare: '/icons/solflare.svg'
      }
    }

    return icons[chain]?.[walletType] || '/icons/wallet-generic.svg'
  }

  const validateWalletForToken = (tokenSymbol) => {
    if (!isConnected.value) {
      throw new Error('No wallet connected')
    }

    const ethereumTokens = ['ETH', 'USDC', 'USDT', 'CIRX']
    const solanaTokens = ['SOL']

    if (ethereumTokens.includes(tokenSymbol) && activeChain.value !== 'ethereum') {
      throw new Error(`${tokenSymbol} requires an Ethereum wallet`)
    }

    if (solanaTokens.includes(tokenSymbol) && activeChain.value !== 'solana') {
      throw new Error(`${tokenSymbol} requires a Solana wallet`)
    }

    return true
  }

  // Cleanup
  const cleanup = () => {
    solanaWallet.cleanup()
    activeChain.value = null
    globalError.value = null
    isInitialized.value = false
  }

  // Watch for connection changes to update activeChain
  watch(
    [ethereumWallet.isConnected, solanaWallet.isConnected],
    ([ethConnected, solConnected]) => {
      if (ethConnected && !solConnected) {
        activeChain.value = 'ethereum'
      } else if (solConnected && !ethConnected) {
        activeChain.value = 'solana'
      } else if (!ethConnected && !solConnected) {
        activeChain.value = null
      }
      // If both are connected (shouldn't happen), maintain current activeChain
    }
  )

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

    // Direct access to wallet providers for advanced usage
    ethereumWallet,
    solanaWallet,

    // Utilities
    updateActivity,
    getConnectionPreference,
    clearConnectionPreference
  }
})