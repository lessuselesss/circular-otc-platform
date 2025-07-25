<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-gray-900">Circular CIRX</h1>
            <span class="text-sm text-gray-500">OTC Trading Platform</span>
          </div>
          <div class="flex items-center gap-4">
            <!-- Wallet connection status placeholder -->
            <div class="text-sm text-gray-500">
              Connect Wallet
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content: Trading Panel (60%) + Chart Panel (40%) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        <!-- Trading Panel (60%) -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <!-- Tab Headers -->
            <div class="flex border-b border-gray-200 mb-6">
              <button
                @click="activeTab = 'liquid'"
                :class="[
                  'px-4 py-2 font-medium text-sm border-b-2 transition-colors',
                  activeTab === 'liquid' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                ]"
              >
                Buy Liquid
                <span class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Immediate
                </span>
              </button>
              <button
                @click="activeTab = 'otc'"
                :class="[
                  'px-4 py-2 font-medium text-sm border-b-2 transition-colors ml-8',
                  activeTab === 'otc' 
                    ? 'text-purple-600 border-purple-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                ]"
              >
                Buy OTC
                <span class="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  5-12% Discount
                </span>
              </button>
            </div>

            <!-- Tab Content -->
            <form @submit.prevent="handleSwap">
              <!-- Input Token Selection -->
              <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium text-gray-700">Pay with</label>
                  <span v-if="inputBalance" class="text-sm text-gray-500">
                    Balance: {{ inputBalance }}
                  </span>
                </div>
                <div class="relative">
                  <input
                    v-model="inputAmount"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    class="w-full pl-4 pr-32 py-4 text-xl font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    :disabled="loading"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center">
                    <select
                      v-model="inputToken"
                      class="h-full py-0 pl-3 pr-8 border-0 bg-transparent text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 rounded-r-xl"
                      :disabled="loading"
                    >
                      <option value="ETH">ETH</option>
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Arrow Icon -->
              <div class="flex justify-center mb-6">
                <div class="bg-gray-100 rounded-full p-2">
                  <Icon name="heroicons:arrow-down" class="w-5 h-5 text-gray-600" />
                </div>
              </div>

              <!-- CIRX Output -->
              <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium text-gray-700">Receive</label>
                  <span v-if="cirxBalance" class="text-sm text-gray-500">
                    Balance: {{ cirxBalance }} CIRX
                  </span>
                </div>
                <div class="relative">
                  <input
                    v-model="cirxAmount"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    class="w-full pl-4 pr-20 py-4 text-xl font-medium border border-gray-300 rounded-xl bg-gray-50"
                    readonly
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span class="text-gray-700 font-medium">CIRX</span>
                  </div>
                </div>
              </div>

              <!-- Purchase Details -->
              <div v-if="quote" class="bg-gray-50 rounded-xl p-4 mb-6">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-600">Exchange Rate</span>
                  <span class="text-sm font-medium">1 {{ inputToken }} = ${{ quote.rate }}</span>
                </div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-600">Fee</span>
                  <span class="text-sm font-medium">{{ quote.fee }}%</span>
                </div>
                <div v-if="activeTab === 'otc' && quote.discount > 0" class="flex justify-between items-center mb-2">
                  <span class="text-sm text-gray-600">OTC Discount</span>
                  <span class="text-sm font-medium text-green-600">{{ quote.discount }}%</span>
                </div>
                <div v-if="activeTab === 'otc'" class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Vesting Period</span>
                  <span class="text-sm font-medium">6 months (linear)</span>
                </div>
              </div>

              <!-- OTC Discount Tiers (only show on OTC tab) -->
              <div v-if="activeTab === 'otc'" class="bg-purple-50 rounded-xl p-4 mb-6">
                <h4 class="text-sm font-medium text-purple-900 mb-3">OTC Discount Tiers</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-purple-700">$1,000 - $10,000</span>
                    <span class="font-medium text-purple-900">5% discount</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-purple-700">$10,000 - $50,000</span>
                    <span class="font-medium text-purple-900">8% discount</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-purple-700">$50,000+</span>
                    <span class="font-medium text-purple-900">12% discount</span>
                  </div>
                </div>
              </div>

              <!-- Purchase Button -->
              <button
                type="submit"
                :disabled="!canPurchase || loading"
                :class="[
                  'w-full py-4 px-6 rounded-xl font-medium text-white transition-colors',
                  activeTab === 'liquid' 
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300' 
                    : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300'
                ]"
              >
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {{ loadingText }}
                </span>
                <span v-else>
                  {{ purchaseButtonText }}
                </span>
              </button>
            </form>

            <!-- Error Message -->
            <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p class="text-red-700 text-sm">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Chart Panel (40%) -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">CIRX Price Chart</h3>
            
            <!-- Placeholder Chart -->
            <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <div class="text-center">
                <Icon name="heroicons:chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500 text-sm">Price chart coming soon</p>
              </div>
            </div>

            <!-- Recent Activity -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <div class="text-sm text-gray-600">Liquid Purchase</div>
                  <div class="text-sm font-medium">1,000 CIRX</div>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <div class="text-sm text-gray-600">OTC Purchase</div>
                  <div class="text-sm font-medium">5,000 CIRX</div>
                </div>
                <div class="flex justify-between items-center py-2">
                  <div class="text-sm text-gray-600">Vesting Claim</div>
                  <div class="text-sm font-medium">250 CIRX</div>
                </div>
              </div>
            </div>
          </div>
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

// Reactive state
const activeTab = ref('liquid')
const inputAmount = ref('')
const cirxAmount = ref('')
const inputToken = ref('ETH')
const loading = ref(false)
const loadingText = ref('')
const error = ref('')

// Mock balances - replace with actual Web3 integration
const inputBalance = ref('0.0')
const cirxBalance = ref('0.0')
const quote = ref(null)

// Token prices (mock data - should come from price oracle)
const tokenPrices = {
  ETH: 2500,   // $2500 per ETH
  USDC: 1,     // $1 per USDC  
  USDT: 1      // $1 per USDT
}

// Fee structure from PRP
const fees = {
  liquid: 0.3,  // 0.3% for liquid swaps
  otc: 0.15     // 0.15% for OTC swaps
}

// Discount tiers from PRP
const discountTiers = [
  { minAmount: 50000, discount: 12 },  // $50K+: 12%
  { minAmount: 10000, discount: 8 },   // $10K+: 8%  
  { minAmount: 1000, discount: 5 }     // $1K+: 5%
]

// Computed properties
const canPurchase = computed(() => {
  return inputAmount.value && 
         parseFloat(inputAmount.value) > 0 && 
         !loading.value
})

const purchaseButtonText = computed(() => {
  if (!inputAmount.value) return 'Enter an amount'
  if (parseFloat(inputAmount.value) <= 0) return 'Enter a valid amount'
  
  if (activeTab.value === 'liquid') {
    return `Buy CIRX (Immediate)`
  } else {
    return `Buy CIRX (6-month vesting)`
  }
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
const handleSwap = async () => {
  if (!canPurchase.value) return
  
  try {
    loading.value = true
    error.value = ''
    
    if (activeTab.value === 'liquid') {
      loadingText.value = 'Executing liquid purchase...'
      // TODO: Call SimpleOTCSwap.swapLiquid()
    } else {
      loadingText.value = 'Creating vesting position...'
      // TODO: Call SimpleOTCSwap.swapOTC()
    }
    
    // Mock transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form on success
    inputAmount.value = ''
    cirxAmount.value = ''
    quote.value = null
    
    // TODO: Show success notification
    // TODO: Update balances
    
  } catch (err) {
    error.value = err.message || 'Transaction failed. Please try again.'
  } finally {
    loading.value = false
    loadingText.value = ''
  }
}

// Watch for amount and tab changes to update quote
watch([inputAmount, inputToken, activeTab], () => {
  if (!inputAmount.value || parseFloat(inputAmount.value) <= 0) {
    cirxAmount.value = ''
    quote.value = null
    return
  }
  
  const isOTC = activeTab.value === 'otc'
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
      content: 'Buy CIRX tokens with liquid delivery or OTC discounts up to 12%. Powered by UniswapV4 with 6-month linear vesting for OTC purchases.' 
    }
  ]
})
</script>