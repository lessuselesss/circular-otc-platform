<template>
  <div class="relative">
    <!-- Connect Button -->
    <button
      v-if="!isConnected"
      @click="showConnectModal = true"
      class="px-4 py-2 bg-circular-primary text-gray-900 rounded-lg font-medium hover:bg-circular-primary-hover transition-colors flex items-center gap-2"
      :disabled="isConnecting"
    >
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 6h-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v2H1v14a2 2 0 002 2h18a2 2 0 002-2V6zM5 4h12v2H5V4zm14 16H3V8h2v2h2V8h10v2h2V8h2v12z"/>
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

    <!-- Connect Modal -->
    <div
      v-if="showConnectModal"
      class="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      @click="showConnectModal = false"
      style="min-height: 100vh; min-height: 100dvh;"
    >
      <div
        class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-auto my-auto max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-white">Connect Wallet</h3>
          <button
            @click="showConnectModal = false"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <!-- MetaMask -->
          <button
            @click="handleConnectMetaMask"
            :disabled="isConnecting"
            class="w-full flex items-center gap-4 p-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M22.46 12.58l-.86-2.89L20.05 4.47l-5.87 4.34 2.25 1.67 1.96-1.45.78 2.62L22.46 12.58zM9.59 8.81l-5.87-4.34L2.14 9.69l-.86 2.89 3.29-.93.78-2.62 1.96 1.45L9.59 8.81z"/>
                <path d="M18.18 12.42l-2.25-1.67-1.96 1.45-.78-2.62-3.29.93.86 2.89 1.57-1.16 1.57 1.16.86-2.89-3.29-.93-.78 2.62-1.96-1.45-2.25 1.67 4.41 3.27L18.18 12.42z"/>
              </svg>
            </div>
            <div>
              <div class="font-medium text-white">MetaMask</div>
              <div class="text-sm text-gray-400">
                {{ isMetaMaskInstalled ? 'Connect to your MetaMask wallet' : 'Install MetaMask first' }}
              </div>
            </div>
            <div v-if="!isMetaMaskInstalled" class="ml-auto">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="text-gray-400">
                <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </div>
          </button>

          <!-- Phantom -->
          <button
            @click="handleConnectPhantom"
            :disabled="isConnecting"
            class="w-full flex items-center gap-4 p-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.06 12.94c0 1.34-.77 2.43-1.72 2.43h-1.61c-.64 0-1.16-.52-1.16-1.16v-.24c0-.64.52-1.16 1.16-1.16h1.61c.95 0 1.72 1.09 1.72 2.43z"/>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div class="font-medium text-white">Phantom</div>
              <div class="text-sm text-gray-400">
                {{ isPhantomInstalled ? 'Connect to your Phantom wallet (Solana)' : 'Install Phantom first' }}
              </div>
            </div>
            <div v-if="!isPhantomInstalled" class="ml-auto">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="text-gray-400">
                <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </div>
          </button>

          <!-- WalletConnect -->
          <button
            @click="handleConnectWalletConnect"
            :disabled="isConnecting"
            class="w-full flex items-center gap-4 p-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div>
              <div class="font-medium text-white">WalletConnect</div>
              <div class="text-sm text-gray-400">Connect with mobile wallets via QR code</div>
            </div>
          </button>
        </div>

        <!-- Wallet Installation Links -->
        <div class="mt-6 pt-4 border-t border-gray-700">
          <div class="text-sm text-gray-400 mb-3">Don't have a wallet?</div>
          <div class="flex gap-2">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 px-3 py-2 text-center text-xs bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30 transition-colors"
            >
              Get MetaMask
            </a>
            <a
              href="https://phantom.app/"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 px-3 py-2 text-center text-xs bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
            >
              Get Phantom
            </a>
          </div>
        </div>

        <!-- Info -->
        <div class="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div class="text-sm text-blue-400">
            <strong>Multi-Chain Support:</strong>
            <br>
            MetaMask: Ethereum & EVM chains
            <br>
            Phantom: Solana blockchain
            <br>
            WalletConnect: 100+ wallet apps
          </div>
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
const {
  isConnected,
  isConnecting,
  account,
  balance,
  connectedWallet,
  error,
  isMetaMaskInstalled,
  isPhantomInstalled,
  isWalletConnectAvailable,
  shortAddress,
  isOnSupportedChain,
  connectMetaMask,
  connectPhantom,
  connectWalletConnect,
  disconnect,
  switchToMainnet
} = useMultiWallet()

// Local state
const showConnectModal = ref(false)

// Connection handlers
const handleConnectMetaMask = async () => {
  if (!isMetaMaskInstalled.value) {
    window.open('https://metamask.io/download/', '_blank')
    return
  }

  try {
    const success = await connectMetaMask()
    if (success) {
      showConnectModal.value = false
      console.log('✅ MetaMask connected successfully!')
    }
  } catch (err) {
    console.error('❌ MetaMask connection failed:', err)
  }
}

const handleConnectPhantom = async () => {
  if (!isPhantomInstalled.value) {
    window.open('https://phantom.app/', '_blank')
    return
  }

  try {
    const success = await connectPhantom()
    if (success) {
      showConnectModal.value = false
      console.log('✅ Phantom connected successfully!')
    }
  } catch (err) {
    console.error('❌ Phantom connection failed:', err)
  }
}

const handleConnectWalletConnect = async () => {
  try {
    const success = await connectWalletConnect()
    if (success) {
      showConnectModal.value = false
      console.log('✅ WalletConnect connected successfully!')
    }
  } catch (err) {
    console.error('❌ WalletConnect connection failed:', err)
  }
}

// Template now uses handler functions directly

// Disconnect handler
const handleDisconnect = async () => {
  try {
    await disconnect()
    console.log('✅ Wallet disconnected')
  } catch (err) {
    console.error('❌ Disconnect failed:', err)
  }
}

// Clear error
const clearError = () => {
  // Error will be cleared by the composable
}

// Close modal when connected
watch(isConnected, (connected) => {
  if (connected) {
    showConnectModal.value = false
  }
})
</script>