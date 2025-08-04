<template>
  <div class="relative">
    <!-- Connect Button -->
    <button
      v-if="!isConnected"
      @click="showConnectModal = true"
      class="px-4 py-2 bg-circular-primary text-gray-900 rounded-lg font-medium hover:bg-circular-primary-hover transition-colors"
      :disabled="isConnecting"
    >
      <span v-if="isConnecting">Connecting...</span>
      <span v-else>Connect Wallet</span>
    </button>

    <!-- Connected State -->
    <div v-else class="flex items-center gap-3">
      <!-- Account Info -->
      <div class="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-400 rounded-full"></div>
          <span class="text-sm font-medium text-white">{{ shortAddress }}</span>
        </div>
        <div v-if="balances.ETH" class="text-xs text-gray-400">
          {{ parseFloat(balances.ETH).toFixed(4) }} ETH
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
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="showConnectModal = false"
    >
      <div
        class="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm"
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
            @click="connectMetaMask"
            class="w-full flex items-center gap-3 p-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors text-left"
            :disabled="isConnecting"
          >
            <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <div class="font-medium text-white">MetaMask</div>
              <div class="text-sm text-gray-400">Most popular Ethereum wallet</div>
            </div>
          </button>

          <!-- WalletConnect -->
          <button
            @click="connectWalletConnect"
            class="w-full flex items-center gap-3 p-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors text-left"
            :disabled="isConnecting"
          >
            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <div class="font-medium text-white">WalletConnect</div>
              <div class="text-sm text-gray-400">Connect with mobile wallets</div>
            </div>
          </button>

          <!-- Coinbase -->
          <button
            @click="connectCoinbase"
            class="w-full flex items-center gap-3 p-4 border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors text-left"
            :disabled="isConnecting"
          >
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <div class="font-medium text-white">Coinbase Wallet</div>
              <div class="text-sm text-gray-400">Self-custody wallet</div>
            </div>
          </button>
        </div>

        <!-- Note -->
        <div class="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div class="text-sm text-blue-400">
            <strong>New to Ethereum?</strong>
            <br>
            We recommend starting with MetaMask for the best experience.
          </div>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div
      v-if="error"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="error = null"
    >
      <div class="bg-red-900/90 border border-red-700 rounded-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold text-red-200 mb-3">Connection Error</h3>
        <p class="text-red-300 text-sm mb-4">{{ error }}</p>
        <button
          @click="error = null"
          class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { 
  isConnected, 
  isConnecting, 
  shortAddress, 
  balances,
  connectWallet, 
  disconnectWallet 
} = useWallet()

// Local state
const showConnectModal = ref(false)
const error = ref(null)

// Connection methods
const connectMetaMask = async () => {
  try {
    await connectWallet('metaMask')
    showConnectModal.value = false
  } catch (err) {
    error.value = err.message || 'Failed to connect MetaMask'
  }
}

const connectWalletConnect = async () => {
  try {
    await connectWallet('walletConnect')
    showConnectModal.value = false
  } catch (err) {
    error.value = err.message || 'Failed to connect via WalletConnect'
  }
}

const connectCoinbase = async () => {
  try {
    await connectWallet('coinbase')
    showConnectModal.value = false
  } catch (err) {
    error.value = err.message || 'Failed to connect Coinbase Wallet'
  }
}

const handleDisconnect = async () => {
  try {
    await disconnectWallet()
  } catch (err) {
    error.value = err.message || 'Failed to disconnect wallet'
  }
}
</script>