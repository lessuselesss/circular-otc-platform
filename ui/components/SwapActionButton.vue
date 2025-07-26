<template>
  <div class="w-full">
    <!-- Main Action Button -->
    <button
      @click="handlePrimaryAction"
      :disabled="isDisabled"
      :class="[
        'circular-btn w-full py-4 px-6 text-base font-medium',
        activeTab === 'otc' ? 'circular-btn-otc' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <span v-if="loading" class="flex items-center justify-center gap-2">
        <div class="circular-loading"></div>
        {{ loadingText }}
      </span>
      <span v-else class="flex items-center justify-center gap-2">
        {{ buttonText }}
        <span v-if="showWalletIcon" class="text-xs opacity-75">
          {{ walletIcon }}
        </span>
      </span>
    </button>

    <!-- Wallet Selection Modal -->
    <div 
      v-if="showWalletModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeWalletModal"
    >
      <div 
        class="circular-trading-panel p-6 max-w-sm w-full mx-4"
        @click.stop
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold" style="color: var(--circular-text-primary);">
            Connect Wallet
          </h3>
          <button 
            @click="closeWalletModal"
            class="text-2xl"
            style="color: var(--circular-text-secondary);"
          >
            ×
          </button>
        </div>

        <div class="space-y-3">
          <!-- MetaMask -->
          <button
            @click="connectWallet('metamask')"
            :disabled="connecting"
            class="w-full flex items-center gap-3 p-4 rounded-lg border transition-colors"
            style="border-color: var(--circular-border); background: var(--circular-bg-secondary);"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #f6851b;">
              <span class="text-white font-bold text-sm">M</span>
            </div>
            <div class="flex-1 text-left">
              <div class="font-medium" style="color: var(--circular-text-primary);">MetaMask</div>
              <div class="text-sm" style="color: var(--circular-text-secondary);">Ethereum wallet</div>
            </div>
            <div v-if="connecting === 'metamask'" class="circular-loading"></div>
          </button>

          <!-- Phantom -->
          <button
            @click="connectWallet('phantom')"
            :disabled="connecting"
            class="w-full flex items-center gap-3 p-4 rounded-lg border transition-colors"
            style="border-color: var(--circular-border); background: var(--circular-bg-secondary);"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #ab9ff2;">
              <span class="text-white font-bold text-sm">P</span>
            </div>
            <div class="flex-1 text-left">
              <div class="font-medium" style="color: var(--circular-text-primary);">Phantom</div>
              <div class="text-sm" style="color: var(--circular-text-secondary);">Solana wallet</div>
            </div>
            <div v-if="connecting === 'phantom'" class="circular-loading"></div>
          </button>

          <!-- WalletConnect -->
          <button
            @click="connectWallet('walletconnect')"
            :disabled="connecting"
            class="w-full flex items-center gap-3 p-4 rounded-lg border transition-colors"
            style="border-color: var(--circular-border); background: var(--circular-bg-secondary);"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #3b99fc;">
              <span class="text-white font-bold text-sm">W</span>
            </div>
            <div class="flex-1 text-left">
              <div class="font-medium" style="color: var(--circular-text-primary);">WalletConnect</div>
              <div class="text-sm" style="color: var(--circular-text-secondary);">Scan with any wallet</div>
            </div>
            <div v-if="connecting === 'walletconnect'" class="circular-loading"></div>
          </button>
        </div>

        <!-- Manual Address Option -->
        <div class="mt-6 pt-4" style="border-top: 1px solid var(--circular-border);">
          <div class="text-sm mb-3" style="color: var(--circular-text-secondary);">
            Or paste wallet address for quotes only:
          </div>
          <input
            v-model="manualAddress"
            type="text"
            placeholder="0x..."
            class="circular-input w-full px-3 py-2 text-sm"
          />
          <button
            v-if="manualAddress"
            @click="useManualAddress"
            class="circular-btn w-full mt-3 py-2 text-sm"
          >
            Use Address for Quotes
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="circular-error mt-3 p-3">
      <p class="text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  inputAmount: String,
  activeTab: String,
  loading: Boolean,
  loadingText: String,
  canPurchase: Boolean
})

const emit = defineEmits(['execute-swap'])

// Wallet integration
const { isConnected, account, connectMetaMask } = useWallet()

// Component state
const showWalletModal = ref(false)
const connecting = ref(null)
const error = ref('')
const manualAddress = ref('')

// Computed properties
const buttonText = computed(() => {
  if (props.loading) return props.loadingText

  // If no amount entered
  if (!props.inputAmount || parseFloat(props.inputAmount) <= 0) {
    return 'Enter an amount'
  }

  // If wallet not connected and no manual address
  if (!isConnected.value && !manualAddress.value) {
    return 'Connect Wallet'
  }

  // If wallet connected, ready to trade
  if (isConnected.value) {
    if (props.activeTab === 'liquid') {
      return 'Buy CIRX (Instant)'
    } else {
      return 'Buy CIRX (6-month vesting)'
    }
  }

  // If manual address provided (quotes only)
  if (manualAddress.value && !isConnected.value) {
    return 'Connect wallet to trade'
  }

  return 'Ready to trade'
})

const isDisabled = computed(() => {
  return props.loading || 
         (!props.inputAmount || parseFloat(props.inputAmount) <= 0)
})

const showWalletIcon = computed(() => {
  return isConnected.value && account.value
})

const walletIcon = computed(() => {
  if (isConnected.value) {
    return '🦊' // MetaMask fox emoji
  }
  return ''
})

// Methods
const handlePrimaryAction = async () => {
  if (isDisabled.value) return

  // If no amount, focus input (handled by parent)
  if (!props.inputAmount || parseFloat(props.inputAmount) <= 0) {
    return
  }

  // If wallet not connected, show wallet selection
  if (!isConnected.value && !manualAddress.value) {
    showWalletModal.value = true
    return
  }

  // If manual address but no wallet connection, prompt to connect
  if (manualAddress.value && !isConnected.value) {
    showWalletModal.value = true
    return
  }

  // If wallet connected and has amount, execute swap
  if (isConnected.value && props.canPurchase) {
    emit('execute-swap')
    return
  }
}

const connectWallet = async (walletType) => {
  try {
    connecting.value = walletType
    error.value = ''

    switch (walletType) {
      case 'metamask':
        await connectMetaMask()
        break
      case 'phantom':
        error.value = 'Phantom wallet integration coming soon'
        break
      case 'walletconnect':
        error.value = 'WalletConnect integration coming soon'
        break
    }

    if (isConnected.value) {
      showWalletModal.value = false
    }
  } catch (err) {
    error.value = err.message || `Failed to connect ${walletType}`
  } finally {
    connecting.value = null
  }
}

const useManualAddress = () => {
  if (manualAddress.value) {
    showWalletModal.value = false
    // Manual address is now available for quotes
  }
}

const closeWalletModal = () => {
  showWalletModal.value = false
  connecting.value = null
  error.value = ''
}

// Expose manual address for parent components
defineExpose({
  manualAddress: readonly(manualAddress),
  isConnected,
  account
})
</script>