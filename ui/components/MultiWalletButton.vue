<template>
  <div class="relative">
    <!-- Connect Button - Direct MetaMask Connection -->
    <button
      v-if="!isConnected"
      @click="handleConnectMetaMask"
      class="px-4 py-2 bg-circular-primary text-gray-900 rounded-lg font-medium hover:bg-circular-primary-hover transition-colors flex items-center gap-2"
      :disabled="isConnecting || !isMetaMaskAvailable"
    >
      <!-- MetaMask Icon -->
      <svg v-if="isMetaMaskAvailable" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.46 12.58l-.86-2.89L20.05 4.47l-5.87 4.34 2.25 1.67 1.96-1.45.78 2.62L22.46 12.58zM9.59 8.81l-5.87-4.34L2.14 9.69l-.86 2.89 3.29-.93.78-2.62 1.96 1.45L9.59 8.81z"/>
        <path d="M18.18 12.42l-2.25-1.67-1.96 1.45-.78-2.62-3.29.93.86 2.89 1.57-1.16 1.57 1.16.86-2.89-3.29-.93-.78 2.62-1.96-1.45-2.25 1.67 4.41 3.27L18.18 12.42z"/>
      </svg>
      <!-- Generic Wallet Icon for fallback -->
      <svg v-else width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 6h-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v2H1v14a2 2 0 002 2h18a2 2 0 002-2V6zM5 4h12v2H5V4zm14 16H3V8h2v2h2V8h10v2h2V8h2v12z"/>
      </svg>
      
      <span v-if="isConnecting">Connecting...</span>
      <span v-else-if="!isMetaMaskAvailable">Install MetaMask</span>
      <span v-else>Connect MetaMask</span>
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

    <!-- MetaMask Installation Hint (when not available) -->
    <div
      v-if="!isConnected && !isMetaMaskAvailable"
      class="absolute top-full left-0 right-0 mt-2 p-3 bg-orange-900/90 border border-orange-700 rounded-lg text-orange-200 text-sm z-10"
    >
      <div class="flex items-center justify-between">
        <span>MetaMask not detected</span>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-2 px-2 py-1 bg-orange-600 hover:bg-orange-700 text-orange-100 rounded text-xs transition-colors"
        >
          Install
        </a>
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
import { ref, computed, onMounted } from 'vue'

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

// Connection handlers
const handleConnectMetaMask = async () => {
  if (!isMetaMaskAvailable.value) {
    // Open MetaMask installation page if not available
    window.open('https://metamask.io/download/', '_blank')
    return
  }
  
  try {
    await walletStore.connectWallet('metamask', 'ethereum')
  } catch (error) {
    console.error('MetaMask connection failed:', error)
    // Error is already stored in walletStore.currentError
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

// Initialize wallet store on mount
onMounted(async () => {
  try {
    await walletStore.initialize()
    await walletStore.attemptAutoReconnect()
  } catch (error) {
    console.error('Wallet initialization failed:', error)
  }
})
</script>