import { computed, ref, watch } from 'vue'
import { 
  useAccount, 
  useBalance, 
  useConnect, 
  useDisconnect, 
  useChainId,
  useSwitchChain,
  useConnectorClient
} from '@wagmi/vue'
import { formatEther } from 'viem'

/**
 * Clean Ethereum wallet provider using Wagmi
 * Handles only Ethereum-based wallets (MetaMask, WalletConnect, Coinbase)
 * Separated from Solana and transaction logic
 */
export function useEthereumWallet() {
  // Wagmi hooks for Ethereum wallet management
  const { address, isConnected, connector } = useAccount()
  const { data: balance } = useBalance({ address })
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { data: walletClient } = useConnectorClient()
  // Note: usePublicClient not available in @wagmi/vue 0.1.25
  // Use walletClient for most operations or upgrade to newer version

  // Local state for connection management
  const lastConnectedWallet = ref(null)
  const connectionAttempts = ref(0)
  const maxRetries = 3

  // Supported chains configuration
  const SUPPORTED_CHAINS = {
    1: { name: 'Ethereum', symbol: 'ETH' },
    11155111: { name: 'Sepolia', symbol: 'ETH' },
    8453: { name: 'Base', symbol: 'ETH' },
    42161: { name: 'Arbitrum', symbol: 'ETH' }
  }

  // Computed properties
  const connectedWalletType = computed(() => {
    if (!isConnected.value || !connector.value) return null
    
    const connectorName = connector.value.name.toLowerCase()
    if (connectorName.includes('metamask')) return 'metamask'
    if (connectorName.includes('walletconnect')) return 'walletconnect'
    if (connectorName.includes('coinbase')) return 'coinbase'
    return 'unknown'
  })

  const shortAddress = computed(() => {
    if (!address.value) return ''
    return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
  })

  const formattedBalance = computed(() => {
    if (!balance.value) return '0'
    return formatEther(balance.value.value)
  })

  const currentChain = computed(() => {
    return SUPPORTED_CHAINS[chainId.value] || null
  })

  const isOnSupportedChain = computed(() => {
    return Object.keys(SUPPORTED_CHAINS).includes(chainId.value?.toString())
  })

  // Wallet availability checks
  const availableWallets = computed(() => {
    const wallets = []
    
    // Defensive check: ensure connectors.value exists and is an array
    if (!connectors.value || !Array.isArray(connectors.value)) {
      console.warn('⚠️ Connectors not available yet:', connectors.value)
      return wallets
    }
    
    connectors.value.forEach(connector => {
      const name = connector?.name?.toLowerCase() || ''
      if (name.includes('metamask')) {
        wallets.push({ type: 'metamask', name: 'MetaMask', connector })
      } else if (name.includes('walletconnect')) {
        wallets.push({ type: 'walletconnect', name: 'WalletConnect', connector })
      } else if (name.includes('coinbase')) {
        wallets.push({ type: 'coinbase', name: 'Coinbase Wallet', connector })
      }
    })
    
    return wallets
  })

  // Connection functions
  const connectEthereumWallet = async (walletType) => {
    try {
      // Reset connection attempts for new wallet type
      if (lastConnectedWallet.value !== walletType) {
        connectionAttempts.value = 0
      }

      if (connectionAttempts.value >= maxRetries) {
        throw new Error(`Maximum connection attempts (${maxRetries}) exceeded for ${walletType}`)
      }

      // Find the appropriate connector
      const targetWallet = availableWallets.value.find(wallet => wallet.type === walletType)
      
      if (!targetWallet) {
        throw new Error(`${walletType} wallet not available`)
      }

      connectionAttempts.value++
      lastConnectedWallet.value = walletType

      // Attempt connection
      await new Promise((resolve, reject) => {
        const unwatch = watch(
          [isConnected, connectError],
          ([connected, error]) => {
            if (connected) {
              unwatch()
              resolve()
            } else if (error) {
              unwatch()
              reject(error)
            }
          },
          { immediate: false }
        )

        // Start connection
        connect({ connector: targetWallet.connector })

        // Timeout after 30 seconds
        setTimeout(() => {
          unwatch()
          reject(new Error('Connection timeout'))
        }, 30000)
      })

      // Save successful connection preference
      saveWalletPreference(walletType)
      connectionAttempts.value = 0

      return {
        success: true,
        address: address.value,
        chainId: chainId.value,
        walletType
      }

    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error)
      
      // Reset attempts if we've hit the max
      if (connectionAttempts.value >= maxRetries) {
        connectionAttempts.value = 0
        lastConnectedWallet.value = null
      }

      throw error
    }
  }

  const disconnectEthereumWallet = async () => {
    try {
      if (isConnected.value) {
        await disconnect()
      }
      
      // Clear preferences and reset state
      clearWalletPreference()
      connectionAttempts.value = 0
      lastConnectedWallet.value = null

      return { success: true }
    } catch (error) {
      console.error('Failed to disconnect Ethereum wallet:', error)
      throw error
    }
  }

  const switchToChain = async (targetChainId) => {
    try {
      if (!isConnected.value) {
        throw new Error('No wallet connected')
      }

      if (!SUPPORTED_CHAINS[targetChainId]) {
        throw new Error(`Chain ${targetChainId} is not supported`)
      }

      if (chainId.value === targetChainId) {
        return { success: true, chainId: targetChainId }
      }

      await switchChain({ chainId: targetChainId })

      return { success: true, chainId: targetChainId }
    } catch (error) {
      console.error(`Failed to switch to chain ${targetChainId}:`, error)
      throw error
    }
  }

  // Persistence functions
  const saveWalletPreference = (walletType) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ethereum-wallet-preference', walletType)
    }
  }

  const getWalletPreference = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ethereum-wallet-preference')
    }
    return null
  }

  const clearWalletPreference = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ethereum-wallet-preference')
    }
  }

  // Auto-reconnection
  const attemptAutoReconnect = async () => {
    const preferredWallet = getWalletPreference()
    
    if (!preferredWallet || isConnected.value) {
      return false
    }

    try {
      await connectEthereumWallet(preferredWallet)
      return true
    } catch (error) {
      console.warn('Auto-reconnect failed:', error)
      clearWalletPreference()
      return false
    }
  }

  // Watch for unexpected disconnections
  watch(isConnected, (connected) => {
    if (!connected && lastConnectedWallet.value) {
      // Wallet was disconnected externally
      connectionAttempts.value = 0
      lastConnectedWallet.value = null
    }
  })

  // Return clean interface
  return {
    // Connection state
    isConnected,
    isConnecting,
    isSwitching,
    address,
    shortAddress,
    balance: formattedBalance,
    chainId,
    currentChain,
    isOnSupportedChain,
    connectedWalletType,
    
    // Available wallets
    availableWallets,
    
    // Connection methods
    connectEthereumWallet,
    disconnectEthereumWallet,
    switchToChain,
    attemptAutoReconnect,
    
    // Clients for advanced usage
    walletClient,
    
    // Error state
    error: connectError,
    
    // Configuration
    SUPPORTED_CHAINS,
    
    // Connection status
    connectionAttempts: computed(() => connectionAttempts.value),
    maxRetries
  }
}