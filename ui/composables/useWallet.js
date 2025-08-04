import { computed, ref, watch } from 'vue'
import { 
  useAccount, 
  useBalance, 
  useConnect, 
  useDisconnect, 
  useChainId,
  useSwitchChain,
  useConnectorClient,
  useClient
} from '@wagmi/vue'
import { parseEther, formatEther } from 'viem'

export function useWallet() {
  // Wagmi hooks
  const { address, isConnected, connector } = useAccount()
  const { data: balance } = useBalance({ address })
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { data: walletClient } = useConnectorClient()
  const publicClient = useClient()

  // Additional state for multi-wallet support
  const phantomConnected = ref(false)
  const phantomAddress = ref(null)
  const phantomBalance = ref('0')

  // Computed properties
  const connectedWallet = computed(() => {
    if (phantomConnected.value) return 'phantom'
    if (!isConnected.value || !connector.value) return null
    
    const connectorName = connector.value.name.toLowerCase()
    if (connectorName.includes('walletconnect')) return 'walletconnect'
    if (connectorName.includes('metamask')) return 'metamask'
    if (connectorName.includes('coinbase')) return 'coinbase'
    return 'unknown'
  })

  const account = computed(() => {
    return phantomConnected.value ? phantomAddress.value : address.value
  })

  const shortAddress = computed(() => {
    const addr = account.value
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  })

  const formattedBalance = computed(() => {
    if (phantomConnected.value) return phantomBalance.value
    if (!balance.value) return '0'
    return formatEther(balance.value.value)
  })

  const isOnSupportedChain = computed(() => {
    if (phantomConnected.value) return true // Solana is always supported for Phantom
    
    // Ethereum supported chains: mainnet (1), sepolia (11155111), base (8453), arbitrum (42161)
    const supportedChains = [1, 11155111, 8453, 42161]
    return supportedChains.includes(chainId.value)
  })

  // Phantom (Solana) wallet functions
  const connectPhantom = async () => {
    try {
      if (typeof window === 'undefined' || !window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet is not installed')
      }

      // Disconnect any Ethereum wallet first
      if (isConnected.value) {
        disconnect()
      }

      const response = await window.solana.connect()
      phantomAddress.value = response.publicKey.toString()
      phantomConnected.value = true

      // Get Solana balance
      try {
        const balance = await window.solana.getBalance()
        phantomBalance.value = (balance / 1e9).toFixed(4) // Convert lamports to SOL
      } catch (err) {
        console.warn('Failed to get Phantom balance:', err)
        phantomBalance.value = '0'
      }

      return true
    } catch (error) {
      console.error('Failed to connect Phantom:', error)
      throw error
    }
  }

  const disconnectPhantom = async () => {
    try {
      if (window.solana && phantomConnected.value) {
        await window.solana.disconnect()
      }
    } catch (error) {
      console.error('Failed to disconnect Phantom:', error)
    } finally {
      phantomConnected.value = false
      phantomAddress.value = null
      phantomBalance.value = '0'
    }
  }

  // Unified connect function
  const connectWallet = async (walletType) => {
    try {
      // Disconnect any existing connections first
      await disconnectWallet()

      if (walletType === 'phantom') {
        return await connectPhantom()
      }

      // Find the appropriate connector
      const targetConnector = connectors.value.find(connector => {
        const name = connector.name.toLowerCase()
        switch (walletType) {
          case 'metamask':
            return name.includes('metamask')
          case 'walletconnect':
            return name.includes('walletconnect')
          case 'coinbase':
            return name.includes('coinbase')
          default:
            return false
        }
      })

      if (!targetConnector) {
        throw new Error(`${walletType} connector not found`)
      }

      connect({ connector: targetConnector })
      return true
    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error)
      throw error
    }
  }

  // Unified disconnect function
  const disconnectWallet = async () => {
    try {
      if (phantomConnected.value) {
        await disconnectPhantom()
      }
      if (isConnected.value) {
        disconnect()
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  // Token balance fetching (mock for now, replace with real contract calls)
  const getTokenBalance = (tokenSymbol) => {
    // TODO: Implement real token balance fetching using contract calls
    const mockBalances = {
      ETH: formattedBalance.value,
      SOL: phantomConnected.value ? phantomBalance.value : '0',
      USDC: '1000.00', // Replace with real contract call
      USDT: '500.00',  // Replace with real contract call
      CIRX: '0.00',    // Replace with real contract call
    }
    
    return mockBalances[tokenSymbol] || '0'
  }

  // Transaction execution (mock for now)
  const executeSwap = async (
    inputToken,
    inputAmount,
    outputToken,
    isOTC = false
  ) => {
    // TODO: Implement real swap execution using smart contracts
    console.log('Executing swap:', { inputToken, inputAmount, outputToken, isOTC })
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      success: true,
      hash: '0x' + Math.random().toString(16).substr(2, 64)
    }
  }

  // Watch for account changes and update state accordingly
  watch([isConnected, address], () => {
    if (!isConnected.value && phantomConnected.value) {
      // Only Phantom is connected
      return
    }
    if (isConnected.value && phantomConnected.value) {
      // Both connected, disconnect Phantom
      disconnectPhantom()
    }
  })

  // Session persistence - save wallet preference
  const saveWalletPreference = (walletType) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-wallet', walletType)
    }
  }

  const getWalletPreference = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferred-wallet')
    }
    return null
  }

  const clearWalletPreference = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('preferred-wallet')
    }
  }

  // Auto-reconnect on page load
  const autoReconnect = async () => {
    const preferred = getWalletPreference()
    if (preferred && !isConnected.value && !phantomConnected.value) {
      try {
        await connectWallet(preferred)
      } catch (error) {
        console.warn('Auto-reconnect failed:', error)
        clearWalletPreference()
      }
    }
  }

  return {
    // State
    isConnected: computed(() => isConnected.value || phantomConnected.value),
    isConnecting,
    account,
    shortAddress,
    balance: formattedBalance,
    chainId,
    connectedWallet,
    isOnSupportedChain,
    error: connectError,

    // Methods
    connectWallet,
    disconnectWallet,
    switchChain,
    getTokenBalance,
    executeSwap,
    autoReconnect,
    saveWalletPreference,
    clearWalletPreference,

    // Wallet availability
    isMetaMaskAvailable: computed(() =>
      Array.isArray(connectors.value) && connectors.value.some(c => c.name.toLowerCase().includes('metamask'))
    ),
    isWalletConnectAvailable: computed(() =>
      Array.isArray(connectors.value) && connectors.value.some(c => c.name.toLowerCase().includes('walletconnect'))
    ),
    isPhantomAvailable: computed(() => 
      typeof window !== 'undefined' && window.solana && window.solana.isPhantom
    ),
  }
}

// Note: Phantom wallet interface is accessed via window.solana