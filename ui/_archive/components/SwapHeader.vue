<template>
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
          <NuxtLink 
            to="/history" 
            class="px-3 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            History
          </NuxtLink>
          
          <WalletConnectButton />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
// No additional logic needed - this is a pure presentation component
</script>