<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-3">
      <label class="text-sm font-medium text-white">Pay with</label>
      <span 
        v-if="balance && balance !== '0.0'" 
        class="text-sm cursor-pointer hover:text-white transition-colors text-gray-400" 
        @click="$emit('set-max')"
      >
        Balance: {{ balance }} {{ token }}
      </span>
    </div>
    
    <div class="relative token-input-container">
      <input
        :value="amount"
        @input="handleAmountInput($event.target.value)"
        type="text"
        inputmode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        placeholder="0.0"
        :class="[
          'w-full pl-4 pr-32 py-4 text-xl font-semibold bg-transparent border rounded-xl text-white placeholder-gray-500 transition-all duration-300',
          activeTab === 'liquid' 
            ? 'border-gray-600/50 hover:border-circular-primary focus:border-circular-primary focus:ring-2 focus:ring-circular-primary/50 focus:outline-none' 
            : 'border-gray-600/50 hover:border-circular-purple focus:border-circular-purple focus:ring-2 focus:ring-circular-purple/50 focus:outline-none'
        ]"
        :disabled="loading"
        @keypress="validateNumberInput"
      />
      
      <div class="absolute inset-y-0 right-0 flex items-center pr-4 token-selector-wrapper">
        <TokenSelector
          :selected-token="token"
          :active-tab="activeTab"
          :loading="loading"
          @select="$emit('update:token', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  amount: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  balance: {
    type: String,
    default: '0.0'
  },
  loading: {
    type: Boolean,
    default: false
  },
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:amount', 'update:token', 'set-max', 'input-changed'])

// Handle amount input changes with proper number formatting
const handleAmountInput = (value) => {
  // Format the input to ensure valid number representation
  const formattedValue = formatNumberInput(value)
  emit('update:amount', formattedValue)
  emit('input-changed')
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
</script>