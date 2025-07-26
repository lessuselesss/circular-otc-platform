<template>
  <div class="flex items-center gap-3">
    <!-- Connected State -->
    <div v-if="isConnected" class="flex items-center gap-3">
      <!-- Network Indicator -->
      <div class="flex items-center gap-2">
        <div 
          :class="[
            'circular-network-indicator',
            !isCorrectNetwork ? 'error' : ''
          ]"
        ></div>
        <span class="text-sm" style="color: var(--circular-text-secondary);">
          {{ getNetworkName(chainId) }}
        </span>
      </div>

      <!-- Balance -->
      <div class="text-sm" style="color: var(--circular-text-secondary);">
        {{ balance }} ETH
      </div>

      <!-- Account -->
      <div class="circular-wallet-connected flex items-center gap-2 px-3 py-2">
        <div class="w-6 h-6 rounded-full" style="background: linear-gradient(135deg, var(--circular-primary), var(--circular-purple));"></div>
        <span class="font-mono text-sm" style="color: var(--circular-text-primary);">{{ formatAddress(account) }}</span>
        <button 
          @click="copyAddress"
          class="transition-colors"
          style="color: var(--circular-text-secondary);"
          title="Copy address"
        >
          <Icon 
            :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" 
            class="w-4 h-4" 
            :style="copied ? 'color: var(--circular-primary);' : ''"
          />
        </button>
      </div>

      <!-- Disconnect Button -->
      <button
        @click="disconnect"
        class="text-sm transition-colors"
        style="color: var(--circular-error);"
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
          class="circular-input px-3 py-2 text-sm"
          style="width: 280px; font-size: 0.875rem;"
        />
        <button
          v-if="manualAddress"
          @click="clearManualAddress"
          class="transition-colors"
          style="color: var(--circular-text-secondary);"
          title="Clear address"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>

      <!-- Connect Button -->
      <button
        @click="connectMetaMask"
        :disabled="connecting"
        class="circular-btn flex items-center gap-2 px-4 py-2"
      >
        <div v-if="connecting" class="circular-loading"></div>
        <Icon v-else name="simple-icons:metamask" class="w-4 h-4" />
        <span>{{ connecting ? 'Connecting...' : 'Connect MetaMask' }}</span>
      </button>
    </div>

    <!-- Network Switch Button -->
    <button
      v-if="isConnected && !isCorrectNetwork"
      @click="switchToMainnet"
      class="circular-btn px-3 py-1 text-sm"
      style="background: var(--circular-warning); font-size: 0.75rem;"
    >
      Switch Network
    </button>
  </div>

  <!-- Error Message -->
  <div v-if="error" class="circular-error mt-2 p-2">
    <p class="text-sm">{{ error }}</p>
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