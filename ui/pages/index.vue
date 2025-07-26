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
          <nav class="flex items-center gap-6">
            <NuxtLink 
              to="/swap" 
              class="text-sm font-medium transition-colors"
              style="color: var(--circular-text-secondary);"
            >
              Trade
            </NuxtLink>
            <NuxtLink 
              to="/pool" 
              class="text-sm font-medium transition-colors"
              style="color: var(--circular-text-secondary);"
            >
              Pool
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <div class="text-center py-16">
        <div class="animate-fade-in max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold mb-6" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">
            CIRX OTC Trading
          </h1>
          <p class="text-lg md:text-xl mb-4" style="color: var(--circular-primary);">
            Buy CIRX tokens with instant delivery or OTC discounts up to 12%
          </p>
          <p class="text-base mb-10 max-w-2xl mx-auto" style="color: var(--circular-text-secondary);">
            Professional over-the-counter trading platform powered by UniswapV4 with 6-month linear vesting for discounted purchases.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <NuxtLink 
              to="/swap" 
              class="circular-btn px-6 py-3 text-base inline-block"
            >
              Start Trading
            </NuxtLink>
            <a 
              href="https://circularlabs.io" 
              target="_blank"
              class="circular-btn px-6 py-3 text-base inline-block"
              style="background: linear-gradient(135deg, var(--circular-purple), #8b35c7);"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      <!-- Feature Cards -->
      <div class="grid md:grid-cols-3 gap-6 py-12 max-w-4xl mx-auto">
        <div class="circular-trading-panel p-6 text-center">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background: var(--circular-primary-light);">
            <div class="text-xl font-bold" style="color: var(--circular-primary);">⚡</div>
          </div>
          <h3 class="text-lg font-semibold mb-3" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">Instant Delivery</h3>
          <p class="text-sm" style="color: var(--circular-text-secondary);">
            Buy CIRX tokens with immediate delivery at market rates.
          </p>
        </div>

        <div class="circular-trading-panel p-6 text-center">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background: var(--circular-purple-light);">
            <div class="text-xl font-bold" style="color: var(--circular-purple);">%</div>
          </div>
          <h3 class="text-lg font-semibold mb-3" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">OTC Discounts</h3>
          <p class="text-sm" style="color: var(--circular-text-secondary);">
            Get 5-12% discounts with 6-month linear vesting.
          </p>
        </div>

        <div class="circular-trading-panel p-6 text-center">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style="background: rgba(34, 197, 94, 0.1);">
            <div class="text-xl font-bold" style="color: var(--circular-success);">✓</div>
          </div>
          <h3 class="text-lg font-semibold mb-3" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">UniswapV4 Powered</h3>
          <p class="text-sm" style="color: var(--circular-text-secondary);">
            Built on UniswapV4 with 30% gas savings.
          </p>
        </div>
      </div>

      <!-- OTC Discount Tiers -->
      <div class="circular-discount-tiers p-6 mb-12 max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-center mb-6" style="color: var(--circular-purple); font-family: 'Michroma', sans-serif;">
          OTC Discount Tiers
        </h2>
        <div class="grid grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold mb-2" style="color: var(--circular-purple);">5%</div>
            <div class="text-sm font-medium mb-1" style="color: var(--circular-text-primary);">$1K - $10K</div>
            <div class="text-xs" style="color: var(--circular-text-secondary);">Entry level</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold mb-2" style="color: var(--circular-purple);">8%</div>
            <div class="text-sm font-medium mb-1" style="color: var(--circular-text-primary);">$10K - $50K</div>
            <div class="text-xs" style="color: var(--circular-text-secondary);">Preferred</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold mb-2" style="color: var(--circular-purple);">12%</div>
            <div class="text-sm font-medium mb-1" style="color: var(--circular-text-primary);">$50K+</div>
            <div class="text-xs" style="color: var(--circular-text-secondary);">Maximum</div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center pb-16">
        <div class="circular-trading-panel p-8 max-w-lg mx-auto">
          <h2 class="text-2xl font-bold mb-4" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">
            Ready to Trade?
          </h2>
          <p class="text-sm mb-6" style="color: var(--circular-text-secondary);">
            Connect your wallet to start trading CIRX tokens.
          </p>
          <NuxtLink 
            to="/swap" 
            class="circular-btn px-8 py-3 text-base inline-block"
          >
            Launch Platform
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Circular CIRX OTC Trading Platform',
  description: 'Buy CIRX tokens with instant delivery or OTC discounts up to 12%. Professional trading platform powered by UniswapV4.'
})

// Head configuration
useHead({
  title: 'Circular CIRX OTC Platform - Professional Token Trading',
  meta: [
    { 
      name: 'description', 
      content: 'Professional CIRX OTC trading platform with instant delivery and discounted vesting options. Built on UniswapV4 with 30% gas savings.' 
    },
    { 
      name: 'keywords', 
      content: 'CIRX, OTC trading, crypto, tokens, UniswapV4, vesting, discounts, DeFi' 
    }
  ]
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}
</style>