<template>
  <div class="min-h-screen bg-circular-bg-primary">
    <!-- Header -->
    <SwapHeader />

    <!-- Main Content -->
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8">
      <div :class="[
        'w-full mx-auto transition-all duration-500',
        (showChart || showStaking) ? 'max-w-none px-4' : 'max-w-lg'
      ]">
        <div :class="[
          'flex gap-6 items-start',
          (showChart || showStaking) ? 'flex-col lg:flex-row' : 'justify-center'
        ]">
          
          <!-- Chart Panel -->
          <div v-if="showChart && !showStaking" class="w-full lg:w-2/3 xl:w-3/4 h-[80vh]">
            <CirxPriceChart @close="showChart = false" />
          </div>
          
          <!-- Staking Panel -->
          <div v-if="showStaking && !showChart" class="w-full lg:w-2/3 xl:w-3/4 h-[80vh]">
            <CirxStakingPanel @close="showStaking = false" />
          </div>
          
          <!-- Swap Form -->
          <div :class="[
            'transition-all duration-500',
            (showChart || showStaking) ? 'w-full lg:w-1/3 xl:w-1/4 lg:min-w-[350px]' : 'w-full max-w-lg'
          ]">
            <SwapForm 
              @show-chart="showChart = true"
              @show-staking="showStaking = true"
            />
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

// Import wallet store
const walletStore = useWalletStore()

// Local state for panels
const showChart = ref(false)
const showStaking = ref(false)

// Initialize wallet store on mount
onMounted(async () => {
  if (!walletStore.isInitialized) {
    await walletStore.initialize()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  walletStore.cleanup()
})
</script>

<style scoped>
/* Component-specific styles can go here */
</style>