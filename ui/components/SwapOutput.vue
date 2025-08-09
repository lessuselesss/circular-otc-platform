<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-3">
      <label class="text-sm font-medium text-white">Receive</label>
    </div>
    
    <div class="relative">
      <input
        v-if="editable"
        :value="cirxAmount"
        @input="handleCirxInput($event.target.value)"
        @keypress="validateNumberInput"
        type="text"
        inputmode="decimal"
        pattern="[0-9]*\.?[0-9]*"
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
        <!-- Debug Info (dev mode only) -->
        <div v-if="$nuxt.isDevMode" class="text-xs text-gray-500 mr-2">
          Tab: {{ activeTab }}, Tiers: {{ discountTiers?.length || 0 }}
        </div>
        

        <!-- OTC Mode: Discount Tier Dropdown (if available) -->
        <OtcDiscountDropdown
          v-if="activeTab === 'otc' && discountTiers && discountTiers.length > 0"
          :discount-tiers="discountTiers"
          :selected-tier="selectedTier"
          :current-amount="quote?.usdValue || 0"
          @tier-changed="handleTierChange"
        />
        
        <!-- Standard CIRX Token Display (always visible when dropdown is not shown) -->
        <div 
          v-else
          class="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-700/50 hover:bg-gray-700/70 transition-colors cursor-pointer"
          role="button"
          tabindex="0"
          aria-label="CIRX token selector"
          @click="handleTokenClick"
          @keydown.enter="handleTokenClick"
          @keydown.space.prevent="handleTokenClick"
        >
          <img 
            src="/cirx-icon.svg" 
            alt="CIRX"
            class="w-5 h-5 rounded-full flex-shrink-0"
            @error="handleImageError"
            style="display: block;"
          />
          <span class="font-medium text-white text-sm">CIRX</span>
          
          <!-- Debug indicator to show when this element is visible -->
          <div 
            v-if="$nuxt.isDevMode"
            class="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"
            title="CIRX display is visible"
          ></div>
        </div>
        
        <!-- Fallback message if both conditions fail (dev mode) -->
        <div 
          v-if="$nuxt.isDevMode && activeTab === 'otc' && (!discountTiers || discountTiers.length === 0)"
          class="text-xs text-yellow-400 px-2 py-1 bg-yellow-900/20 rounded"
        >
          OTC tiers loading...
        </div>
      </div>
    </div>

    <!-- OTC Discount Tier Summary -->
    <div v-if="activeTab === 'otc' && selectedTier && quote && quote.cirxAmount && quote.cirxAmount !== '0'" class="mt-2">
      <span class="text-sm text-gray-400">
        {{ formatCirxAmount(quote.cirxAmount) }} CIRX @ -{{ selectedTier.discount }}%/{{ selectedTier.vestingMonths || 6 }}mo vest
      </span>
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
import OtcDiscountDropdown from './OtcDiscountDropdown.vue'

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
  },
  discountTiers: {
    type: Array,
    default: () => []
  },
  selectedTier: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:cirxAmount', 'cirx-changed', 'tier-changed', 'token-click'])

// Format USD value
const formatUsdValue = (amount) => {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) return '0.00'
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount)
}

// Format CIRX amount with appropriate precision
const formatCirxAmount = (amount) => {
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount)) return '0'
  
  // Use different precision based on amount size
  if (numAmount >= 1000) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(numAmount)
  } else if (numAmount >= 100) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1
    }).format(numAmount)
  } else {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(numAmount)
  }
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

// Handle CIRX amount input changes with proper number formatting
const handleCirxInput = (value) => {
  // Format the input to ensure valid number representation
  const formattedValue = formatNumberInput(value)
  emit('update:cirxAmount', formattedValue)
  emit('cirx-changed')
}

// Format number input to prevent invalid formats like "05", "00.5", etc.
const formatNumberInput = (value) => {
  if (!value || value === '') return ''
  
  // Remove any non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, '')
  
  // Handle multiple decimal points - keep only the first one
  const decimalCount = (cleaned.match(/\./g) || []).length
  if (decimalCount > 1) {
    const firstDecimalIndex = cleaned.indexOf('.')
    cleaned = cleaned.slice(0, firstDecimalIndex + 1) + cleaned.slice(firstDecimalIndex + 1).replace(/\./g, '')
  }
  
  // Handle leading zeros
  if (cleaned.length > 1 && cleaned[0] === '0' && cleaned[1] !== '.') {
    // Remove leading zeros unless it's "0." 
    cleaned = cleaned.replace(/^0+/, '')
    if (cleaned === '' || cleaned[0] === '.') {
      cleaned = '0' + cleaned
    }
  }
  
  // Ensure we don't start with a decimal point
  if (cleaned.startsWith('.')) {
    cleaned = '0' + cleaned
  }
  
  // Limit decimal places to 8 (reasonable for token amounts)
  const parts = cleaned.split('.')
  if (parts.length === 2 && parts[1].length > 8) {
    cleaned = parts[0] + '.' + parts[1].slice(0, 8)
  }
  
  return cleaned
}

// Input validation for keypress events
const validateNumberInput = (event) => {
  const char = String.fromCharCode(event.which)
  const currentValue = event.target.value
  const cursorPosition = event.target.selectionStart
  
  // Allow only numbers and decimal point
  if (!/[0-9.]/.test(char)) {
    event.preventDefault()
    return
  }
  
  // Prevent multiple decimal points
  if (char === '.' && currentValue.includes('.')) {
    event.preventDefault()
    return
  }
  
  // Prevent leading zeros followed by digits (but allow "0.")
  if (char !== '.' && currentValue === '0' && cursorPosition === 1) {
    event.preventDefault()
    return
  }
}

// Handle tier selection changes
const handleTierChange = (tier) => {
  emit('tier-changed', tier)
}

// Handle token click (for future token selection)
const handleTokenClick = () => {
  console.log('CIRX token clicked - token selector could be implemented here')
  emit('token-click', 'CIRX')
}
</script>

<style scoped>
/* Input styling for consistent appearance */
input[type="text"] {
  -webkit-appearance: none;
  -moz-appearance: textfield;
}
</style>