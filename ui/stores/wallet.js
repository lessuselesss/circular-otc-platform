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

  // Selected token for balance display (header & elsewhere)
  const selectedToken = ref('ETH')

  // Wallet modal visibility (central control)
  const isWalletModalOpen = ref(false)

  // MetaMask state
  const metaMaskWallet = ref(null)
  const metaMaskConnected = ref(false)
  
  // Phantom state 
  const phantomWallet = ref(null)
  const phantomConnected = ref(false)

  // Connection states
  const isConnecting = ref(false)
  const isConnected = computed(() => metaMaskConnected.value || phantomConnected.value)

  // Connection control
  const connectTimeoutMs = 15000
  let connectCancelled = false
  const cancelConnect = () => {
    connectCancelled = true
    isConnecting.value = false
    if (!isConnected.value) {
      globalError.value = 'Connection cancelled'
    }
  }

  // Active wallet information
  const activeWallet = computed(() => {
    if (metaMaskConnected.value && metaMaskWallet.value) {
      return {
        type: 'metamask',
        address: metaMaskWallet.value.account?.value,
        chain: 'ethereum'
      }
    }
    if (phantomConnected.value && phantomWallet.value) {
      return {
        type: 'phantom',
        address: phantomWallet.value.account?.value,
        chain: 'solana'
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
    
    // Phantom is always available (will show install prompt if needed)
    wallets.push({
      type: 'phantom',
      name: 'Phantom',
      chain: 'solana',
      available: true
    })
    
    return wallets
  })

  // Error aggregation
  const currentError = computed(() => globalError.value)

  // Persistence helpers (localStorage)
  const STORAGE_KEY = 'walletPreference'
  const saveConnectionPreference = (walletType, chain) => {
    try {
      const pref = JSON.stringify({ walletType, chain })
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, pref)
    } catch {}
  }
  const getConnectionPreference = () => {
    try {
      if (typeof window === 'undefined') return null
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }
  const clearConnectionPreference = () => {
    try {
      if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  const withTimeout = (promise, ms, label = 'operation') => {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`${label} timed out`)), ms)
      promise.then((v) => { clearTimeout(t); resolve(v) }).catch((e) => { clearTimeout(t); reject(e) })
    })
  }

  // Connection methods
  const connectWallet = async (walletType, chain = 'ethereum') => {
    if (walletType === 'metamask' && chain === 'ethereum') {
      return await connectMetaMask()
    } else if (walletType === 'phantom' && chain === 'solana') {
      return await connectPhantom()
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
      connectCancelled = false
      globalError.value = null

      const { useMetaMask } = await import('../composables/useMetaMask.js')
      const metaMask = useMetaMask()
      
      const success = await withTimeout(metaMask.connect(), connectTimeoutMs, 'MetaMask connection')
      if (connectCancelled) throw new Error('Connection cancelled')
      
      if (success) {
        metaMaskWallet.value = metaMask
        metaMaskConnected.value = true
        activeChain.value = 'ethereum'
        updateActivity()
        saveConnectionPreference('metamask', 'ethereum')
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
  
  // Phantom connection logic
  const connectPhantom = async () => {
    try {
      isConnecting.value = true
      connectCancelled = false
      globalError.value = null

      const phantom = {
        account: ref(null),
        isConnected: ref(false),
        connect: async () => {
          if (typeof window === 'undefined' || !window.solana?.isPhantom) {
            throw new Error('Phantom wallet not found')
          }
          const response = await window.solana.connect()
          phantom.account.value = response.publicKey.toString()
          phantom.isConnected.value = true
          return true
        },
        disconnect: async () => {
          if (window.solana) { await window.solana.disconnect() }
          phantom.account.value = null
          phantom.isConnected.value = false
        }
      }
      
      const success = await withTimeout(phantom.connect(), connectTimeoutMs, 'Phantom connection')
      if (connectCancelled) throw new Error('Connection cancelled')
      
      if (success) {
        phantomWallet.value = phantom
        phantomConnected.value = true
        activeChain.value = 'solana'
        updateActivity()
        saveConnectionPreference('phantom', 'solana')
        console.log('✅ Phantom connected successfully')
        return { success: true, wallet: phantom }
      } else {
        throw new Error('Failed to connect to Phantom')
      }
    } catch (error) {
      console.error('❌ Phantom connection failed:', error)
      globalError.value = error.message || 'Failed to connect to Phantom'
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
        console.log('✅ MetaMask disconnected successfully')
      }
      
      if (phantomConnected.value && phantomWallet.value) {
        await phantomWallet.value.disconnect()
        phantomWallet.value = null
        phantomConnected.value = false
        console.log('✅ Phantom disconnected successfully')
      }
      
      if (!metaMaskConnected.value && !phantomConnected.value) {
        activeChain.value = null
      }
      
      globalError.value = null
      if (clearPreference) clearConnectionPreference()
    } catch (error) {
      console.error('❌ Failed to disconnect wallet:', error)
      globalError.value = error.message || 'Failed to disconnect wallet'
      throw error
    }
  }

  // Hard reset (disconnect, clear pref, cleanup state)
  const hardReset = async () => {
    try {
      await disconnectWallet(true)
    } catch {}
    cleanup()
  }

  // Disconnect specific wallet type
  const disconnectSpecificWallet = async (walletType) => {
    try {
      if (walletType === 'metamask' && metaMaskConnected.value && metaMaskWallet.value) {
        await metaMaskWallet.value.disconnect()
        metaMaskWallet.value = null
        metaMaskConnected.value = false
        console.log('✅ MetaMask disconnected specifically')
      } else if (walletType === 'phantom' && phantomConnected.value && phantomWallet.value) {
        await phantomWallet.value.disconnect()
        phantomWallet.value = null
        phantomConnected.value = false
        console.log('✅ Phantom disconnected specifically')
      }
      
      if (activeWallet.value?.type === walletType) {
        if (metaMaskConnected.value) {
          activeChain.value = 'ethereum'
        } else if (phantomConnected.value) {
          activeChain.value = 'solana'
        } else {
          activeChain.value = null
        }
      }
    } catch (error) {
      console.error(`❌ Failed to disconnect ${walletType}:`, error)
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
      let reconnected = false

      const pref = getConnectionPreference()
      if (pref?.walletType === 'metamask' && typeof window !== 'undefined' && window.ethereum) {
        try {
          const { useMetaMask } = await import('../composables/useMetaMask.js')
          const metaMask = useMetaMask()
          await metaMask.checkConnection()
          if (metaMask.isConnected.value) {
            metaMaskWallet.value = metaMask
            metaMaskConnected.value = true
            activeChain.value = 'ethereum'
            updateActivity()
            console.log('✅ MetaMask auto-reconnected via preference')
            reconnected = true
          }
        } catch {}
      } else if (pref?.walletType === 'phantom' && typeof window !== 'undefined' && window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true })
          if (response.publicKey) {
            const phantom = {
              account: ref(response.publicKey.toString()),
              isConnected: ref(true),
              disconnect: async () => { await window.solana.disconnect() }
            }
            phantomWallet.value = phantom
            phantomConnected.value = true
            activeChain.value = 'solana'
            updateActivity()
            console.log('✅ Phantom auto-reconnected via preference')
            reconnected = true
          }
        } catch {}
      }

      if (!reconnected && typeof window !== 'undefined' && window.ethereum) {
        const { useMetaMask } = await import('../composables/useMetaMask.js')
        const metaMask = useMetaMask()
        await metaMask.checkConnection()
        if (metaMask.isConnected.value) {
          metaMaskWallet.value = metaMask
          metaMaskConnected.value = true
          activeChain.value = 'ethereum'
          updateActivity()
          console.log('✅ MetaMask auto-reconnected')
          reconnected = true
        }
      }

      if (!reconnected && typeof window !== 'undefined' && window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true })
          if (response.publicKey) {
            const phantom = {
              account: ref(response.publicKey.toString()),
              isConnected: ref(true),
              disconnect: async () => { await window.solana.disconnect() }
            }
            phantomWallet.value = phantom
            phantomConnected.value = true
            if (!reconnected) activeChain.value = 'solana'
            updateActivity()
            console.log('✅ Phantom auto-reconnected')
            reconnected = true
          }
        } catch {}
      }

      return reconnected
    } catch (error) {
      console.error('❌ Auto-reconnect failed:', error)
      return false
    }
  }

  // Initialization (simplified)
  const initialize = async () => {
    if (isInitialized.value) return
    console.log('✅ Wallet store initialized')
    isInitialized.value = true
    try { await attemptAutoReconnect() } catch {}
  }

  // Error management
  const clearErrors = () => { globalError.value = null }
  const clearError = () => { clearErrors() }

  // Activity tracking
  const updateActivity = () => { lastActivity.value = Date.now() }

  // Modal controls
  const openWalletModal = () => { isWalletModalOpen.value = true }
  const closeWalletModal = () => { isWalletModalOpen.value = false }

  // Token selection setter
  const setSelectedToken = (tokenSymbol) => { selectedToken.value = tokenSymbol }

  // Utility functions (simplified)
  const getWalletIcon = (walletType, chain) => '/icons/wallet-generic.svg'

  const validateWalletForToken = (tokenSymbol) => {
    const ethereumTokens = ['ETH', 'USDC', 'USDT', 'CIRX']
    if (ethereumTokens.includes(tokenSymbol)) {
      if (!metaMaskConnected.value) {
        throw new Error(`${tokenSymbol} requires MetaMask wallet connection`)
      }
      return true
    }
    const solanaTokens = ['SOL', 'USDC_SOL']
    if (solanaTokens.includes(tokenSymbol)) {
      throw new Error(`${tokenSymbol} trading is currently disabled`)
    }
    throw new Error(`Unsupported token: ${tokenSymbol}`)
  }

  // Cleanup
  const cleanup = () => {
    if (metaMaskWallet.value) { metaMaskWallet.value.cleanup?.() }
    if (phantomWallet.value) { phantomWallet.value.disconnect?.() }
    metaMaskWallet.value = null
    metaMaskConnected.value = false
    phantomWallet.value = null
    phantomConnected.value = false
    activeChain.value = null
    globalError.value = null
    isInitialized.value = false
    isConnecting.value = false
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

    // Selected token & modal
    selectedToken,
    setSelectedToken,
    isWalletModalOpen,
    openWalletModal,
    closeWalletModal,

    // Wallet instances
    metaMaskWallet,
    phantomWallet,
    
    // Actions
    connectWallet,
    disconnectWallet,
    disconnectSpecificWallet,
    disconnectAll,
    switchChain,
    refreshBalance,
    attemptAutoReconnect,
    initialize,
    clearError,
    validateWalletForToken,
    cleanup,
    cancelConnect,
    hardReset,

    // Utilities
    updateActivity,
    getConnectionPreference,
    clearConnectionPreference
  }
})