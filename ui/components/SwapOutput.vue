<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-3">
      <label class="text-sm font-medium text-white">Receive</label>
    </div>
    
    <div class="relative">
      <input
        v-if="editable"
        :value="cirxAmount"
        @input="$emit('update:cirxAmount', $event.target.value)"
        type="number"
        step="any"
        placeholder="0.0"
        :class="[
          'w-full pl-4 pr-20 py-4 text-xl font-semibold bg-transparent border rounded-xl text-white placeholder-gray-500 transition-all duration-300',
          'border-gray-600/50 focus:border-circular-primary/50 focus:outline-none',
          loading && 'opacity-50'
        ]"
      />
      <div 
        v-else
        :class="[
          'w-full pl-4 pr-20 py-4 text-xl font-semibold bg-transparent border rounded-xl text-white transition-all duration-300',
          'border-gray-600/50'
        ]"
      >
        <span :class="[
          'transition-all duration-300',
          loading ? 'opacity-50' : 'opacity-100'
        ]">
          {{ loading ? 'Calculating...' : (cirxAmount || '0.0') }}
        </span>
      </div>
      
      <div class="absolute inset-y-0 right-0 flex items-center pr-4">
        <div class="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-700/50">
          <img 
            src="/cirx-icon.svg" 
            alt="CIRX"
            class="w-5 h-5 rounded-full"
            @error="handleImageError"
          />
          <span class="font-medium text-white text-sm">CIRX</span>
        </div>
      </div>
    </div>

    <!-- Estimated USD Value -->
    <div v-if="quote && quote.cirxAmount && quote.cirxAmount !== '0'" class="mt-2 text-right">
      <span class="text-sm text-gray-400">
        ≈ ${{ formatUsdValue(quote.cirxAmount) }}
      </span>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="mt-2 flex items-center justify-center">
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Getting best quote...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cirxAmount: {
    type: String,
    default: '0.0'
  },
  quote: {
    type: Object,
    default: null
  },
  activeTab: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:cirxAmount'])

// Format USD value
const formatUsdValue = (amount) => {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) return '0.00'
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount)
}

const handleImageError = (event) => {
  // Fallback to a simple SVG circle
  event.target.style.display = 'none'
  // Add a simple colored circle as fallback
  const fallback = document.createElement('div')
  fallback.className = 'w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold'
  fallback.textContent = 'C'
  event.target.parentNode.replaceChild(fallback, event.target)
}
</script>