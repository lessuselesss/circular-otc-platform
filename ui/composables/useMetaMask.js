import { ref, computed, onMounted, readonly } from 'vue'

export function useMetaMask() {
  // Reactive state
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const account = ref(null)
  const chainId = ref(null)
  const balance = ref('0')
  const error = ref(null)

  // Check if MetaMask is installed
  const isMetaMaskInstalled = computed(() => {
    if (typeof window === 'undefined') return false
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
  })

  // Shortened address for display
  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  })

  // Check if on correct network (Ethereum mainnet or testnet)
  const isOnSupportedChain = computed(() => {
    // 1 = Ethereum Mainnet, 11155111 = Sepolia, 31337 = Local
    const supportedChains = [1, 11155111, 31337]
    return supportedChains.includes(parseInt(chainId.value))
  })

  // Connect to MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled.value) {
      error.value = 'MetaMask is not installed. Please install MetaMask to continue.'
      return false
    }

    try {
      isConnecting.value = true
      error.value = null

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        account.value = accounts[0]
        isConnected.value = true
        
        // Get chain ID
        const chain = await window.ethereum.request({
          method: 'eth_chainId'
        })
        chainId.value = parseInt(chain, 16)

        // Get balance
        await updateBalance()
        
        console.log('✅ MetaMask connected:', account.value)
        return true
      }
    } catch (err) {
      console.error('❌ Failed to connect MetaMask:', err)
      error.value = err.message || 'Failed to connect to MetaMask'
      return false
    } finally {
      isConnecting.value = false
    }
  }

  // Disconnect wallet
  const disconnect = async () => {
    try {
      // MetaMask doesn't have a disconnect method, so we just reset state
      account.value = null
      isConnected.value = false
      chainId.value = null
      balance.value = '0'
      error.value = null
      
      console.log('✅ Wallet disconnected')
    } catch (err) {
      console.error('❌ Failed to disconnect:', err)
      error.value = err.message || 'Failed to disconnect'
    }
  }

  // Update ETH balance
  const updateBalance = async () => {
    if (!account.value || !window.ethereum) return

    try {
      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account.value, 'latest']
      })
      
      // Convert from Wei to ETH
      const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18)
      balance.value = balanceEth.toFixed(4)
      
      // Also update token balances
      await updateTokenBalances()
    } catch (err) {
      console.error('❌ Failed to get balance:', err)
      balance.value = '0'
    }
  }

  // Switch to Ethereum mainnet
  const switchToMainnet = async () => {
    if (!window.ethereum) return false

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }] // Ethereum mainnet
      })
      return true
    } catch (err) {
      console.error('❌ Failed to switch network:', err)
      error.value = 'Failed to switch to Ethereum mainnet'
      return false
    }
  }

  // Add Ethereum mainnet (if not already added)
  const addMainnetNetwork = async () => {
    if (!window.ethereum) return false

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x1',
          chainName: 'Ethereum Mainnet',
          nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://ethereum.publicnode.com'],
          blockExplorerUrls: ['https://etherscan.io']
        }]
      })
      return true
    } catch (err) {
      console.error('❌ Failed to add network:', err)
      error.value = 'Failed to add Ethereum network'
      return false
    }
  }

  // Send a transaction (placeholder for swap functionality)
  const sendTransaction = async (to, value = '0', data = '0x') => {
    if (!account.value || !window.ethereum) {
      throw new Error('Wallet not connected')
    }

    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account.value,
          to: to,
          value: `0x${parseInt(value).toString(16)}`,
          data: data
        }]
      })
      
      console.log('✅ Transaction sent:', txHash)
      return txHash
    } catch (err) {
      console.error('❌ Transaction failed:', err)
      throw err
    }
  }

  // Check connection status
  const checkConnection = async () => {
    if (!isMetaMaskInstalled.value) return

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      })
      
      if (accounts.length > 0) {
        account.value = accounts[0]
        isConnected.value = true
        
        const chain = await window.ethereum.request({
          method: 'eth_chainId'
        })
        chainId.value = parseInt(chain, 16)
        
        await updateBalance()
      }
    } catch (err) {
      console.error('❌ Failed to check connection:', err)
    }
  }

  // Setup event listeners
  const setupEventListeners = () => {
    if (!window.ethereum) return

    // Account changed
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('🔄 Accounts changed:', accounts)
      if (accounts.length === 0) {
        disconnect()
      } else {
        account.value = accounts[0]
        updateBalance()
      }
    })

    // Chain changed
    window.ethereum.on('chainChanged', (chain) => {
      console.log('🔄 Chain changed:', chain)
      chainId.value = parseInt(chain, 16)
      updateBalance()
    })

    // Connection
    window.ethereum.on('connect', (connectInfo) => {
      console.log('✅ MetaMask connected:', connectInfo)
      chainId.value = parseInt(connectInfo.chainId, 16)
    })

    // Disconnection
    window.ethereum.on('disconnect', (error) => {
      console.log('❌ MetaMask disconnected:', error)
      disconnect()
    })
  }

  // Cleanup event listeners
  const cleanup = () => {
    if (!window.ethereum) return

    window.ethereum.removeAllListeners('accountsChanged')
    window.ethereum.removeAllListeners('chainChanged')
    window.ethereum.removeAllListeners('connect')
    window.ethereum.removeAllListeners('disconnect')
  }

  // Initialize on mount
  onMounted(async () => {
    if (typeof window !== 'undefined') {
      await checkConnection()
      setupEventListeners()
    }
  })

  // Real token balances
  const tokenBalances = ref({
    ETH: '0',
    USDC: '0', 
    USDT: '0',
    CIRX: '0'
  })

  // Get token balance (real implementation)
  const getTokenBalance = (tokenSymbol) => {
    if (tokenSymbol === 'ETH') {
      return balance.value
    }
    return tokenBalances.value[tokenSymbol] || '0.0'
  }

  // Update all token balances
  const updateTokenBalances = async () => {
    if (!account.value || !window.ethereum) return

    try {
      // Import token service dynamically to avoid SSR issues
      const { getAllTokenBalances } = await import('../services/tokenService.js')
      const balances = await getAllTokenBalances(account.value, window.ethereum)
      tokenBalances.value = balances
      console.log('💰 Token balances updated:', balances)
    } catch (error) {
      console.warn('Failed to update token balances:', error)
      // Keep existing balances on error
    }
  }

  // Execute swap (will be replaced with real contract calls when CIRX contracts are deployed)
  const executeSwap = async (inputToken, inputAmount, outputToken, isOTC = false) => {
    if (!isConnected.value) {
      throw new Error('Please connect your wallet first')
    }

    try {
      console.log('🔄 Executing swap:', { inputToken, inputAmount, outputToken, isOTC })
      
      // TODO: Replace with real contract interaction when CIRX contracts are ready
      // For now, simulate the transaction flow that would happen with real contracts
      
      // 1. Validate sufficient balance
      const { hasSufficientBalance } = await import('../services/tokenService.js')
      const hasBalance = await hasSufficientBalance(account.value, inputToken, inputAmount, window.ethereum)
      
      if (!hasBalance) {
        throw new Error(`Insufficient ${inputToken} balance`)
      }
      
      // 2. Simulate transaction delay (real contract would take ~15 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 3. Generate mock transaction hash (format matches real Ethereum transactions)
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)
      
      console.log('✅ Swap completed:', mockTxHash)
      console.log('ℹ️ This is a simulation. Real contract integration coming soon.')
      
      // 4. Update balances to reflect the transaction
      await updateBalance()
      
      return {
        hash: mockTxHash,
        success: true,
        simulation: true // Flag to indicate this is simulated
      }
    } catch (err) {
      console.error('❌ Swap failed:', err)
      throw err
    }
  }

  return {
    // State
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    account: readonly(account),
    chainId: readonly(chainId),
    balance: readonly(balance),
    error: readonly(error),
    
    // Computed
    isMetaMaskInstalled,
    shortAddress,
    isOnSupportedChain,
    
    // Methods
    connect,
    disconnect,
    updateBalance,
    updateTokenBalances,
    switchToMainnet,
    addMainnetNetwork,
    sendTransaction,
    checkConnection,
    getTokenBalance,
    executeSwap,
    cleanup
  }
}