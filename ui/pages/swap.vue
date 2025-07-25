<template>
  <div class="max-w-md mx-auto py-8">
    <div class="swap-container">
      <div class="swap-header">
        <h1 class="swap-title">Swap Tokens</h1>
        <p class="text-sm text-gray-500 mt-1">
          Trade tokens in an instant
        </p>
      </div>

      <form @submit.prevent="handleSwap">
        <!-- From Token Input -->
        <div class="token-input">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500">From</span>
            <span v-if="fromBalance" class="text-sm text-gray-500">
              Balance: {{ fromBalance }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="fromAmount"
              type="number"
              step="any"
              placeholder="0.0"
              class="flex-1"
              :disabled="loading"
            />
            <button
              type="button"
              class="token-select"
              @click="openTokenSelector('from')"
              :disabled="loading"
            >
              <img
                v-if="fromToken.logo"
                :src="fromToken.logo"
                :alt="fromToken.symbol"
                class="w-6 h-6 rounded-full"
              />
              <span class="font-medium">{{ fromToken.symbol }}</span>
              <Icon name="heroicons:chevron-down" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Swap Direction Button -->
        <div class="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            @click="swapTokens"
            :disabled="loading"
            class="bg-white border-4 border-gray-100 rounded-xl p-2 hover:border-gray-200 transition-colors"
          >
            <Icon name="heroicons:arrow-down" class="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <!-- To Token Input -->
        <div class="token-input">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500">To</span>
            <span v-if="toBalance" class="text-sm text-gray-500">
              Balance: {{ toBalance }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model="toAmount"
              type="number"
              step="any"
              placeholder="0.0"
              class="flex-1"
              readonly
            />
            <button
              type="button"
              class="token-select"
              @click="openTokenSelector('to')"
              :disabled="loading"
            >
              <img
                v-if="toToken.logo"
                :src="toToken.logo"
                :alt="toToken.symbol"
                class="w-6 h-6 rounded-full"
              />
              <span class="font-medium">{{ toToken.symbol }}</span>
              <Icon name="heroicons:chevron-down" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Swap Details -->
        <div v-if="swapQuote" class="bg-gray-50 rounded-lg p-3 mt-4 text-sm">
          <div class="flex justify-between mb-1">
            <span class="text-gray-600">Rate</span>
            <span>1 {{ fromToken.symbol }} = {{ swapQuote.rate }} {{ toToken.symbol }}</span>
          </div>
          <div class="flex justify-between mb-1">
            <span class="text-gray-600">Fee</span>
            <span>{{ swapQuote.fee }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Slippage</span>
            <span>{{ slippage }}%</span>
          </div>
        </div>

        <!-- Swap Button -->
        <button
          type="submit"
          class="swap-button"
          :disabled="!canSwap || loading"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <div class="loading-spinner"></div>
            {{ loadingText }}
          </span>
          <span v-else>
            {{ swapButtonText }}
          </span>
        </button>
      </form>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700 text-sm">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Swap Tokens',
  layout: 'default'
})

// Reactive state
const fromAmount = ref('')
const toAmount = ref('')
const fromToken = ref({ symbol: 'ETH', name: 'Ethereum', logo: null })
const toToken = ref({ symbol: 'USDC', name: 'USD Coin', logo: null })
const loading = ref(false)
const loadingText = ref('')
const error = ref('')
const slippage = ref(0.5)

// Mock data - replace with actual Web3 integration
const fromBalance = ref('0.0')
const toBalance = ref('0.0')
const swapQuote = ref(null)

// Computed properties
const canSwap = computed(() => {
  return fromAmount.value && 
         parseFloat(fromAmount.value) > 0 && 
         fromToken.value.symbol !== toToken.value.symbol &&
         !loading.value
})

const swapButtonText = computed(() => {
  if (!fromAmount.value) return 'Enter an amount'
  if (fromToken.value.symbol === toToken.value.symbol) return 'Select a token'
  if (parseFloat(fromAmount.value) <= 0) return 'Enter a valid amount'
  return `Swap ${fromToken.value.symbol} for ${toToken.value.symbol}`
})

// Methods
const swapTokens = () => {
  const temp = fromToken.value
  fromToken.value = toToken.value
  toToken.value = temp
  
  // Clear amounts when swapping
  fromAmount.value = toAmount.value
  toAmount.value = ''
}

const openTokenSelector = (direction) => {
  // TODO: Implement token selector modal
  console.log(`Opening token selector for ${direction}`)
}

const handleSwap = async () => {
  if (!canSwap.value) return
  
  try {
    loading.value = true
    loadingText.value = 'Preparing swap...'
    error.value = ''
    
    // TODO: Implement actual swap logic with Web3
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    loadingText.value = 'Executing swap...'
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Reset form on success
    fromAmount.value = ''
    toAmount.value = ''
    
    // Show success message
    // TODO: Implement success notification
    
  } catch (err) {
    error.value = err.message || 'Swap failed. Please try again.'
  } finally {
    loading.value = false
    loadingText.value = ''
  }
}

// Watch for amount changes to update quote
watch(fromAmount, async (newAmount) => {
  if (!newAmount || parseFloat(newAmount) <= 0) {
    toAmount.value = ''
    swapQuote.value = null
    return
  }
  
  // TODO: Implement actual price quote fetching
  // Mock quote calculation
  const mockRate = 1850 // 1 ETH = 1850 USDC
  const calculatedAmount = (parseFloat(newAmount) * mockRate).toFixed(6)
  toAmount.value = calculatedAmount
  
  swapQuote.value = {
    rate: mockRate.toFixed(2),
    fee: 0.3
  }
})

// Head configuration
useHead({
  title: 'Swap Tokens - UniswapV3 Clone',
  meta: [
    { name: 'description', content: 'Swap tokens instantly with optimal pricing on our decentralized exchange.' }
  ]
})
</script>