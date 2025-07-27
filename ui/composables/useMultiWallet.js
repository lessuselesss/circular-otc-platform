import { ref, computed, onMounted } from 'vue'

export function useMultiWallet() {
  // Reactive state
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const account = ref(null)
  const chainId = ref(null)
  const balance = ref('0')
  const connectedWallet = ref(null) // 'metamask', 'phantom', 'walletconnect'
  const error = ref(null)

  // Check wallet availability
  const isMetaMaskInstalled = computed(() => {
    if (typeof window === 'undefined') return false
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
  })

  const isPhantomInstalled = computed(() => {
    if (typeof window === 'undefined') return false
    return typeof window.solana !== 'undefined' && window.solana.isPhantom
  })

  const isWalletConnectAvailable = computed(() => {
    // WalletConnect is always available as it's a protocol
    return true
  })

  // Shortened address for display
  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  })

  // Check if on supported chain
  const isOnSupportedChain = computed(() => {
    if (connectedWallet.value === 'phantom') {
      // Solana networks
      return true // For demo, accept any Solana network
    } else {
      // Ethereum networks: 1 = Mainnet, 11155111 = Sepolia, 31337 = Local
      const supportedChains = [1, 11155111, 31337]
      return supportedChains.includes(parseInt(chainId.value))
    }
  })

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled.value) {
      error.value = 'MetaMask is not installed. Please install MetaMask to continue.'
      return false
    }

    try {
      isConnecting.value = true
      error.value = null

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        account.value = accounts[0]
        connectedWallet.value = 'metamask'
        isConnected.value = true
        
        const chain = await window.ethereum.request({
          method: 'eth_chainId'
        })
        chainId.value = parseInt(chain, 16)

        await updateBalance()
        setupMetaMaskListeners()
        
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

  // Connect to Phantom
  const connectPhantom = async () => {
    if (!isPhantomInstalled.value) {
      error.value = 'Phantom wallet is not installed. Please install Phantom to continue.'
      return false
    }

    try {
      isConnecting.value = true
      error.value = null

      const response = await window.solana.connect()
      
      if (response.publicKey) {
        account.value = response.publicKey.toString()
        connectedWallet.value = 'phantom'
        isConnected.value = true
        chainId.value = 'solana-mainnet' // Solana doesn't use chainId like Ethereum
        
        await updatePhantomBalance()
        setupPhantomListeners()
        
        console.log('✅ Phantom connected:', account.value)
        return true
      }
    } catch (err) {
      console.error('❌ Failed to connect Phantom:', err)
      error.value = err.message || 'Failed to connect to Phantom'
      return false
    } finally {
      isConnecting.value = false
    }
  }

  // Connect to WalletConnect
  const connectWalletConnect = async () => {
    try {
      isConnecting.value = true
      error.value = null

      // For demo purposes, we'll simulate WalletConnect
      // In production, you'd use @walletconnect/client or similar
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock WalletConnect connection
      account.value = '0x' + Math.random().toString(16).substr(2, 40)
      connectedWallet.value = 'walletconnect'
      isConnected.value = true
      chainId.value = 1 // Ethereum mainnet
      balance.value = '2.5'
      
      console.log('✅ WalletConnect connected (demo):', account.value)
      return true
      
    } catch (err) {
      console.error('❌ Failed to connect WalletConnect:', err)
      error.value = err.message || 'Failed to connect via WalletConnect'
      return false
    } finally {
      isConnecting.value = false
    }
  }

  // Disconnect wallet
  const disconnect = async () => {
    try {
      if (connectedWallet.value === 'phantom' && window.solana) {
        await window.solana.disconnect()
      }
      
      // Reset state
      account.value = null
      isConnected.value = false
      chainId.value = null
      balance.value = '0'
      connectedWallet.value = null
      error.value = null
      
      // Remove listeners
      cleanup()
      
      console.log('✅ Wallet disconnected')
    } catch (err) {
      console.error('❌ Failed to disconnect:', err)
      error.value = err.message || 'Failed to disconnect'
    }
  }

  // Update balance based on connected wallet
  const updateBalance = async () => {
    if (!account.value) return

    try {
      if (connectedWallet.value === 'metamask' && window.ethereum) {
        const balanceWei = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [account.value, 'latest']
        })
        const balanceEth = parseInt(balanceWei, 16) / Math.pow(10, 18)
        balance.value = balanceEth.toFixed(4)
      } else if (connectedWallet.value === 'phantom') {
        await updatePhantomBalance()
      } else if (connectedWallet.value === 'walletconnect') {
        // Mock balance for WalletConnect
        balance.value = '2.5'
      }
    } catch (err) {
      console.error('❌ Failed to get balance:', err)
      balance.value = '0'
    }
  }

  // Update Phantom (Solana) balance
  const updatePhantomBalance = async () => {
    if (!window.solana || !account.value) return

    try {
      // For demo purposes, we'll use a mock balance
      // In production, you'd query the Solana RPC
      balance.value = '5.2' // Mock SOL balance
    } catch (err) {
      console.error('❌ Failed to get Phantom balance:', err)
      balance.value = '0'
    }
  }

  // Get token balance (mock for now)
  const getTokenBalance = (tokenSymbol) => {
    const mockBalances = {
      // Ethereum tokens
      ETH: connectedWallet.value === 'metamask' ? balance.value : '0',
      USDC: connectedWallet.value === 'metamask' ? '1000.0' : '0',
      USDT: connectedWallet.value === 'metamask' ? '500.0' : '0',
      
      // Solana tokens
      SOL: connectedWallet.value === 'phantom' ? balance.value : '0',
      USDC_SOL: connectedWallet.value === 'phantom' ? '800.0' : '0',
      
      // WalletConnect tokens
      WETH: connectedWallet.value === 'walletconnect' ? balance.value : '0',
      
      // Universal
      CIRX: '0.0'
    }
    
    return mockBalances[tokenSymbol] || '0.0'
  }

  // Execute swap based on connected wallet
  const executeSwap = async (inputToken, inputAmount, outputToken, isOTC = false) => {
    if (!isConnected.value) {
      throw new Error('Please connect your wallet first')
    }

    try {
      console.log('🔄 Executing swap:', { 
        wallet: connectedWallet.value,
        inputToken, 
        inputAmount, 
        outputToken, 
        isOTC 
      })
      
      let txHash
      
      if (connectedWallet.value === 'metamask' && window.ethereum) {
        // Ethereum transaction via MetaMask
        txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account.value,
            to: '0x742d35Cc6575f8D2D42b8E6A5B1F9A9A5F5F9C5C', // Mock contract address
            value: '0x0', // No ETH value for token swap
            data: '0x' + Math.random().toString(16).substr(2, 128) // Mock transaction data
          }]
        })
      } else if (connectedWallet.value === 'phantom' && window.solana) {
        // Solana transaction via Phantom
        // In production, you'd create a proper Solana transaction
        await new Promise(resolve => setTimeout(resolve, 2000))
        txHash = Math.random().toString(16).substr(2, 64) // Mock Solana signature
      } else {
        // WalletConnect or other
        await new Promise(resolve => setTimeout(resolve, 2000))
        txHash = '0x' + Math.random().toString(16).substr(2, 64)
      }
      
      console.log('✅ Swap completed:', txHash)
      
      // Update balance after swap
      await updateBalance()
      
      return {
        hash: txHash,
        success: true
      }
    } catch (err) {
      console.error('❌ Swap failed:', err)
      throw err
    }
  }

  // Switch network (Ethereum only)
  const switchToMainnet = async () => {
    if (connectedWallet.value !== 'metamask' || !window.ethereum) return false

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

  // Setup MetaMask event listeners
  const setupMetaMaskListeners = () => {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('🔄 MetaMask accounts changed:', accounts)
      if (accounts.length === 0) {
        disconnect()
      } else {
        account.value = accounts[0]
        updateBalance()
      }
    })

    window.ethereum.on('chainChanged', (chain) => {
      console.log('🔄 MetaMask chain changed:', chain)
      chainId.value = parseInt(chain, 16)
      updateBalance()
    })
  }

  // Setup Phantom event listeners
  const setupPhantomListeners = () => {
    if (!window.solana) return

    window.solana.on('accountChanged', (publicKey) => {
      console.log('🔄 Phantom account changed:', publicKey)
      if (publicKey) {
        account.value = publicKey.toString()
        updatePhantomBalance()
      } else {
        disconnect()
      }
    })
  }

  // Cleanup event listeners
  const cleanup = () => {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged')
      window.ethereum.removeAllListeners('chainChanged')
    }
    
    if (window.solana) {
      window.solana.removeAllListeners('accountChanged')
    }
  }

  // Check existing connections on mount
  const checkExistingConnections = async () => {
    if (typeof window === 'undefined') return

    try {
      // Check MetaMask
      if (window.ethereum && window.ethereum.isMetaMask) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          account.value = accounts[0]
          connectedWallet.value = 'metamask'
          isConnected.value = true
          
          const chain = await window.ethereum.request({ method: 'eth_chainId' })
          chainId.value = parseInt(chain, 16)
          
          await updateBalance()
          setupMetaMaskListeners()
          return
        }
      }

      // Check Phantom
      if (window.solana && window.solana.isPhantom) {
        if (window.solana.isConnected) {
          account.value = window.solana.publicKey.toString()
          connectedWallet.value = 'phantom'
          isConnected.value = true
          chainId.value = 'solana-mainnet'
          
          await updatePhantomBalance()
          setupPhantomListeners()
          return
        }
      }
    } catch (err) {
      console.error('❌ Failed to check existing connections:', err)
    }
  }

  // Initialize on mount
  onMounted(async () => {
    await checkExistingConnections()
  })

  return {
    // State
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    account: readonly(account),
    chainId: readonly(chainId),
    balance: readonly(balance),
    connectedWallet: readonly(connectedWallet),
    error: readonly(error),
    
    // Computed
    isMetaMaskInstalled,
    isPhantomInstalled,
    isWalletConnectAvailable,
    shortAddress,
    isOnSupportedChain,
    
    // Methods
    connectMetaMask,
    connectPhantom,
    connectWalletConnect,
    disconnect,
    updateBalance,
    switchToMainnet,
    getTokenBalance,
    executeSwap,
    cleanup
  }
}