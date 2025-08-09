import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAppKit, useAppKitAccount, useAppKitNetwork, useAppKitState } from '@reown/appkit/vue'
import { useAccount, useBalance, useChainId, useDisconnect } from '@wagmi/vue'
import { formatUnits } from 'viem'

/**
 * Reown AppKit based wallet store
 * Provides unified access to multi-chain wallet functionality
 */
export const useReownWalletStore = defineStore('reownWallet', () => {
  // Reown AppKit composables
  const { open } = useAppKit()
  const { address, isConnected, isConnecting, isDisconnected } = useAppKitAccount()
  const { caipNetwork, chainId } = useAppKitNetwork()
  const { selectedNetworkId } = useAppKitState()

  // Wagmi composables for EVM chains
  const { address: wagmiAddress, connector } = useAccount()
  const { data: balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address: wagmiAddress,
  })
  const currentChainId = useChainId()
  const { disconnect } = useDisconnect()

  // Local state
  const isWalletModalOpen = ref(false)
  const selectedToken = ref('ETH')
  const lastActivity = ref(Date.now())
  const globalError = ref(null)

  // Computed properties
  const activeWallet = computed(() => {
    if (!isConnected.value || !address.value) return null
    
    return {
      type: getWalletType(),
      address: address.value,
      chain: getChainType(),
      chainId: chainId.value
    }
  })

  const currentError = computed(() => globalError.value)

  const availableWallets = computed(() => [
    {
      type: 'metamask',
      name: 'MetaMask',
      chain: 'ethereum',
      available: true // Reown handles availability detection
    },
    {
      type: 'walletconnect',
      name: 'WalletConnect',
      chain: 'ethereum',
      available: true
    },
    {
      type: 'coinbase',
      name: 'Coinbase Wallet',
      chain: 'ethereum', 
      available: true
    },
    {
      type: 'phantom',
      name: 'Phantom',
      chain: 'solana',
      available: true // Reown handles Solana wallets too
    }
  ])

  const shortAddress = computed(() => {
    if (!address.value) return ''
    const addr = address.value
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  })

  const formattedBalance = computed(() => {
    if (!balance.value) return '0.0'
    
    try {
      const formatted = formatUnits(balance.value.value, balance.value.decimals)
      const amount = parseFloat(formatted)
      return amount.toFixed(4)
    } catch {
      return '0.0'
    }
  })

  const balanceSymbol = computed(() => {
    return balance.value?.symbol || selectedToken.value || 'ETH'
  })

  const networkName = computed(() => {
    return caipNetwork.value?.name || 'Unknown Network'
  })

  const isOnSupportedChain = computed(() => {
    // Define supported chain IDs for your app
    const supportedChainIds = [1, 8453, 42161, 11155111] // Mainnet, Base, Arbitrum, Sepolia
    return supportedChainIds.includes(chainId.value)
  })

  // Helper functions
  function getWalletType() {
    if (!connector.value) return 'unknown'
    
    const name = connector.value.name?.toLowerCase() || ''
    if (name.includes('metamask')) return 'metamask'
    if (name.includes('walletconnect')) return 'walletconnect'
    if (name.includes('coinbase')) return 'coinbase'
    if (name.includes('phantom')) return 'phantom'
    return 'unknown'
  }

  function getChainType() {
    if (!caipNetwork.value) return 'unknown'
    
    // Check if it's a Solana network
    if (caipNetwork.value.id?.includes('solana')) return 'solana'
    
    // Otherwise assume EVM
    return 'ethereum'
  }

  // Actions
  const connectWallet = async (walletType = null, chain = 'ethereum') => {
    try {
      clearError()
      updateActivity()
      
      if (walletType) {
        // Open modal with specific view or let user choose
        open({ view: 'Connect' })
      } else {
        // Open generic connect modal
        open()
      }
      
      return true
    } catch (error) {
      console.error('❌ Connect wallet failed:', error)
      globalError.value = error.message || 'Failed to connect wallet'
      throw error
    }
  }

  const disconnectWallet = async () => {
    try {
      if (connector.value) {
        await disconnect()
      }
      
      globalError.value = null
      console.log('✅ Wallet disconnected successfully')
      return true
    } catch (error) {
      console.error('❌ Disconnect failed:', error)
      globalError.value = error.message || 'Failed to disconnect wallet'
      throw error
    }
  }

  const switchChain = async (targetChainId) => {
    try {
      // Reown handles chain switching through the Networks modal
      open({ view: 'Networks' })
      return true
    } catch (error) {
      console.error('❌ Chain switch failed:', error)
      globalError.value = error.message || 'Failed to switch chain'
      throw error
    }
  }

  const refreshBalance = async () => {
    try {
      if (refetchBalance) {
        await refetchBalance()
        updateActivity()
        console.log('✅ Balance refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Failed to refresh balance:', error)
      globalError.value = error.message || 'Failed to refresh balance'
      throw error
    }
  }

  const initialize = async () => {
    try {
      // Reown handles initialization automatically
      updateActivity()
      console.log('✅ Reown wallet store initialized')
      return true
    } catch (error) {
      console.error('❌ Initialization failed:', error)
      return false
    }
  }

  // Modal controls  
  const openWalletModal = () => {
    isWalletModalOpen.value = true
    open()
  }

  const closeWalletModal = () => {
    isWalletModalOpen.value = false
  }

  const openAccountModal = () => {
    open({ view: 'Account' })
  }

  const openNetworksModal = () => {
    open({ view: 'Networks' })
  }

  // Utility functions
  const clearError = () => {
    globalError.value = null
  }

  const clearErrors = () => clearError()

  const updateActivity = () => {
    lastActivity.value = Date.now()
  }

  const setSelectedToken = (tokenSymbol) => {
    selectedToken.value = tokenSymbol
  }

  const validateWalletForToken = (tokenSymbol) => {
    const ethereumTokens = ['ETH', 'USDC', 'USDT', 'CIRX']
    if (ethereumTokens.includes(tokenSymbol)) {
      if (!isConnected.value || getChainType() !== 'ethereum') {
        throw new Error(`${tokenSymbol} requires Ethereum wallet connection`)
      }
      return true
    }
    
    const solanaTokens = ['SOL', 'USDC_SOL']
    if (solanaTokens.includes(tokenSymbol)) {
      if (!isConnected.value || getChainType() !== 'solana') {
        throw new Error(`${tokenSymbol} requires Solana wallet connection`)
      }
      return true
    }
    
    throw new Error(`Unsupported token: ${tokenSymbol}`)
  }

  const getTokenBalance = (tokenSymbol) => {
    // For now, return the native token balance
    // This can be extended to support ERC20/SPL tokens
    if (tokenSymbol === balanceSymbol.value) {
      return formattedBalance.value
    }
    return '0.0'
  }

  // Return store interface
  return {
    // State
    isConnected,
    isConnecting,
    isDisconnected,
    activeWallet,
    availableWallets,
    currentError,
    shortAddress,
    formattedBalance,
    balanceSymbol,
    networkName,
    isOnSupportedChain,
    selectedToken,
    isWalletModalOpen,
    lastActivity,
    address,
    chainId,
    caipNetwork,
    
    // Computed
    balance,
    isBalanceLoading,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchChain,
    refreshBalance,
    initialize,
    openWalletModal,
    closeWalletModal,
    openAccountModal,
    openNetworksModal,
    clearError,
    clearErrors,
    updateActivity,
    setSelectedToken,
    validateWalletForToken,
    getTokenBalance
  }
})