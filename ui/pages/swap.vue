<template>
  <div class="min-h-screen" style="background: var(--circular-bg-primary);">
    <!-- Header -->
    <header class="circular-header">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2 sm:gap-4">
            <h1 class="circular-logo text-lg sm:text-xl">Circular CIRX</h1>
            <span class="text-xs sm:text-sm hidden sm:block" style="color: var(--circular-text-secondary);">OTC Trading Platform</span>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <!-- Connected Wallet Display -->
            <div v-if="isConnected && account" class="flex items-center gap-1 sm:gap-3">
              <div class="text-xs sm:text-sm hidden sm:block" style="color: var(--circular-text-secondary);">
                {{ balance?.toFixed(4) || '0.0000' }} ETH
              </div>
              <div class="circular-wallet-connected flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2">
                <div class="w-4 h-4 sm:w-6 sm:h-6 rounded-full" style="background: linear-gradient(135deg, var(--circular-primary), var(--circular-purple));"></div>
                <span class="font-mono text-xs sm:text-sm" style="color: var(--circular-text-primary);">{{ formatAddress(account) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content: Properly Centered Trading Card -->
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <div class="w-full max-w-lg mx-auto">
        <!-- Centered Trading Card -->
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm" style="background: linear-gradient(135deg, rgb(49, 49, 49), rgba(49, 49, 49, 0.95));">
          <!-- Tab Headers -->
          <div class="flex mb-6 border-b border-gray-600">
            <button
              @click="activeTab = 'liquid'"
              :class="[
                'px-6 py-3 text-sm font-medium transition-all duration-300 border-b-2',
                activeTab === 'liquid' 
                  ? 'text-emerald-400 border-emerald-400 bg-emerald-400/10' 
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              ]"
            >
              Buy Liquid
              <span class="ml-2 px-2 py-1 text-xs bg-emerald-500 text-gray-900 rounded-full font-semibold">
                Immediate
              </span>
            </button>
            <button
              @click="activeTab = 'otc'"
              :class="[
                'px-6 py-3 text-sm font-medium transition-all duration-300 border-b-2 ml-4',
                activeTab === 'otc' 
                  ? 'text-purple-400 border-purple-400 bg-purple-400/10' 
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              ]"
            >
              Buy OTC
              <span class="ml-2 px-2 py-1 text-xs bg-purple-500 text-white rounded-full font-semibold">
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
                  Balance: {{ inputBalance }}
                </span>
              </div>
              <div class="relative">
                <input
                  v-model="inputAmount"
                  type="number"
                  step="any"
                  placeholder="0.0"
                  class="w-full pl-4 pr-32 py-4 text-xl font-semibold bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                  :disabled="loading"
                />
                <div class="absolute inset-y-0 right-0 flex items-center">
                  <select
                    v-model="inputToken"
                    class="h-full py-0 pl-3 pr-8 border-0 bg-transparent font-medium text-white rounded-r-xl focus:outline-none"
                    :disabled="loading"
                  >
                    <option value="ETH" class="bg-gray-900">ETH</option>
                    <option value="USDC" class="bg-gray-900">USDC</option>
                    <option value="USDT" class="bg-gray-900">USDT</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Swap Arrow -->
            <div class="flex justify-center mb-6">
              <button
                type="button"
                class="p-3 bg-gray-700 border border-gray-600 rounded-xl text-emerald-400 hover:bg-gray-600 hover:border-emerald-400 transition-all duration-300"
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
                <span v-if="cirxBalance" class="text-sm text-gray-400">
                  Balance: {{ cirxBalance }} CIRX
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
                  <span class="font-semibold text-emerald-400">CIRX</span>
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
                <span class="text-sm font-medium text-emerald-400">{{ quote.discount }}%</span>
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

            <!-- Smart Action Button -->
            <SwapActionButton
              :input-amount="inputAmount"
              :active-tab="activeTab"
              :loading="loading"
              :loading-text="loadingText"
              :can-purchase="canPurchase"
              @execute-swap="handleSwap"
              ref="swapActionButton"
            />
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

// Wallet integration
const { isConnected, account, balance, formatAddress } = useWallet()
const { 
  getTokenBalance, 
  getCIRXBalance, 
  getLiquidQuote, 
  getOTCQuote,
  executeLiquidSwap,
  executeOTCSwap 
} = useContracts()

// Component refs
const swapActionButton = ref(null)

// Reactive state
const activeTab = ref('liquid')
const inputAmount = ref('')
const cirxAmount = ref('')
const inputToken = ref('ETH')
const loading = ref(false)
const loadingText = ref('')
const error = ref('')

// Real balances from wallet/contracts
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

// Computed properties for swap logic

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

// Update balances when wallet connects
const updateBalances = async () => {
  if (!account.value) {
    inputBalance.value = '0.0'
    cirxBalance.value = '0.0'
    return
  }

  try {
    // Update input token balance
    if (inputToken.value === 'ETH') {
      inputBalance.value = balance.value?.toFixed(4) || '0.0'
    } else {
      inputBalance.value = await getTokenBalance(inputToken.value)
    }

    // Update CIRX balance
    cirxBalance.value = await getCIRXBalance()
  } catch (err) {
    console.error('Failed to update balances:', err)
  }
}

// Get effective user address (connected wallet or manual input)
const getEffectiveAddress = () => {
  if (isConnected.value && account.value) {
    return account.value
  }
  return swapActionButton.value?.manualAddress || null
}

// New methods for enhanced functionality
const setMaxAmount = () => {
  if (inputBalance.value && inputBalance.value !== '0.0') {
    inputAmount.value = parseFloat(inputBalance.value).toString()
  }
}

const reverseSwap = () => {
  // For now, this doesn't do anything since we only swap to CIRX
  // Could be used for future bidirectional swaps
  console.log('Reverse swap not supported yet')
}

// Methods
const handleSwap = async () => {
  if (!canPurchase.value) return
  
  try {
    loading.value = true
    error.value = ''
    
    const effectiveAddress = getEffectiveAddress()
    if (!effectiveAddress && !isConnected.value) {
      error.value = 'Please connect wallet or enter a wallet address'
      return
    }

    if (!isConnected.value) {
      error.value = 'Wallet connection required for transactions'
      return
    }

    const minCirxOut = (parseFloat(cirxAmount.value) * 0.99).toFixed(18) // 1% slippage tolerance
    
    if (activeTab.value === 'liquid') {
      loadingText.value = 'Executing liquid purchase...'
      await executeLiquidSwap(inputToken.value, inputAmount.value, minCirxOut)
    } else {
      loadingText.value = 'Creating vesting position...'
      await executeOTCSwap(inputToken.value, inputAmount.value, minCirxOut)
    }
    
    // Reset form on success
    inputAmount.value = ''
    cirxAmount.value = ''
    quote.value = null
    
    // Update balances
    await updateBalances()
    
    // TODO: Show success notification
    
  } catch (err) {
    console.error('Transaction failed:', err)
    error.value = err.message || 'Transaction failed. Please try again.'
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
  
  try {
    const isOTC = activeTab.value === 'otc'
    
    // Try to get real quote from contracts first, fallback to mock
    let newQuote
    try {
      if (isOTC) {
        const contractQuote = await getOTCQuote(inputToken.value, inputAmount.value)
        newQuote = {
          rate: tokenPrices[inputToken.value]?.toFixed(2) || '0',
          fee: contractQuote.fee,
          discount: parseFloat(contractQuote.discount),
          cirxAmount: contractQuote.cirxAmount,
          usdValue: (parseFloat(inputAmount.value) * tokenPrices[inputToken.value]).toFixed(2)
        }
      } else {
        const contractQuote = await getLiquidQuote(inputToken.value, inputAmount.value)
        newQuote = {
          rate: tokenPrices[inputToken.value]?.toFixed(2) || '0',
          fee: contractQuote.fee,
          discount: 0,
          cirxAmount: contractQuote.cirxAmount,
          usdValue: (parseFloat(inputAmount.value) * tokenPrices[inputToken.value]).toFixed(2)
        }
      }
    } catch (err) {
      // Fallback to mock calculation
      console.log('Using mock quote calculation')
      newQuote = calculateQuote(inputAmount.value, inputToken.value, isOTC)
    }
    
    if (newQuote) {
      quote.value = newQuote
      cirxAmount.value = newQuote.cirxAmount
    }
  } catch (err) {
    console.error('Failed to get quote:', err)
  }
}, { immediate: true })

// Watch for wallet connection changes to update balances
watch([isConnected, account, inputToken], async () => {
  await updateBalances()
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