<template>
  <div v-if="quote" class="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
    <h3 class="text-sm font-medium text-white mb-3">Transaction Details</h3>
    
    <div class="space-y-2 text-sm">
      <!-- Exchange Rate -->
      <div class="flex justify-between">
        <span class="text-gray-400">Exchange Rate</span>
        <span class="text-white">1 {{ inputToken }} = {{ formatRate() }} CIRX</span>
      </div>
      
      <!-- Inverse Rate -->
      <div class="flex justify-between">
        <span class="text-gray-400">CIRX Price</span>
        <span class="text-white">1 CIRX = {{ formatInverseRate() }} {{ inputToken }}</span>
      </div>
      
      <!-- Fee -->
      <div class="flex justify-between">
        <span class="text-gray-400">Platform Fee ({{ quote.feeRate || '0.3' }}%)</span>
        <span class="text-white">{{ formatFee() }} {{ inputToken }}</span>
      </div>
      
      <!-- OTC Discount -->
      <div v-if="activeTab === 'otc' && quote.discount > 0" class="flex justify-between">
        <span class="text-green-400">OTC Bonus ({{ quote.discount }}%)</span>
        <span class="text-green-400">+{{ formatBonus() }} CIRX</span>
      </div>
      
      <!-- Minimum Received -->
      <div class="flex justify-between">
        <span class="text-gray-400">Minimum Received</span>
        <span class="text-white">{{ quote.minimumReceived || quote.cirxAmount }} CIRX</span>
      </div>
      
      <!-- Slippage -->
      <div class="flex justify-between">
        <span class="text-gray-400">Max Slippage</span>
        <span class="text-white">0.5%</span>
      </div>
      
      <!-- Vesting Info for OTC -->
      <div v-if="activeTab === 'otc'" class="pt-2 border-t border-gray-700/50">
        <div class="flex justify-between">
          <span class="text-yellow-400">Vesting Period</span>
          <span class="text-yellow-400">6 months (linear)</span>
        </div>
        <div class="text-xs text-gray-500 mt-1">
          Tokens will vest linearly over 6 months and can be claimed at any time
        </div>
      </div>
    </div>
    
    <!-- Price Impact Warning -->
    <div v-if="quote.priceImpact > 2" class="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
        <span class="text-sm text-yellow-400">High price impact ({{ quote.priceImpact }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  quote: {
    type: Object,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  },
  inputToken: {
    type: String,
    required: true
  },
  inputAmount: {
    type: String,
    required: true
  }
})

// Format exchange rate
const formatRate = () => {
  if (!props.quote.tokenPrice) return '1'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(props.quote.tokenPrice)
}

// Format inverse rate (1 CIRX = X token)
const formatInverseRate = () => {
  if (!props.quote.tokenPrice || props.quote.tokenPrice === 0) return '0'
  const inverseRate = 1 / props.quote.tokenPrice
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6
  }).format(inverseRate)
}

// Format fee amount
const formatFee = () => {
  if (!props.quote.feeAmount) return '0'
  return parseFloat(props.quote.feeAmount).toFixed(6).replace(/\.?0+$/, '')
}

// Format bonus amount for OTC
const formatBonus = () => {
  if (!props.quote.discount || props.quote.discount === 0) return '0'
  
  const baseAmount = parseFloat(props.inputAmount) * props.quote.tokenPrice
  const bonusAmount = baseAmount * (props.quote.discount / 100)
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(bonusAmount)
}
</script>