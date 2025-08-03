<template>
  <div class="min-h-screen bg-circular-bg-primary">
    <!-- Header -->
    <header class="bg-transparent backdrop-blur-sm border-b border-gray-800/30 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2 sm:gap-4">
            <img 
              src="/circular-logo.svg" 
              alt="Circular Protocol" 
              class="h-8 w-auto"
            />
            <span class="text-xs sm:text-sm hidden sm:block text-gray-400">Swap</span>
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

    <!-- Main Content: Trading Interface with Optional Chart -->
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <div :class="[
        'w-full mx-auto transition-all duration-500',
        (showChart || showStaking) ? 'max-w-none px-4' : 'max-w-lg'
      ]">
        <div :class="[
          'flex gap-6 items-start',
          (showChart || showStaking) ? 'flex-col lg:flex-row' : 'justify-center'
        ]">
          <!-- Chart Panel (expandable) - Takes majority of width and 80% viewport height -->
          <div v-if="showChart && !showStaking" class="w-full lg:w-2/3 xl:w-3/4 h-[80vh]">
            <CirxPriceChart @close="showChart = false" />
          </div>
          
          <!-- Staking Panel (expandable) - Takes majority of width and 80% viewport height -->
          <div v-if="showStaking && !showChart" class="w-full lg:w-2/3 xl:w-3/4 h-[80vh]">
            <CirxStakingPanel @close="showStaking = false" />
          </div>
          
          <!-- Trading Card - Flexible width -->
          <div :class="[
            'transition-all duration-500',
            (showChart || showStaking) ? 'w-full lg:w-1/3 xl:w-1/4 lg:min-w-[350px]' : 'w-full max-w-lg'
          ]">
        <!-- Centered Trading Card -->
        <div class="relative group">
          <!-- Animated gradient border -->
          <div class="absolute inset-0 rounded-2xl opacity-30 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-green-500 via-yellow-500 to-pink-500 bg-[length:400%_400%] animate-gradient-rotate p-[2px] group-hover:p-[6px]">
            <div class="w-full h-full rounded-2xl bg-circular-bg-primary"></div>
          </div>
          <!-- Main card content -->
          <div class="relative bg-circular-bg-primary/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 sm:p-8 group-hover:border-transparent transition-all duration-300">
          <!-- Tab Headers - Jupiter-style Pills -->
          <div class="flex mb-6 bg-gray-800/50 rounded-xl p-1 gap-1">
            <button
              @click="activeTab = 'liquid'"
              :class="[
                'flex-1 px-4 py-3 text-sm font-medium font-michroma transition-all duration-300 rounded-lg flex items-center justify-center gap-2',
                activeTab === 'liquid' 
                  ? 'text-circular-primary bg-circular-primary/20 border border-circular-primary/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              ]"
            >
              <span class="truncate">Buy Liquid</span>
              <span class="px-2 py-1 text-xs bg-circular-primary text-gray-900 rounded-full font-semibold whitespace-nowrap flex-shrink-0">
                Immediate
              </span>
            </button>
            <button
              @click="activeTab = 'otc'"
              :class="[
                'flex-1 px-4 py-3 text-sm font-medium font-michroma transition-all duration-300 rounded-lg flex items-center justify-center gap-2',
                activeTab === 'otc' 
                  ? 'text-circular-purple bg-circular-purple/20 border border-circular-purple/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              ]"
            >
              <span class="truncate">Buy OTC</span>
              <div class="flex flex-col items-center gap-0.5">
                <span class="px-2 py-0.5 text-xs bg-circular-purple text-white rounded-full font-semibold whitespace-nowrap">
                  5-12%
                </span>
                <span class="text-xs text-gray-400 font-normal">
                  discount
                </span>
              </div>
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
                  :class="[
                    'w-full pl-4 pr-32 py-4 text-xl font-semibold bg-transparent border rounded-xl text-white placeholder-gray-500 transition-all duration-300',
                    activeTab === 'liquid' 
                      ? 'border-gray-600/50 hover:border-circular-primary focus:border-circular-primary focus:ring-2 focus:ring-circular-primary/50 focus:outline-none' 
                      : 'border-gray-600/50 hover:border-circular-purple focus:border-circular-purple focus:ring-2 focus:ring-circular-purple/50 focus:outline-none'
                  ]"
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
                :class="[
                  'p-3 bg-transparent border rounded-xl transition-all duration-300',
                  activeTab === 'liquid' 
                    ? 'border-gray-600/50 text-circular-primary hover:bg-circular-primary/10 hover:border-circular-primary' 
                    : 'border-gray-600/50 text-circular-purple hover:bg-circular-purple/10 hover:border-circular-purple'
                ]"
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
                  :class="[
                    'w-full pl-4 pr-20 py-4 text-xl font-semibold bg-transparent border rounded-xl text-white placeholder-gray-500 opacity-75 transition-all duration-300',
                    activeTab === 'liquid' 
                      ? 'border-circular-primary/40' 
                      : 'border-circular-purple/40'
                  ]"
                  readonly
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span class="font-semibold text-circular-primary">CIRX</span>
                </div>
              </div>
            </div>

            <!-- Recipient Address (Optional) -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-3">
                <label class="text-sm font-medium text-white">Send to another address (optional)</label>
                <button
                  @click="useConnectedWallet"
                  v-if="recipientAddress && isConnected"
                  class="text-xs text-circular-primary hover:text-circular-primary-hover transition-colors"
                >
                  Use connected wallet
                </button>
              </div>
              <div class="relative">
                <input
                  v-model="recipientAddress"
                  type="text"
                  :placeholder="isConnected ? 'Leave empty to use connected wallet' : 'Enter wallet address to receive CIRX'"
                  :class="[
                    'w-full pl-4 pr-12 py-3 text-sm bg-transparent border rounded-xl text-white placeholder-gray-500 transition-all duration-300',
                    activeTab === 'liquid' 
                      ? 'border-gray-600/50 hover:border-circular-primary focus:border-circular-primary focus:ring-2 focus:ring-circular-primary/50 focus:outline-none' 
                      : 'border-gray-600/50 hover:border-circular-purple focus:border-circular-purple focus:ring-2 focus:ring-circular-purple/50 focus:outline-none'
                  ]"
                  :disabled="loading"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-4">
                  <button
                    v-if="recipientAddress"
                    @click="recipientAddress = ''"
                    class="text-gray-400 hover:text-white transition-colors"
                    title="Clear address"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div v-if="recipientAddressError" class="mt-2 text-sm text-red-400">
                {{ recipientAddressError }}
              </div>
              <div v-else-if="recipientAddress" class="mt-2 text-sm text-green-400">
                ✓ Valid {{ recipientAddressType }} address
              </div>
              <div v-else-if="isConnected" class="mt-2 text-sm text-gray-400">
                CIRX will be sent to your connected wallet: {{ shortAddress }}
              </div>
            </div>

            <!-- Purchase Details -->
            <div v-if="quote" class="bg-transparent border border-gray-600/50 rounded-xl p-4 mb-6 hover:border-gray-500 transition-all duration-300">
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
            <div v-if="activeTab === 'otc'" class="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 mb-4 hover:border-purple-500/40 transition-all duration-300">
              <h4 class="text-xs font-medium mb-2 text-purple-400">OTC Discount Tiers</h4>
              <div class="space-y-1 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-gray-400">$1K-10K</span>
                  <div class="text-right">
                    <span class="font-medium text-purple-400">5%</span>
                    <span class="text-gray-500 ml-1">X mo</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400">$10K-50K</span>
                  <div class="text-right">
                    <span class="font-medium text-purple-400">8%</span>
                    <span class="text-gray-500 ml-1">Y mo</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400">$50K+</span>
                  <div class="text-right">
                    <span class="font-medium text-purple-400">12%</span>
                    <span class="text-gray-500 ml-1">Z mo</span>
                  </div>
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
              <span v-else-if="!inputAmount">Enter an amount</span>
              <span v-else-if="!isConnected && !recipientAddress">Connect Wallet or Enter Address</span>
              <span v-else-if="recipientAddress && recipientAddressError">Invalid Address</span>
              <span v-else-if="activeTab === 'liquid'">Buy Liquid CIRX</span>
              <span v-else>Buy OTC CIRX (6mo vest)</span>
            </button>
          </form>
          
          <!-- Chart and Staking Expand Buttons -->
          <div v-if="!showChart && !showStaking" class="mt-4 flex justify-start gap-3">
            <button
              @click="showChart = true"
              class="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-600/50 hover:border-gray-500 transition-all text-sm font-medium hover:bg-gray-800/30 rounded-lg w-fit"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 3v18h18"/>
                <path d="M7 12l3-3 4 4 5-5"/>
                <circle cx="7" cy="12" r="1"/>
                <circle cx="10" cy="9" r="1"/>
                <circle cx="14" cy="13" r="1"/>
                <circle cx="19" cy="8" r="1"/>
              </svg>
              Expand Chart
            </button>
            <button
              @click="showStaking = true"
              class="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-600/50 hover:border-gray-500 transition-all text-sm font-medium hover:bg-gray-800/30 rounded-lg w-fit"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              Staking
            </button>
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
  title: 'Circular Swap',
  layout: 'default'
})

// Multi-Wallet connection
const { 
  isConnected, 
  account, 
  balance,
  connectedWallet,
  shortAddress,
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
const showChart = ref(false)
const showStaking = ref(false)
const recipientAddress = ref('')
const recipientAddressError = ref('')
const recipientAddressType = ref('')

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
  // Basic requirements
  const hasAmount = inputAmount.value && parseFloat(inputAmount.value) > 0
  const notLoading = !loading.value
  
  // Address validation
  const addressValid = validateRecipientAddress(recipientAddress.value)
  
  // Either connected wallet OR valid recipient address required
  const hasValidRecipient = isConnected.value || (recipientAddress.value && addressValid)
  
  return hasAmount && notLoading && hasValidRecipient
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

// Address validation functions
const validateEthereumAddress = (address) => {
  // Basic Ethereum address validation (0x + 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

const validateSolanaAddress = (address) => {
  // Basic Solana address validation (base58, 32-44 characters)
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

const validateRecipientAddress = (address) => {
  if (!address) {
    recipientAddressError.value = ''
    recipientAddressType.value = ''
    return true
  }

  // Check if it's a valid Ethereum address
  if (validateEthereumAddress(address)) {
    recipientAddressError.value = ''
    recipientAddressType.value = 'Ethereum'
    return true
  }

  // Check if it's a valid Solana address
  if (validateSolanaAddress(address)) {
    recipientAddressError.value = ''
    recipientAddressType.value = 'Solana'
    return true
  }

  // Invalid address
  recipientAddressError.value = 'Invalid wallet address format'
  recipientAddressType.value = ''
  return false
}

// Methods
const useConnectedWallet = () => {
  recipientAddress.value = ''
}

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

// Watch recipient address for validation
watch(recipientAddress, (newAddress) => {
  validateRecipientAddress(newAddress)
})

// Head configuration
useHead({
  title: 'Circular Swap - Buy CIRX Tokens',
  meta: [
    { 
      name: 'description', 
      content: 'Circular Swap - Buy CIRX tokens with liquid delivery or OTC discounts up to 12%. Modern swap interface with staking coming soon.' 
    }
  ]
})
</script>

<style scoped>
@keyframes gradient-rotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient-rotate {
  animation: gradient-rotate 12s ease infinite;
}
</style>