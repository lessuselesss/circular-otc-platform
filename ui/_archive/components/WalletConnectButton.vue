<template>
  <div class="relative">
    <!-- Connected State -->
    <div v-if="walletStore.isConnected" class="flex items-center gap-3">
      <!-- Network Indicator -->
      <div v-if="!walletStore.activeWallet?.isOnSupportedChain" 
           class="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
        <span class="text-xs text-red-400 font-medium">Wrong Network</span>
      </div>
      
      <!-- Chain Badge -->
      <div class="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
        <div class="w-2 h-2 rounded-full bg-green-400"></div>
        <span class="text-sm font-medium text-white capitalize">
          {{ walletStore.activeWallet?.chain }}
        </span>
      </div>

      <!-- Wallet Info -->
      <button
        @click="showAccountModal = !showAccountModal"
        class="flex items-center gap-2 px-4 py-2 bg-circular-primary/10 border border-circular-primary/30 rounded-full hover:bg-circular-primary/20 transition-all duration-200"
      >
        <div class="w-6 h-6 rounded-full bg-circular-primary/20 flex items-center justify-center">
          <span class="text-xs font-bold text-circular-primary">
            {{ walletStore.activeWallet?.address?.slice(2, 4).toUpperCase() }}
          </span>
        </div>
        <span class="text-sm font-medium text-white">
          {{ walletStore.activeWallet?.shortAddress }}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="text-gray-400">
          <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Disconnected State -->
    <button
      v-else
      @click="showWalletModal = true"
      :disabled="walletStore.isConnecting"
      class="flex items-center gap-2 px-4 py-2 bg-circular-primary hover:bg-circular-primary/90 text-gray-900 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg v-if="walletStore.isConnecting" class="animate-spin w-4 h-4" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-if="walletStore.isConnecting">Connecting...</span>
      <span v-else>Connect Wallet</span>
    </button>

    <!-- Account Modal -->
    <AccountModal
      v-if="showAccountModal"
      :wallet="walletStore.activeWallet"
      @close="showAccountModal = false"
      @disconnect="handleDisconnect"
      @switch-network="handleSwitchNetwork"
    />

    <!-- Wallet Selection Modal -->
    <WalletSelectionModal
      v-if="showWalletModal"
      :available-wallets="walletStore.availableWallets"
      :is-connecting="walletStore.isConnecting"
      @close="showWalletModal = false"
      @connect="handleConnect"
    />
  </div>
</template>

<script setup>
// Store and composables
const walletStore = useWalletStore()

// Local state
const showAccountModal = ref(false)
const showWalletModal = ref(false)

// Methods
const handleConnect = async (walletType, chain) => {
  try {
    await walletStore.connectWallet(walletType, chain)
    showWalletModal.value = false
  } catch (error) {
    console.error('Connection failed:', error)
    // Error is handled in the store and available via walletStore.currentError
  }
}

const handleDisconnect = async () => {
  try {
    await walletStore.disconnectWallet()
    showAccountModal.value = false
  } catch (error) {
    console.error('Disconnection failed:', error)
  }
}

const handleSwitchNetwork = async (chainId) => {
  try {
    await walletStore.switchChain(chainId)
    showAccountModal.value = false
  } catch (error) {
    console.error('Network switch failed:', error)
  }
}

// Close modals when clicking outside
const closeModalsOnClickOutside = (event) => {
  if (!event.target.closest('.wallet-connect-button')) {
    showAccountModal.value = false
    showWalletModal.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeModalsOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeModalsOnClickOutside)
})
</script>

<style scoped>
.wallet-connect-button {
  /* Ensure click outside detection works */
  position: relative;
}
</style>