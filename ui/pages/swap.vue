<template>
  <div class="min-h-screen bg-circular-bg-primary">
    <!-- Header -->
    <header class="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2 sm:gap-4">
            <h1 class="font-michroma text-lg sm:text-xl text-circular-primary">Circular CIRX</h1>
            <span class="text-xs sm:text-sm hidden sm:block text-gray-400">OTC Trading Platform</span>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <!-- Navigation -->
            <NuxtLink 
              to="/history" 
              class="px-3 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              History
            </NuxtLink>
            <!-- Multi-Wallet connection -->
            <MultiWalletButton />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content: Properly Centered Trading Card -->
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <div class="w-full max-w-lg mx-auto">
        <!-- Centered Trading Card -->
        <div class="bg-gradient-to-br from-circular-bg-secondary to-circular-bg-secondary/95 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <!-- Tab Headers -->
          <div class="flex mb-6 border-b border-gray-600">
            <button
              @click="activeTab = 'liquid'"
              :class="[
                'px-6 py-3 text-sm font-medium font-michroma transition-all duration-300 border-b-2',
                activeTab === 'liquid' 
                  ? 'text-circular-primary border-circular-primary bg-circular-primary/10' 
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              ]"
            >
              Buy Liquid
              <span class="ml-2 px-2 py-1 text-xs bg-circular-primary text-gray-900 rounded-full font-semibold">
                Immediate
              </span>
            </button>
            <button
              @click="activeTab = 'otc'"
              :class="[
                'px-6 py-3 text-sm font-medium font-michroma transition-all duration-300 border-b-2 ml-4',
                activeTab === 'otc' 
                  ? 'text-circular-purple border-circular-purple bg-circular-purple/10' 
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              ]"
            >
              Buy OTC
              <span class="ml-2 px-2 py-1 text-xs bg-circular-purple text-white rounded-full font-semibold">
                5-12% Discount
              </span>
            </button>
          </div>

          <!-- Tab Content -->
          <form @submit.prevent="handleSwap">
            <!-- Input Token Selection -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-3">
                <label class="text-sm font-medium text-white">Pay with</label>
                <span v-if="inputBalance" class="text-sm cursor-pointer hover:text-white transition-colors text-gray-400" @click="setMaxAmount">
                  Balance: {{ inputBalance }} {{ inputToken }}
                </span>
              </div>
              <div class="relative">
                <input
                  v-model="inputAmount"
                  type="number"
                  step="any"
                  placeholder="0.0"
                  class="w-full pl-4 pr-32 py-4 text-xl font-semibold bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-circular-primary focus:ring-1 focus:ring-circular-primary transition-colors"
                  :disabled="loading"
                />
                <div class="absolute inset-y-0 right-0 flex items-center">
                  <select
                    v-model="inputToken"
                    class="h-full py-0 pl-3 pr-8 border-0 bg-transparent font-medium text-white rounded-r-xl focus:outline-none"
                    :disabled="loading"
                  >
                    <!-- Dynamic token options based on connected wallet -->
                    <template v-if="connectedWallet === 'phantom'">
                      <option value="SOL" class="bg-gray-900">SOL</option>
                      <option value="USDC_SOL" class="bg-gray-900">USDC</option>
                    </template>
                    <template v-else>
                      <option value="ETH" class="bg-gray-900">ETH</option>
                      <option value="USDC" class="bg-gray-900">USDC</option>
                      <option value="USDT" class="bg-gray-900">USDT</option>
                    </template>
                  </select>
                </div>
              </div>
            </div>

            <!-- Swap Arrow -->
            <div class="flex justify-center mb-6">
              <button
                type="button"
                class="p-3 bg-gray-700 border border-gray-600 rounded-xl text-circular-primary hover:bg-gray-600 hover:border-circular-primary transition-all duration-300"
                @click="reverseSwap"
                :disabled="loading"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <!-- CIRX Output -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-3">
                <label class="text-sm font-medium text-white">Receive</label>
                <span v-if="displayCirxBalance" class="text-sm text-gray-400">
                  Balance: {{ displayCirxBalance }} CIRX
                </span>
              </div>
              <div class="relative">
                <input
                  v-model="cirxAmount"
                  type="number"
                  step="any"
                  placeholder="0.0"
                  class="w-full pl-4 pr-20 py-4 text-xl font-semibold bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 opacity-75"
                  readonly
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span class="font-semibold text-circular-primary">CIRX</span>
                </div>
              </div>
            </div>

            <!-- Purchase Details -->
            <div v-if="quote" class="bg-gray-900 border border-gray-600 rounded-xl p-4 mb-6">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-400">Exchange Rate</span>
                <span class="text-sm font-medium text-white">1 {{ inputToken }} = ${{ quote.rate }}</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-400">Fee</span>
                <span class="text-sm font-medium text-white">{{ quote.fee }}%</span>
              </div>
              <div v-if="activeTab === 'otc' && quote.discount > 0" class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-400">OTC Discount</span>
                <span class="text-sm font-medium text-circular-primary">{{ quote.discount }}%</span>
              </div>
              <div v-if="activeTab === 'otc'" class="flex justify-between items-center">
                <span class="text-sm text-gray-400">Vesting Period</span>
                <span class="text-sm font-medium text-white">6 months (linear)</span>
              </div>
            </div>

            <!-- OTC Discount Tiers (only show on OTC tab) -->
            <div v-if="activeTab === 'otc'" class="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
              <h4 class="text-sm font-medium mb-3 text-purple-400">OTC Discount Tiers</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">$1,000 - $10,000</span>
                  <span class="font-medium text-purple-400">5% discount</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">$10,000 - $50,000</span>
                  <span class="font-medium text-purple-400">8% discount</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">$50,000+</span>
                  <span class="font-medium text-purple-400">12% discount</span>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <button
              type="submit"
              :disabled="!canPurchase || loading"
              :class="[
                'w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300',
                activeTab === 'liquid' 
                  ? 'bg-circular-primary text-gray-900 hover:bg-circular-primary-hover' 
                  : 'bg-circular-purple text-white hover:bg-purple-700',
                (!canPurchase || loading) && 'opacity-50 cursor-not-allowed'
              ]"
            >
              <span v-if="loading">{{ loadingText || 'Processing...' }}</span>
              <span v-else-if="!isConnected">Connect Wallet to Continue</span>
              <span v-else-if="!inputAmount">Enter an amount</span>
              <span v-else-if="activeTab === 'liquid'">Buy Liquid CIRX</span>
              <span v-else>Buy OTC CIRX (6mo vest)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Circular CIRX OTC Platform',
  layout: 'default'
})

// Multi-Wallet connection
const { 
  isConnected, 
  account, 
  balance,
  connectedWallet,
  getTokenBalance,
  executeSwap
} = useMultiWallet()

// Reactive state
const activeTab = ref('liquid')
const inputAmount = ref('')
const cirxAmount = ref('')
const inputToken = ref('ETH')
const loading = ref(false)
const loadingText = ref('')
const quote = ref(null)

// Use wallet balances when connected, otherwise show placeholders
const inputBalance = computed(() => {
  if (!isConnected.value) {
    return '0.0'
  }
  
  // Adjust token symbol based on connected wallet
  let tokenSymbol = inputToken.value
  if (connectedWallet.value === 'phantom' && inputToken.value === 'ETH') {
    tokenSymbol = 'SOL'
  } else if (connectedWallet.value === 'phantom' && inputToken.value === 'USDC') {
    tokenSymbol = 'USDC_SOL'
  }
  
  return getTokenBalance(tokenSymbol)
})

const displayCirxBalance = computed(() => {
  return isConnected.value ? getTokenBalance('CIRX') : '0.0'
})

// Token prices (mock data)
const tokenPrices = {
  ETH: 2500,   // $2500 per ETH
  USDC: 1,     // $1 per USDC  
  USDT: 1      // $1 per USDT
}

// Fee structure
const fees = {
  liquid: 0.3,  // 0.3% for liquid swaps
  otc: 0.15     // 0.15% for OTC swaps
}

// Discount tiers
const discountTiers = [
  { minAmount: 50000, discount: 12 },  // $50K+: 12%
  { minAmount: 10000, discount: 8 },   // $10K+: 8%  
  { minAmount: 1000, discount: 5 }     // $1K+: 5%
]

// Computed properties
const canPurchase = computed(() => {
  return inputAmount.value && 
         parseFloat(inputAmount.value) > 0 && 
         !loading.value &&
         isConnected.value
})

// Calculate discount based on USD amount
const calculateDiscount = (usdAmount) => {
  for (const tier of discountTiers) {
    if (usdAmount >= tier.minAmount) {
      return tier.discount
    }
  }
  return 0
}

// Calculate quote for purchase
const calculateQuote = (amount, token, isOTC = false) => {
  if (!amount || parseFloat(amount) <= 0) return null
  
  const inputValue = parseFloat(amount)
  const tokenPrice = tokenPrices[token]
  const totalUsdValue = inputValue * tokenPrice
  
  // Calculate fee
  const feeRate = isOTC ? fees.otc : fees.liquid
  const fee = (inputValue * feeRate) / 100
  const amountAfterFee = inputValue - fee
  const usdAfterFee = amountAfterFee * tokenPrice
  
  let cirxReceived = usdAfterFee // Assume CIRX = $1
  let discount = 0
  
  // Apply OTC discount
  if (isOTC) {
    discount = calculateDiscount(totalUsdValue)
    cirxReceived = usdAfterFee * (1 + discount / 100)
  }
  
  return {
    rate: tokenPrice.toFixed(2),
    fee: feeRate,
    discount: discount,
    cirxAmount: cirxReceived.toFixed(2),
    usdValue: totalUsdValue.toFixed(2)
  }
}

// Methods
const setMaxAmount = () => {
  if (isConnected.value) {
    // Set to 95% of balance to account for gas fees
    const balance = parseFloat(getTokenBalance(inputToken.value))
    const maxAmount = inputToken.value === 'ETH' ? balance * 0.95 : balance * 0.99
    inputAmount.value = maxAmount.toFixed(6)
  } else {
    inputAmount.value = '1.0' // Fallback for demo
  }
}

const reverseSwap = () => {
  console.log('Reverse swap not supported yet')
}

const handleSwap = async () => {
  if (!canPurchase.value) return
  
  // Check wallet connection
  if (!isConnected.value) {
    alert('Please connect your wallet first')
    return
  }
  
  try {
    loading.value = true
    loadingText.value = activeTab.value === 'liquid' ? 'Executing liquid purchase...' : 'Creating OTC vesting position...'
    
    const isOTC = activeTab.value === 'otc'
    const minCirxOut = parseFloat(cirxAmount.value) * 0.99 // 1% slippage tolerance
    
    // Execute the swap via connected wallet
    const result = await executeSwap(
      inputToken.value,
      inputAmount.value,
      'CIRX',
      isOTC
    )
    
    if (result.success) {
      // Show success message
      const message = isOTC 
        ? `OTC purchase successful! Your ${cirxAmount.value} CIRX will vest over 6 months. Transaction: ${result.hash.slice(0, 10)}...`
        : `Liquid purchase successful! You received ${cirxAmount.value} CIRX immediately. Transaction: ${result.hash.slice(0, 10)}...`
      
      alert(message)
      
      // Reset form
      inputAmount.value = ''
      cirxAmount.value = ''
      quote.value = null
    }
  } catch (error) {
    console.error('Swap failed:', error)
    alert(`Transaction failed: ${error.message}`)
  } finally {
    loading.value = false
    loadingText.value = ''
  }
}

// Watch for amount and tab changes to update quote
watch([inputAmount, inputToken, activeTab], async () => {
  if (!inputAmount.value || parseFloat(inputAmount.value) <= 0) {
    cirxAmount.value = ''
    quote.value = null
    return
  }
  
  const isOTC = activeTab.value === 'otc'
  
  // Always use mock quote for now (will be replaced with real contract calls)
  const newQuote = calculateQuote(inputAmount.value, inputToken.value, isOTC)
  
  if (newQuote) {
    quote.value = newQuote
    cirxAmount.value = newQuote.cirxAmount
  }
}, { immediate: true })

// Head configuration
useHead({
  title: 'Circular CIRX OTC Platform - Buy CIRX Tokens',
  meta: [
    { 
      name: 'description', 
      content: 'Buy CIRX tokens with liquid delivery or OTC discounts up to 12%. Demo interface with Tailwind CSS styling.' 
    }
  ]
})
</script>