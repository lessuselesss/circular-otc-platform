import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * Unified wallet store (simplified for build purposes)
 */
export const useWalletStore = defineStore('wallet', () => {
  // Global wallet state
  const activeChain = ref(null) // 'ethereum' | 'solana'
  const isInitialized = ref(false)
  const globalError = ref(null)
  const lastActivity = ref(Date.now())

  // Connection states (simplified)
  const isConnecting = computed(() => false)
  const isConnected = computed(() => false)

  // Active wallet information (simplified)
  const activeWallet = computed(() => null)

  // Available wallets (simplified)
  const availableWallets = computed(() => [])

  // Error aggregation (simplified)
  const currentError = computed(() => globalError.value)

  // Connection methods (simplified to no-ops)
  const connectWallet = async (walletType, chain) => {
    console.warn(`Wallet connection for ${walletType} on ${chain} is currently disabled.`)
    globalError.value = `Wallet connection for ${walletType} on ${chain} is currently disabled.`
    throw new Error('Wallet functionality disabled')
  }

  const disconnectWallet = async (clearPreference = true) => {
    console.warn('Wallet disconnection is currently disabled.')
    globalError.value = 'Wallet disconnection is currently disabled.'
    throw new Error('Wallet functionality disabled')
  }

  const disconnectAll = async (clearPreference = true) => {
    return await disconnectWallet(clearPreference)
  }

  const switchChain = async (chainId) => {
    console.warn(`Chain switching to ${chainId} is currently disabled.`)
    globalError.value = `Chain switching to ${chainId} is currently disabled.`
    throw new Error('Wallet functionality disabled')
  }

  const refreshBalance = async () => {
    console.warn('Balance refresh is currently disabled.')
    globalError.value = 'Balance refresh is currently disabled.'
    throw new Error('Wallet functionality disabled')
  }

  const attemptAutoReconnect = async () => {
    console.warn('Auto-reconnect is currently disabled.')
    return false
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
    console.warn(`Wallet validation for ${tokenSymbol} is currently disabled.`)
    throw new Error('Wallet functionality disabled')
  }

  // Cleanup (simplified)
  const cleanup = () => {
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