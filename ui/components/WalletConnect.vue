<template>
  <div class="flex items-center gap-3">
    <!-- Connected State -->
    <div v-if="isConnected" class="flex items-center gap-3">
      <!-- Network Indicator -->
      <div class="flex items-center gap-2">
        <div 
          :class="[
            'w-2 h-2 rounded-full',
            isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'
          ]"
        ></div>
        <span class="text-sm text-gray-600">
          {{ getNetworkName(chainId) }}
        </span>
      </div>

      <!-- Balance -->
      <div class="text-sm text-gray-600">
        {{ balance }} ETH
      </div>

      <!-- Account -->
      <div class="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        <span class="font-mono text-sm">{{ formatAddress(account) }}</span>
        <button 
          @click="copyAddress"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="Copy address"
        >
          <Icon 
            :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" 
            class="w-4 h-4" 
          />
        </button>
      </div>

      <!-- Disconnect Button -->
      <button
        @click="disconnect"
        class="text-sm text-red-600 hover:text-red-700 transition-colors"
        title="Disconnect wallet"
      >
        <Icon name="heroicons:power" class="w-4 h-4" />
      </button>
    </div>

    <!-- Disconnected State -->
    <div v-else class="flex items-center gap-3">
      <!-- Manual Address Input -->
      <div class="flex items-center gap-2">
        <input
          v-model="manualAddress"
          type="text"
          placeholder="Paste wallet address (optional)"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style="width: 280px"
        />
        <button
          v-if="manualAddress"
          @click="clearManualAddress"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          title="Clear address"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>

      <!-- Connect Button -->
      <button
        @click="connectMetaMask"
        :disabled="connecting"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <div v-if="connecting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <Icon v-else name="simple-icons:metamask" class="w-4 h-4" />
        <span>{{ connecting ? 'Connecting...' : 'Connect MetaMask' }}</span>
      </button>
    </div>

    <!-- Network Switch Button -->
    <button
      v-if="isConnected && !isCorrectNetwork"
      @click="switchToMainnet"
      class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
    >
      Switch Network
    </button>
  </div>

  <!-- Error Message -->
  <div v-if="error" class="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
    <p class="text-red-700 text-sm">{{ error }}</p>
  </div>
</template>

<script setup>
const {
  isConnected,
  account,
  chainId,
  balance,
  connecting,
  error,
  isCorrectNetwork,
  connectMetaMask,
  disconnect,
  switchNetwork,
  formatAddress
} = useWallet()

// Manual address input
const manualAddress = ref('')

// Copy functionality
const copied = ref(false)

// Copy address to clipboard
const copyAddress = async () => {
  if (!account.value) return
  
  try {
    await navigator.clipboard.writeText(account.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy address:', err)
  }
}

// Clear manual address
const clearManualAddress = () => {
  manualAddress.value = ''
}

// Switch to mainnet
const switchToMainnet = async () => {
  try {
    await switchNetwork(1) // Mainnet
  } catch (err) {
    console.error('Failed to switch network:', err)
  }
}

// Get network name
const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum',
    11155111: 'Sepolia',
    5: 'Goerli'
  }
  return networks[chainId] || `Chain ${chainId}`
}

// Expose manual address for parent components
defineExpose({
  manualAddress: readonly(manualAddress),
  isConnected,
  account
})
</script>