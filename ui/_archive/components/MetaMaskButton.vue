<template>
  <div class="relative">
    <!-- Connect Button -->
    <button
      v-if="!isConnected"
      @click="handleConnect"
      class="px-4 py-2 bg-circular-primary text-gray-900 rounded-lg font-medium hover:bg-circular-primary-hover transition-colors flex items-center gap-2"
      :disabled="isConnecting"
    >
      <!-- MetaMask Icon -->
      <div class="w-5 h-5 bg-orange-500 rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-xs">M</span>
      </div>
      <span v-if="isConnecting">Connecting...</span>
      <span v-else-if="!isMetaMaskInstalled">Install MetaMask</span>
      <span v-else>Connect Wallet</span>
    </button>

    <!-- Connected State -->
    <div v-else class="flex items-center gap-3">
      <!-- Network Status -->
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
          <div class="w-2 h-2 bg-green-400 rounded-full"></div>
          <span class="text-sm font-medium text-white">{{ shortAddress }}</span>
        </div>
        <div class="text-xs text-gray-400">
          {{ balance }} ETH
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

    <!-- MetaMask Not Installed Modal -->
    <div
      v-if="showInstallModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="showInstallModal = false"
    >
      <div
        class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm"
        @click.stop
      >
        <div class="text-center">
          <div class="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-2xl">M</span>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">MetaMask Required</h3>
          <p class="text-gray-400 mb-6">
            You need MetaMask to use this application. MetaMask is a secure wallet for Ethereum.
          </p>
          
          <div class="space-y-3">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Install MetaMask
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7z"/>
              </svg>
            </a>
            <button
              @click="showInstallModal = false"
              class="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
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
      Please switch to Ethereum Mainnet or Sepolia testnet to continue.
    </div>
  </div>
</template>

<script setup>
const {
  isConnected,
  isConnecting,
  account,
  balance,
  error,
  isMetaMaskInstalled,
  shortAddress,
  isOnSupportedChain,
  connect,
  disconnect,
  switchToMainnet
} = useMetaMask()

// Local state
const showInstallModal = ref(false)

// Connection handler
const handleConnect = async () => {
  if (!isMetaMaskInstalled.value) {
    showInstallModal.value = true
    return
  }

  try {
    const success = await connect()
    if (success) {
      console.log('✅ MetaMask connected successfully!')
    }
  } catch (err) {
    console.error('❌ Connection failed:', err)
  }
}

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
  // The error will be cleared by the composable
}

// Watch for MetaMask installation
watch(isMetaMaskInstalled, (installed) => {
  if (installed && showInstallModal.value) {
    showInstallModal.value = false
  }
}, { immediate: true })
</script>