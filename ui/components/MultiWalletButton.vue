<template>
  <div class="relative">
    <!-- Generic Connect Wallet Button -->
    <button
      v-if="!isConnected"
      @click="openWalletModal"
      class="px-4 py-2 bg-circular-primary text-gray-900 rounded-lg font-medium hover:bg-circular-primary-hover transition-colors flex items-center gap-2"
      :disabled="isConnecting"
    >
      <!-- Wallet Connect Icon -->
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1L13.5 2.5L16.17 5.33C15.24 5.1 14.25 5 13.17 5H10.83C9.75 5 8.76 5.1 7.83 5.33L10.5 2.5L9 1L3 7V9C3 10.66 4.34 12 6 12H8L8 21C8 21.6 8.4 22 9 22H15C15.6 22 16 21.6 16 21L16 12H18C19.66 12 21 10.66 21 9Z"/>
      </svg>
      
      <span v-if="isConnecting">Connecting...</span>
      <span v-else>Connect Wallet</span>
    </button>

    <!-- Connected State -->
    <div v-else class="flex items-center gap-3">
      <!-- Network Warning -->
      <div v-if="!isOnSupportedChain" class="flex items-center gap-2">
        <button
          @click="switchToMainnet"
          class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          Switch Network
        </button>
      </div>
      
      <!-- Account Info -->
      <div class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
        <div class="flex items-center gap-2">
          <!-- Wallet Icon -->
          <div class="w-4 h-4 flex items-center justify-center">
            <div v-if="connectedWallet === 'metamask'" class="w-3 h-3 bg-orange-500 rounded-sm"></div>
            <div v-else-if="connectedWallet === 'phantom'" class="w-3 h-3 bg-purple-500 rounded-sm"></div>
            <div v-else-if="connectedWallet === 'walletconnect'" class="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <div v-else-if="connectedWallet === 'coinbase'" class="w-3 h-3 bg-blue-600 rounded-sm"></div>
            <div v-else class="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <span class="text-sm font-medium text-white">{{ shortAddress }}</span>
        </div>
        <div class="text-xs text-gray-400">
          {{ balance }} {{ connectedWallet === 'phantom' ? 'SOL' : 'ETH' }}
        </div>
      </div>
      
      <!-- Disconnect Button -->
      <button
        @click="handleDisconnect"
        class="px-3 py-2 text-gray-400 hover:text-white transition-colors"
        title="Disconnect wallet"
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z"/>
        </svg>
      </button>
    </div>

    <!-- Wallet Selection Modal -->
    <div
      v-if="showWalletModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 min-h-screen"
      @click="closeWalletModal"
    >
      <div
        class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 my-8"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-white">Connect Wallet</h3>
          <button
            @click="closeWalletModal"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <!-- Wallet Options -->
        <div class="space-y-3">
          <!-- MetaMask Option -->
          <div 
            class="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
            :class="{
              'opacity-50': !isMetaMaskAvailable && !isConnecting,
              'bg-gray-800/50': isConnecting && connectingWallet === 'metamask'
            }"
            @click="handleWalletClick('metamask')"
          >
            <div class="flex items-center gap-3">
              <!-- MetaMask Icon -->
              <div class="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M22.46 12.58l-.86-2.89L20.05 4.47l-5.87 4.34 2.25 1.67 1.96-1.45.78 2.62L22.46 12.58zM9.59 8.81l-5.87-4.34L2.14 9.69l-.86 2.89 3.29-.93.78-2.62 1.96 1.45L9.59 8.81z"/>
                </svg>
              </div>
              <div>
                <div class="font-medium text-white">MetaMask</div>
                <div class="text-sm text-gray-400">
                  {{ isMetaMaskAvailable ? 'Available' : 'Not installed' }}
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <div v-if="isConnecting && connectingWallet === 'metamask'" class="w-4 h-4 border-2 border-circular-primary border-t-transparent rounded-full animate-spin"></div>
              <svg v-else-if="isMetaMaskAvailable" width="16" height="16" fill="currentColor" class="text-green-400" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <svg v-else width="16" height="16" fill="currentColor" class="text-gray-500" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
          </div>

          <!-- Phantom Option -->
          <div 
            class="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
            :class="{
              'opacity-50': !isPhantomAvailable && !isConnecting,
              'bg-gray-800/50': isConnecting && connectingWallet === 'phantom'
            }"
            @click="handleWalletClick('phantom')"
          >
            <div class="flex items-center gap-3">
              <!-- Phantom Icon -->
              <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <div class="font-medium text-white">Phantom</div>
                <div class="text-sm text-gray-400">
                  {{ isPhantomAvailable ? 'Available' : 'Not installed' }}
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <div v-if="isConnecting && connectingWallet === 'phantom'" class="w-4 h-4 border-2 border-circular-primary border-t-transparent rounded-full animate-spin"></div>
              <svg v-else-if="isPhantomAvailable" width="16" height="16" fill="currentColor" class="text-green-400" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <svg v-else width="16" height="16" fill="currentColor" class="text-gray-500" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
          </div>

          <!-- WalletConnect Option -->
          <div 
            class="flex items-center justify-between p-4 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
            :class="{
              'bg-gray-800/50': isConnecting && connectingWallet === 'walletconnect'
            }"
            @click="handleWalletClick('walletconnect')"
          >
            <div class="flex items-center gap-3">
              <!-- WalletConnect Icon -->
              <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <div class="font-medium text-white">WalletConnect</div>
                <div class="text-sm text-gray-400">Connect via QR code</div>
              </div>
            </div>
            <div class="flex items-center">
              <div v-if="isConnecting && connectingWallet === 'walletconnect'" class="w-4 h-4 border-2 border-circular-primary border-t-transparent rounded-full animate-spin"></div>
              <svg v-else width="16" height="16" fill="currentColor" class="text-blue-400" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-400">
            New to Ethereum wallets? 
            <a 
              href="https://ethereum.org/en/wallets/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-circular-primary hover:text-circular-primary-hover transition-colors"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div
      v-if="error"
      class="absolute top-full left-0 right-0 mt-2 p-3 bg-red-900/90 border border-red-700 rounded-lg text-red-200 text-sm z-10"
    >
      {{ error }}
      <button
        @click="clearError"
        class="ml-2 text-red-400 hover:text-red-200"
      >
        ✕
      </button>
    </div>

    <!-- Network Warning -->
    <div
      v-if="isConnected && !isOnSupportedChain"
      class="absolute top-full left-0 right-0 mt-2 p-3 bg-yellow-900/90 border border-yellow-700 rounded-lg text-yellow-200 text-sm z-10"
    >
      <div class="flex items-center justify-between">
        <span>Unsupported network detected</span>
        <button
          v-if="connectedWallet === 'metamask'"
          @click="switchToMainnet"
          class="ml-2 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-yellow-100 rounded text-xs transition-colors"
        >
          Switch
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Use wallet store
const walletStore = useWalletStore()
const { useWallet } = await import('../composables/useWallet.js')
const wallet = useWallet()

// Computed properties from store and composables
const isConnected = computed(() => walletStore.isConnected)
const isConnecting = computed(() => walletStore.isConnecting)
const error = computed(() => walletStore.currentError)
const connectedWallet = computed(() => walletStore.activeWallet?.type)
const shortAddress = computed(() => {
  if (!walletStore.activeWallet?.address) return ''
  const addr = walletStore.activeWallet.address
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
})
const balance = computed(() => {
  if (connectedWallet.value === 'metamask' && walletStore.metaMaskWallet) {
    return walletStore.metaMaskWallet.balance?.value || '0.0000'
  }
  return '0.0000'
})

// Check wallet availability
const isMetaMaskAvailable = computed(() => {
  if (typeof window === 'undefined') return false
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
})

const isPhantomAvailable = computed(() => {
  if (typeof window === 'undefined') return false
  return typeof window.solana !== 'undefined' && window.solana.isPhantom
})

const isOnSupportedChain = computed(() => {
  if (connectedWallet.value === 'metamask' && walletStore.metaMaskWallet) {
    return walletStore.metaMaskWallet.isOnSupportedChain?.value || false
  }
  return true
})

// Modal state
const showWalletModal = ref(false)
const connectingWallet = ref(null)

// Modal handlers
const openWalletModal = () => {
  showWalletModal.value = true
}

const closeWalletModal = () => {
  showWalletModal.value = false
  connectingWallet.value = null
}

// Wallet connection handlers
const handleWalletClick = async (walletType) => {
  // Check if wallet is available
  const isAvailable = getWalletAvailability(walletType)
  
  if (!isAvailable.available) {
    // Open installation page if wallet is not available
    window.open(isAvailable.installUrl, '_blank')
    return
  }
  
  try {
    connectingWallet.value = walletType
    
    // Ensure single wallet connection - disconnect others first
    if (isConnected.value) {
      await walletStore.disconnectWallet()
    }
    
    // Connect to the selected wallet
    await connectWallet(walletType)
    
    // Close modal on successful connection
    closeWalletModal()
  } catch (error) {
    console.error(`${walletType} connection failed:`, error)
    // Error is already stored in walletStore.currentError
  } finally {
    connectingWallet.value = null
  }
}

// Get wallet availability and installation URL
const getWalletAvailability = (walletType) => {
  switch (walletType) {
    case 'metamask':
      return {
        available: isMetaMaskAvailable.value,
        installUrl: 'https://metamask.io/download/'
      }
    case 'phantom':
      return {
        available: isPhantomAvailable.value,
        installUrl: 'https://phantom.app/download'
      }
    case 'walletconnect':
      return {
        available: true, // WalletConnect is always "available" as it's a protocol
        installUrl: 'https://walletconnect.com/'
      }
    default:
      return { available: false, installUrl: '' }
  }
}

// Connect to specific wallet
const connectWallet = async (walletType) => {
  switch (walletType) {
    case 'metamask':
      await walletStore.connectWallet('metamask', 'ethereum')
      break
    case 'phantom':
      await walletStore.connectWallet('phantom', 'solana')
      break
    case 'walletconnect':
      // WalletConnect implementation (placeholder for now)
      console.log('WalletConnect integration coming soon')
      throw new Error('WalletConnect not yet implemented')
    default:
      throw new Error(`Unknown wallet type: ${walletType}`)
  }
}

const handleDisconnect = async () => {
  try {
    await walletStore.disconnectWallet()
  } catch (error) {
    console.error('Disconnect failed:', error)
  }
}

const switchToMainnet = async () => {
  try {
    await walletStore.switchChain(1) // Ethereum mainnet
  } catch (error) {
    console.error('Network switch failed:', error)
  }
}

const clearError = () => {
  walletStore.clearError()
}

// State change monitoring for single wallet enforcement
const enforceeSingleWallet = () => {
  // Watch for wallet state changes and ensure only one is connected
  const connectedWallets = []
  
  if (walletStore.metaMaskWallet?.isConnected?.value) {
    connectedWallets.push('metamask')
  }
  if (walletStore.phantomWallet?.isConnected?.value) {
    connectedWallets.push('phantom')
  }
  
  // If multiple wallets are connected, disconnect all but the most recent
  if (connectedWallets.length > 1) {
    console.warn('Multiple wallets detected, enforcing single wallet policy')
    // Keep the active wallet, disconnect others
    const activeWalletType = walletStore.activeWallet?.type
    connectedWallets.forEach(async (walletType) => {
      if (walletType !== activeWalletType) {
        console.log(`Disconnecting ${walletType} to maintain single wallet connection`)
        await walletStore.disconnectSpecificWallet(walletType)
      }
    })
  }
}

// Initialize wallet store on mount (without auto-reconnect)
onMounted(async () => {
  try {
    await walletStore.initialize()
    // Removed attemptAutoReconnect() to prevent unwanted popups
    
    // Enforce single wallet connection on initialization
    enforceeSingleWallet()
    
    // Set up watchers for state changes
    watch([() => walletStore.metaMaskWallet?.isConnected?.value, () => walletStore.phantomWallet?.isConnected?.value], () => {
      enforceeSingleWallet()
    })
  } catch (error) {
    console.error('Wallet initialization failed:', error)
  }
})
</script>