<template>
  <div class="bg-gradient-to-br from-circular-bg-secondary to-circular-bg-secondary/95 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
    <!-- Staking Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-circular-primary/20 rounded-lg flex items-center justify-center">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="text-circular-primary">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">CIRX Staking</h3>
          <p class="text-sm text-gray-400">Stake and earn rewards</p>
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-white transition-colors p-2"
        title="Close staking panel"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>

    <!-- Coming Soon Content -->
    <div class="flex flex-col items-center justify-center text-center py-16">
      <!-- Large Coming Soon Icon -->
      <div class="w-24 h-24 bg-circular-primary/10 rounded-full flex items-center justify-center mb-6">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" class="text-circular-primary">
          <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
      </div>
      
      <!-- Coming Soon Text -->
      <h2 class="text-2xl font-bold text-white mb-3">Staking Coming Soon</h2>
      <p class="text-gray-400 text-lg mb-8 max-w-md">
        Stake your CIRX tokens to earn rewards and participate in governance. 
        Advanced staking features are currently in development.
      </p>
      
      <!-- Feature Preview Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        <div class="bg-gray-800/50 rounded-lg p-4 text-left">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="text-green-400">
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div class="text-sm font-medium text-white">Flexible Rewards</div>
          </div>
          <div class="text-sm text-gray-400">Earn up to 15% APY on staked CIRX</div>
        </div>
        
        <div class="bg-gray-800/50 rounded-lg p-4 text-left">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="text-blue-400">
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div class="text-sm font-medium text-white">Governance Rights</div>
          </div>
          <div class="text-sm text-gray-400">Vote on protocol decisions</div>
        </div>
        
        <div class="bg-gray-800/50 rounded-lg p-4 text-left">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="text-purple-400">
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div class="text-sm font-medium text-white">Liquid Staking</div>
          </div>
          <div class="text-sm text-gray-400">Maintain liquidity while staking</div>
        </div>
        
        <div class="bg-gray-800/50 rounded-lg p-4 text-left">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" class="text-orange-400">
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div class="text-sm font-medium text-white">Auto-Compounding</div>
          </div>
          <div class="text-sm text-gray-400">Maximize returns automatically</div>
        </div>
      </div>

      <!-- Stats Preview (placeholder) -->
      <div class="grid grid-cols-3 gap-6 w-full max-w-md mb-8">
        <div class="text-center">
          <div class="text-2xl font-bold text-circular-primary mb-1">--</div>
          <div class="text-sm text-gray-400">Total Staked</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-circular-primary mb-1">--%</div>
          <div class="text-sm text-gray-400">Current APY</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-circular-primary mb-1">--</div>
          <div class="text-sm text-gray-400">Your Rewards</div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <a
        href="https://circularlabs.io"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-center text-sm font-medium transition-colors"
      >
        Learn More
      </a>
      <button
        disabled
        class="flex-1 px-4 py-3 bg-circular-primary/20 text-circular-primary rounded-lg text-center text-sm font-medium cursor-not-allowed"
        title="Staking feature coming soon"
      >
        Get Notified
      </button>
    </div>
  </div>
</template>

<script setup>
// Props and emits
defineEmits(['close'])
</script>