import { ref, computed, onMounted, watch } from 'vue'
import { createConfig, getAccount, connect, disconnect, getBalance, waitForTransactionReceipt } from '@wagmi/core'
import { http, createPublicClient, parseUnits, formatUnits } from 'viem'
import { mainnet, sepolia, anvil } from 'viem/chains'
import { metaMask, walletConnect, coinbaseWallet } from '@wagmi/connectors'

// Wagmi configuration
const config = createConfig({
  chains: [anvil, sepolia, mainnet],
  connectors: [
    metaMask(),
    walletConnect({ 
      projectId: process.env.NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo' 
    }),
    coinbaseWallet({
      appName: 'Circular CIRX OTC Platform',
      appLogoUrl: '/favicon.ico'
    })
  ],
  transports: {
    [anvil.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NUXT_PUBLIC_INFURA_KEY}`),
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${process.env.NUXT_PUBLIC_INFURA_KEY}`)
  }
})

// Contract addresses (will be set after deployment)
const CONTRACT_ADDRESSES = {
  CIRX_TOKEN: process.env.NUXT_PUBLIC_CIRX_TOKEN_ADDRESS || '',
  OTC_SWAP: process.env.NUXT_PUBLIC_OTC_SWAP_ADDRESS || '',
  VESTING: process.env.NUXT_PUBLIC_VESTING_ADDRESS || ''
}

// Contract ABIs (simplified for demo)
const CIRX_TOKEN_ABI = [
  {
    "inputs": [{"type": "address", "name": "account"}],
    "name": "balanceOf",
    "outputs": [{"type": "uint256", "name": ""}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"type": "uint8", "name": ""}],
    "stateMutability": "view",
    "type": "function"
  }
]

const OTC_SWAP_ABI = [
  {
    "inputs": [
      {"type": "address", "name": "inputToken"},
      {"type": "uint256", "name": "inputAmount"}
    ],
    "name": "getLiquidQuote",
    "outputs": [
      {"type": "uint256", "name": "cirxAmount"},
      {"type": "uint256", "name": "fee"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address", "name": "inputToken"},
      {"type": "uint256", "name": "inputAmount"}
    ],
    "name": "getOTCQuote",
    "outputs": [
      {"type": "uint256", "name": "cirxAmount"},
      {"type": "uint256", "name": "fee"},
      {"type": "uint256", "name": "discountBps"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address", "name": "inputToken"},
      {"type": "uint256", "name": "inputAmount"},
      {"type": "uint256", "name": "minCirxOut"}
    ],
    "name": "swapLiquid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address", "name": "inputToken"},
      {"type": "uint256", "name": "inputAmount"},
      {"type": "uint256", "name": "minCirxOut"}
    ],
    "name": "swapOTC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const VESTING_ABI = [
  {
    "inputs": [{"type": "address", "name": "user"}],
    "name": "getVestingInfo",
    "outputs": [
      {"type": "uint256", "name": "totalAmount"},
      {"type": "uint256", "name": "startTime"},
      {"type": "uint256", "name": "claimedAmount"},
      {"type": "uint256", "name": "claimableAmount"},
      {"type": "bool", "name": "isActive"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// Mock token addresses for testing
const TOKEN_ADDRESSES = {
  ETH: '0x0000000000000000000000000000000000000000', // Native ETH
  USDC: '0xA0b86991c431e0e57a1C0e5B2e4f06e2e5b2a5B2', // Mock USDC
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // Mock USDT
}

export function useWalletConnection() {
  // Reactive state
  const account = ref(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const chainId = ref(null)
  const balances = ref({})
  const cirxBalance = ref('0')
  const vestingInfo = ref(null)

  // Public client for read operations
  const publicClient = createPublicClient({
    chain: anvil,
    transport: http('http://127.0.0.1:8545')
  })

  // Connection methods
  const connectWallet = async (connectorType = 'metaMask') => {
    try {
      isConnecting.value = true
      
      let connector
      switch (connectorType) {
        case 'metaMask':
          connector = metaMask()
          break
        case 'walletConnect':
          connector = walletConnect({ 
            projectId: process.env.NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo' 
          })
          break
        case 'coinbase':
          connector = coinbaseWallet({
            appName: 'Circular CIRX OTC Platform'
          })
          break
        default:
          connector = metaMask()
      }

      const result = await connect(config, { connector })
      
      await updateAccountInfo()
      return result
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      isConnecting.value = false
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect(config)
      
      // Reset state
      account.value = null
      isConnected.value = false
      chainId.value = null
      balances.value = {}
      cirxBalance.value = '0'
      vestingInfo.value = null
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      throw error
    }
  }

  // Update account information
  const updateAccountInfo = async () => {
    try {
      const accountInfo = getAccount(config)
      
      if (accountInfo?.address) {
        account.value = accountInfo.address
        chainId.value = accountInfo.chainId
        isConnected.value = true
        
        await Promise.all([
          updateBalances(),
          updateCirxBalance(),
          updateVestingInfo()
        ])
      } else {
        account.value = null
        isConnected.value = false
        chainId.value = null
      }
    } catch (error) {
      console.error('Failed to update account info:', error)
    }
  }

  // Update token balances
  const updateBalances = async () => {
    if (!account.value) return

    try {
      const newBalances = {}
      
      // Get ETH balance
      const ethBalance = await getBalance(config, {
        address: account.value
      })
      newBalances.ETH = formatUnits(ethBalance.value, 18)
      
      // Get ERC20 balances (USDC, USDT)
      // Note: In a real implementation, you'd call the actual token contracts
      newBalances.USDC = '1000.0' // Mock balance
      newBalances.USDT = '500.0'  // Mock balance
      
      balances.value = newBalances
    } catch (error) {
      console.error('Failed to update balances:', error)
    }
  }

  // Update CIRX balance
  const updateCirxBalance = async () => {
    if (!account.value || !CONTRACT_ADDRESSES.CIRX_TOKEN) {
      cirxBalance.value = '0'
      return
    }

    try {
      // Mock CIRX balance for now
      cirxBalance.value = '0.0'
    } catch (error) {
      console.error('Failed to update CIRX balance:', error)
      cirxBalance.value = '0'
    }
  }

  // Update vesting information (simple check for OTC purchases)
  const updateVestingInfo = async () => {
    if (!account.value || !CONTRACT_ADDRESSES.VESTING) {
      vestingInfo.value = null
      return
    }

    try {
      // Simple vesting info for OTC purchases
      vestingInfo.value = {
        hasVestingPosition: false,
        claimableAmount: '0'
      }
    } catch (error) {
      console.error('Failed to update vesting info:', error)
      vestingInfo.value = null
    }
  }

  // Trading operations
  const getQuote = async (inputToken, inputAmount, isOTC = false) => {
    if (!CONTRACT_ADDRESSES.OTC_SWAP || !inputAmount || parseFloat(inputAmount) <= 0) {
      return null
    }

    try {
      const tokenAddress = TOKEN_ADDRESSES[inputToken]
      const amount = parseUnits(inputAmount, inputToken === 'ETH' ? 18 : 6)
      
      // Mock quote calculation for now
      const tokenPrices = { ETH: 2500, USDC: 1, USDT: 1 }
      const usdValue = parseFloat(inputAmount) * tokenPrices[inputToken]
      
      let cirxAmount = usdValue
      let discountBps = 0
      
      if (isOTC) {
        // Calculate discount
        if (usdValue >= 50000) discountBps = 1200  // 12%
        else if (usdValue >= 10000) discountBps = 800   // 8%
        else if (usdValue >= 1000) discountBps = 500    // 5%
        
        cirxAmount = usdValue * (1 + discountBps / 10000)
      }
      
      const fee = parseFloat(inputAmount) * (isOTC ? 0.15 : 0.3) / 100
      
      return {
        cirxAmount: cirxAmount.toFixed(2),
        fee: fee.toFixed(4),
        discountBps,
        rate: tokenPrices[inputToken].toFixed(2)
      }
    } catch (error) {
      console.error('Failed to get quote:', error)
      return null
    }
  }

  const executeSwap = async (inputToken, inputAmount, minCirxOut, isOTC = false) => {
    if (!account.value || !CONTRACT_ADDRESSES.OTC_SWAP) {
      throw new Error('Wallet not connected or contracts not deployed')
    }

    try {
      // Mock transaction for now
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Refresh balances after transaction
      await Promise.all([
        updateBalances(),
        updateCirxBalance(),
        updateVestingInfo()
      ])
      
      return {
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        success: true
      }
    } catch (error) {
      console.error('Failed to execute swap:', error)
      throw error
    }
  }

  const claimVestedTokens = async () => {
    if (!account.value || !CONTRACT_ADDRESSES.VESTING) {
      throw new Error('Wallet not connected or vesting contract not deployed')
    }

    try {
      // Mock claim transaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      await Promise.all([
        updateCirxBalance(),
        updateVestingInfo()
      ])
      
      return {
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        success: true
      }
    } catch (error) {
      console.error('Failed to claim vested tokens:', error)
      throw error
    }
  }

  // Computed properties
  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  })

  const isOnCorrectChain = computed(() => {
    return chainId.value === anvil.id // Default to Anvil for development
  })

  // Initialize on mount
  onMounted(async () => {
    await updateAccountInfo()
    
    // Watch for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', updateAccountInfo)
      window.ethereum.on('chainChanged', updateAccountInfo)
    }
  })

  return {
    // State
    account: readonly(account),
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    chainId: readonly(chainId),
    balances: readonly(balances),
    cirxBalance: readonly(cirxBalance),
    vestingInfo: readonly(vestingInfo),
    
    // Computed
    shortAddress,
    isOnCorrectChain,
    
    // Methods
    connectWallet,
    disconnectWallet,
    updateAccountInfo,
    updateBalances,
    getQuote,
    executeSwap,
    claimVestedTokens,
    
    // Constants
    TOKEN_ADDRESSES: readonly(TOKEN_ADDRESSES),
    CONTRACT_ADDRESSES: readonly(CONTRACT_ADDRESSES)
  }
}