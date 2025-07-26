import { ref, computed } from 'vue'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'

// Solana network configuration
export const SOLANA_NETWORKS = {
  'mainnet-beta': {
    name: 'Mainnet Beta',
    url: clusterApiUrl('mainnet-beta')
  },
  'devnet': {
    name: 'Devnet', 
    url: clusterApiUrl('devnet')
  },
  'testnet': {
    name: 'Testnet',
    url: clusterApiUrl('testnet')
  }
}

// Default network
export const DEFAULT_NETWORK = 'mainnet-beta'

// Solana connection state
const currentNetwork = ref(DEFAULT_NETWORK)
const isConnected = ref(false)
const publicKey = ref<PublicKey | null>(null)
const balance = ref<number | null>(null)
const connecting = ref(false)
const error = ref<string | null>(null)

// Connection instance
let connection: Connection | null = null
let phantomAdapter: PhantomWalletAdapter | null = null

// Initialize Solana connection
const initializeSolanaConnection = (network: string = DEFAULT_NETWORK) => {
  const networkConfig = SOLANA_NETWORKS[network as keyof typeof SOLANA_NETWORKS]
  if (!networkConfig) {
    console.error('Invalid Solana network:', network)
    return
  }

  connection = new Connection(networkConfig.url, 'confirmed')
  phantomAdapter = new PhantomWalletAdapter()
  currentNetwork.value = network
}

// Solana composable
export const useSolanaWallet = () => {
  // Connect to Phantom wallet
  const connectPhantom = async () => {
    if (!phantomAdapter) {
      initializeSolanaConnection()
    }

    if (!phantomAdapter) {
      error.value = 'Failed to initialize Phantom adapter'
      return false
    }

    try {
      connecting.value = true
      error.value = null

      await phantomAdapter.connect()
      
      if (phantomAdapter.publicKey) {
        publicKey.value = phantomAdapter.publicKey
        isConnected.value = true
        
        // Get balance
        await updateBalance()
        
        // Setup event listeners
        setupSolanaEventListeners()
        
        return true
      } else {
        throw new Error('Failed to get public key from Phantom')
      }
    } catch (err: any) {
      console.error('Failed to connect to Phantom:', err)
      error.value = err.message || 'Failed to connect to Phantom wallet'
      return false
    } finally {
      connecting.value = false
    }
  }

  // Disconnect Phantom wallet
  const disconnectPhantom = async () => {
    if (phantomAdapter) {
      try {
        await phantomAdapter.disconnect()
      } catch (err) {
        console.error('Error disconnecting Phantom:', err)
      }
    }
    
    publicKey.value = null
    isConnected.value = false
    balance.value = null
    error.value = null
  }

  // Update SOL balance
  const updateBalance = async () => {
    if (!connection || !publicKey.value) return

    try {
      const balanceLamports = await connection.getBalance(publicKey.value)
      balance.value = balanceLamports / 1e9 // Convert lamports to SOL
    } catch (err) {
      console.error('Failed to get SOL balance:', err)
    }
  }

  // Setup Phantom event listeners
  const setupSolanaEventListeners = () => {
    if (!phantomAdapter) return

    phantomAdapter.on('connect', () => {
      if (phantomAdapter?.publicKey) {
        publicKey.value = phantomAdapter.publicKey
        isConnected.value = true
        updateBalance()
      }
    })

    phantomAdapter.on('disconnect', () => {
      publicKey.value = null
      isConnected.value = false
      balance.value = null
    })

    phantomAdapter.on('error', (err) => {
      console.error('Phantom adapter error:', err)
      error.value = err.message || 'Phantom wallet error'
    })
  }

  // Switch Solana network
  const switchSolanaNetwork = (network: string) => {
    if (isConnected.value) {
      // Need to disconnect and reconnect for network change
      disconnectPhantom().then(() => {
        initializeSolanaConnection(network)
      })
    } else {
      initializeSolanaConnection(network)
    }
  }

  // Format Solana address
  const formatSolanaAddress = (address: PublicKey | string) => {
    if (!address) return ''
    const addressStr = typeof address === 'string' ? address : address.toString()
    return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`
  }

  // Send SOL transaction
  const sendSolanaTransaction = async (to: string, amount: number) => {
    if (!connection || !phantomAdapter || !publicKey.value) {
      throw new Error('Wallet not connected')
    }

    // This would require additional setup for transaction creation
    // For now, return a placeholder
    throw new Error('Solana transactions not yet implemented')
  }

  // Check if Phantom is installed
  const isPhantomInstalled = computed(() => {
    return typeof window !== 'undefined' && 'solana' in window
  })

  // Get current network info
  const networkInfo = computed(() => {
    return SOLANA_NETWORKS[currentNetwork.value as keyof typeof SOLANA_NETWORKS]
  })

  // Initialize on composable creation
  if (typeof window !== 'undefined') {
    initializeSolanaConnection()
  }

  return {
    // State
    isConnected: readonly(isConnected),
    publicKey: readonly(publicKey),
    balance: readonly(balance),
    connecting: readonly(connecting),
    error: readonly(error),
    currentNetwork: readonly(currentNetwork),
    isPhantomInstalled,
    networkInfo,

    // Methods
    connectPhantom,
    disconnectPhantom,
    updateBalance,
    switchSolanaNetwork,
    formatSolanaAddress,
    sendSolanaTransaction,

    // Connection instance for advanced usage
    getConnection: () => connection,
    getPhantomAdapter: () => phantomAdapter
  }
}