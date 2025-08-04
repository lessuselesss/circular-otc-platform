<template>
  <div class="flex mb-6 bg-gray-800/50 rounded-xl p-1 gap-1">
    <button
      @click="$emit('update:modelValue', 'liquid')"
      :class="[
        'flex-1 px-3 sm:px-4 py-3 text-sm font-medium font-michroma transition-all duration-300 rounded-lg flex items-center justify-center gap-1 sm:gap-2',
        modelValue === 'liquid' 
          ? 'text-circular-primary bg-circular-primary/20 border border-circular-primary/30' 
          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
      ]"
    >
      <span class="truncate text-xs sm:text-sm">Buy Liquid</span>
      <span class="px-1.5 sm:px-2 py-1 text-xs bg-circular-primary text-gray-900 rounded-full font-semibold whitespace-nowrap flex-shrink-0">
        Immediate
      </span>
    </button>
    
    <button
      @click="$emit('update:modelValue', 'otc')"
      :class="[
        'flex-1 px-3 sm:px-4 py-3 text-sm font-medium font-michroma transition-all duration-300 rounded-lg flex items-center justify-center gap-1 sm:gap-2',
        modelValue === 'otc' 
          ? 'text-circular-purple bg-circular-purple/20 border border-circular-purple/30' 
          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
      ]"
    >
      <span class="truncate text-xs sm:text-sm">Buy OTC</span>
      <div class="flex flex-col items-center gap-0.5 min-w-0">
        <span class="px-1.5 sm:px-2 py-0.5 text-xs bg-circular-purple text-white rounded-full font-semibold whitespace-nowrap">
          {{ otcConfig?.displayRange || '5-12%' }}
        </span>
        <span class="text-xs text-gray-400 font-normal hidden sm:inline">
          discount
        </span>
        <span class="text-xs text-gray-400 font-normal sm:hidden">
          off
        </span>
      </div>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  otcConfig: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['update:modelValue'])
</script>