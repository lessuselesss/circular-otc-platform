<template>
  <div class="min-h-screen" style="background: var(--circular-bg-primary);">
    <!-- Header -->
    <header class="circular-header">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-4">
            <h1 class="circular-logo">Circular CIRX</h1>
            <span class="text-sm" style="color: var(--circular-text-secondary);">OTC Trading Platform</span>
          </div>
          <div class="flex items-center gap-4">
            <!-- Wallet Connection Component -->
            <WalletConnect ref="walletConnect" />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content: Trading Panel (60%) + Chart Panel (40%) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        <!-- Trading Panel (60%) -->
        <div class="lg:col-span-3">
          <div class="circular-trading-panel p-6">
            <!-- Tab Headers -->
            <div class="flex mb-6" style="border-bottom: 1px solid var(--circular-border);">
              <button
                @click="activeTab = 'liquid'"
                :class="[
                  'circular-tab',
                  activeTab === 'liquid' ? 'active' : ''
                ]"
              >
                Buy Liquid
                <span class="ml-2 circular-badge">
                  Immediate
                </span>
              </button>
              <button
                @click="activeTab = 'otc'"
                :class="[
                  'circular-tab ml-8',
                  activeTab === 'otc' ? 'otc-active' : ''
                ]"
              >
                Buy OTC
                <span class="ml-2 circular-badge circular-badge-otc">
                  5-12% Discount
                </span>
              </button>
            </div>

            <!-- Tab Content -->
            <form @submit.prevent="handleSwap">
              <!-- Input Token Selection -->
              <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium" style="color: var(--circular-text-primary);">Pay with</label>
                  <span v-if="inputBalance" class="text-sm" style="color: var(--circular-text-secondary);">
                    Balance: {{ inputBalance }}
                  </span>
                </div>
                <div class="relative">
                  <input
                    v-model="inputAmount"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    class="circular-input w-full pl-4 pr-32 py-4"
                    :disabled="loading"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center">
                    <select
                      v-model="inputToken"
                      class="circular-token-select h-full py-0 pl-3 pr-8 border-0 bg-transparent font-medium rounded-r-xl"
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
                <div class="rounded-full p-2" style="background: var(--circular-bg-secondary);">
                  <Icon name="heroicons:arrow-down" class="w-5 h-5" style="color: var(--circular-primary);" />
                </div>
              </div>

              <!-- CIRX Output -->
              <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium" style="color: var(--circular-text-primary);">Receive</label>
                  <span v-if="cirxBalance" class="text-sm" style="color: var(--circular-text-secondary);">
                    Balance: {{ cirxBalance }} CIRX
                  </span>
                </div>
                <div class="relative">
                  <input
                    v-model="cirxAmount"
                    type="number"
                    step="any"
                    placeholder="0.0"
                    class="circular-input w-full pl-4 pr-20 py-4 opacity-75"
                    readonly
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span class="font-medium" style="color: var(--circular-primary);">CIRX</span>
                  </div>
                </div>
              </div>

              <!-- Purchase Details -->
              <div v-if="quote" class="circular-quote-panel p-4 mb-6">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm" style="color: var(--circular-text-secondary);">Exchange Rate</span>
                  <span class="text-sm font-medium" style="color: var(--circular-text-primary);">1 {{ inputToken }} = ${{ quote.rate }}</span>
                </div>
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm" style="color: var(--circular-text-secondary);">Fee</span>
                  <span class="text-sm font-medium" style="color: var(--circular-text-primary);">{{ quote.fee }}%</span>
                </div>
                <div v-if="activeTab === 'otc' && quote.discount > 0" class="flex justify-between items-center mb-2">
                  <span class="text-sm" style="color: var(--circular-text-secondary);">OTC Discount</span>
                  <span class="text-sm font-medium" style="color: var(--circular-primary);">{{ quote.discount }}%</span>
                </div>
                <div v-if="activeTab === 'otc'" class="flex justify-between items-center">
                  <span class="text-sm" style="color: var(--circular-text-secondary);">Vesting Period</span>
                  <span class="text-sm font-medium" style="color: var(--circular-text-primary);">6 months (linear)</span>
                </div>
              </div>

              <!-- OTC Discount Tiers (only show on OTC tab) -->
              <div v-if="activeTab === 'otc'" class="circular-discount-tiers p-4 mb-6">
                <h4 class="text-sm font-medium mb-3" style="color: var(--circular-purple);">OTC Discount Tiers</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span style="color: var(--circular-text-secondary);">$1,000 - $10,000</span>
                    <span class="font-medium" style="color: var(--circular-purple);">5% discount</span>
                  </div>
                  <div class="flex justify-between">
                    <span style="color: var(--circular-text-secondary);">$10,000 - $50,000</span>
                    <span class="font-medium" style="color: var(--circular-purple);">8% discount</span>
                  </div>
                  <div class="flex justify-between">
                    <span style="color: var(--circular-text-secondary);">$50,000+</span>
                    <span class="font-medium" style="color: var(--circular-purple);">12% discount</span>
                  </div>
                </div>
              </div>

              <!-- Purchase Button -->
              <button
                type="submit"
                :disabled="!canPurchase || loading"
                :class="[
                  'circular-btn w-full py-4 px-6',
                  activeTab === 'otc' ? 'circular-btn-otc' : ''
                ]"
              >
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <div class="circular-loading"></div>
                  {{ loadingText }}
                </span>
                <span v-else>
                  {{ purchaseButtonText }}
                </span>
              </button>
            </form>

            <!-- Error Message -->
            <div v-if="error" class="circular-error mt-4 p-3">
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Chart Panel (40%) -->
        <div class="lg:col-span-2">
          <div class="circular-chart-panel p-6">
            <h3 class="text-lg font-semibold mb-4" style="color: var(--circular-text-primary);">CIRX Price Chart</h3>
            
            <!-- Placeholder Chart -->
            <div class="aspect-square rounded-lg flex items-center justify-center mb-6" style="background: var(--circular-bg-primary);">
              <div class="text-center">
                <Icon name="heroicons:chart-bar" class="w-12 h-12 mx-auto mb-2" style="color: var(--circular-gray);" />
                <p class="text-sm" style="color: var(--circular-text-secondary);">Price chart coming soon</p>
              </div>
            </div>

            <!-- Recent Activity -->
            <div>
              <h4 class="text-sm font-medium mb-3" style="color: var(--circular-text-primary);">Recent Activity</h4>
              <div class="space-y-2">
                <div class="circular-activity-item flex justify-between items-center py-2">
                  <div class="text-sm" style="color: var(--circular-text-secondary);">Liquid Purchase</div>
                  <div class="text-sm font-medium" style="color: var(--circular-primary);">1,000 CIRX</div>
                </div>
                <div class="circular-activity-item flex justify-between items-center py-2">
                  <div class="text-sm" style="color: var(--circular-text-secondary);">OTC Purchase</div>
                  <div class="text-sm font-medium" style="color: var(--circular-purple);">5,000 CIRX</div>
                </div>
                <div class="flex justify-between items-center py-2">
                  <div class="text-sm" style="color: var(--circular-text-secondary);">Vesting Claim</div>
                  <div class="text-sm font-medium" style="color: var(--circular-text-primary);">250 CIRX</div>
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

// Wallet integration
const { isConnected, account, balance } = useWallet()
const { 
  getTokenBalance, 
  getCIRXBalance, 
  getLiquidQuote, 
  getOTCQuote,
  executeLiquidSwap,
  executeOTCSwap 
} = useContracts()

// Component refs
const walletConnect = ref(null)

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
  return walletConnect.value?.manualAddress || null
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