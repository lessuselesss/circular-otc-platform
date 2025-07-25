import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { mainnet, sepolia } from 'viem/chains'

// Wallet connection state
const isConnected = ref(false)
const account = ref(null)
const chainId = ref(null)
const balance = ref(null)
const connecting = ref(false)
const error = ref(null)

// Client instances
let publicClient = null
let walletClient = null

// Chain configuration
const supportedChains = {
  1: mainnet,
  11155111: sepolia
}

// Initialize clients
const initializeClients = (chain = mainnet) => {
  publicClient = createPublicClient({
    chain,
    transport: http()
  })

  if (typeof window !== 'undefined' && window.ethereum) {
    walletClient = createWalletClient({
      chain,
      transport: custom(window.ethereum)
    })
  }
}

export const useWallet = () => {
  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      error.value = 'MetaMask not detected. Please install MetaMask.'
      return false
    }

    try {
      connecting.value = true
      error.value = null

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Get chain ID
      const chain = await window.ethereum.request({
        method: 'eth_chainId'
      })

      const chainIdNumber = parseInt(chain, 16)
      
      // Initialize clients with detected chain
      const selectedChain = supportedChains[chainIdNumber] || mainnet
      initializeClients(selectedChain)

      // Update state
      account.value = accounts[0]
      chainId.value = chainIdNumber
      isConnected.value = true

      // Get balance
      await updateBalance()

      // Setup event listeners
      setupEventListeners()

      return true
    } catch (err) {
      console.error('Failed to connect wallet:', err)
      error.value = err.message || 'Failed to connect wallet'
      return false
    } finally {
      connecting.value = false
    }
  }

  // Disconnect wallet
  const disconnect = () => {
    account.value = null
    chainId.value = null
    balance.value = null
    isConnected.value = false
    error.value = null
    
    // Remove event listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeAllListeners?.()
    }
  }

  // Update balance
  const updateBalance = async () => {
    if (!account.value || !publicClient) return

    try {
      const balanceWei = await publicClient.getBalance({
        address: account.value
      })
      
      // Convert to ETH with 4 decimal places
      balance.value = parseFloat(
        (Number(balanceWei) / 1e18).toFixed(4)
      )
    } catch (err) {
      console.error('Failed to get balance:', err)
    }
  }

  // Get token balance
  const getTokenBalance = async (tokenAddress, decimals = 18) => {
    if (!account.value || !publicClient) return '0'

    try {
      const balance = await publicClient.readContract({
        address: tokenAddress,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ],
        functionName: 'balanceOf',
        args: [account.value]
      })

      return (Number(balance) / Math.pow(10, decimals)).toFixed(4)
    } catch (err) {
      console.error('Failed to get token balance:', err)
      return '0'
    }
  }

  // Send transaction
  const sendTransaction = async (to, value, data = '0x') => {
    if (!walletClient || !account.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const hash = await walletClient.sendTransaction({
        account: account.value,
        to,
        value,
        data
      })

      return hash
    } catch (err) {
      console.error('Transaction failed:', err)
      throw err
    }
  }

  // Write contract
  const writeContract = async (contractConfig) => {
    if (!walletClient || !account.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const hash = await walletClient.writeContract({
        account: account.value,
        ...contractConfig
      })

      return hash
    } catch (err) {
      console.error('Contract write failed:', err)
      throw err
    }
  }

  // Read contract
  const readContract = async (contractConfig) => {
    if (!publicClient) {
      throw new Error('Public client not initialized')
    }

    try {
      const result = await publicClient.readContract(contractConfig)
      return result
    } catch (err) {
      console.error('Contract read failed:', err)
      throw err
    }
  }

  // Setup event listeners for account/chain changes
  const setupEventListeners = () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        disconnect()
      } else if (accounts[0] !== account.value) {
        account.value = accounts[0]
        updateBalance()
      }
    })

    window.ethereum.on('chainChanged', (chainId) => {
      const chainIdNumber = parseInt(chainId, 16)
      chainId.value = chainIdNumber
      
      // Reinitialize clients with new chain
      const selectedChain = supportedChains[chainIdNumber] || mainnet
      initializeClients(selectedChain)
      
      updateBalance()
    })

    window.ethereum.on('disconnect', () => {
      disconnect()
    })
  }

  // Switch network
  const switchNetwork = async (targetChainId) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not detected')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }]
      })
    } catch (err) {
      // If chain is not added to MetaMask
      if (err.code === 4902) {
        const chain = supportedChains[targetChainId]
        if (chain) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrls.default.http[0]]
            }]
          })
        }
      } else {
        throw err
      }
    }
  }

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Check if on correct network
  const isCorrectNetwork = computed(() => {
    return chainId.value === 1 || chainId.value === 11155111 // Mainnet or Sepolia
  })

  // Initialize clients on composable creation
  if (typeof window !== 'undefined') {
    initializeClients()
  }

  return {
    // State
    isConnected: readonly(isConnected),
    account: readonly(account),
    chainId: readonly(chainId),
    balance: readonly(balance),
    connecting: readonly(connecting),
    error: readonly(error),
    isCorrectNetwork,

    // Methods
    connectMetaMask,
    disconnect,
    updateBalance,
    getTokenBalance,
    sendTransaction,
    writeContract,
    readContract,
    switchNetwork,
    formatAddress,

    // Clients (for advanced usage)
    getPublicClient: () => publicClient,
    getWalletClient: () => walletClient
  }
}