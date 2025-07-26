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

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Hero Section -->
      <div class="text-center py-20">
        <div class="animate-fade-in">
          <h1 class="text-5xl md:text-6xl font-bold mb-6" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">
            CIRX OTC Trading
          </h1>
          <p class="text-xl md:text-2xl mb-4" style="color: var(--circular-primary);">
            Buy CIRX tokens with instant delivery or OTC discounts up to 12%
          </p>
          <p class="text-lg mb-12 max-w-3xl mx-auto" style="color: var(--circular-text-secondary);">
            Professional over-the-counter trading platform powered by UniswapV4 with 6-month linear vesting for discounted purchases and competitive pricing.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink 
              to="/swap" 
              class="circular-btn px-8 py-4 text-lg inline-block"
            >
              Start Trading
            </NuxtLink>
            <a 
              href="https://circularlabs.io" 
              target="_blank"
              class="circular-btn px-8 py-4 text-lg inline-block"
              style="background: linear-gradient(135deg, var(--circular-purple), #8b35c7);"
            >
              Learn About Circular
            </a>
          </div>
        </div>
      </div>

      <!-- Feature Cards -->
      <div class="grid md:grid-cols-3 gap-8 py-16">
        <div class="circular-trading-panel p-8 text-center">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style="background: var(--circular-primary-light);">
            <Icon name="heroicons:bolt" class="w-8 h-8" style="color: var(--circular-primary);" />
          </div>
          <h3 class="text-xl font-semibold mb-4" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">Instant Delivery</h3>
          <p style="color: var(--circular-text-secondary);">
            Buy CIRX tokens with immediate delivery at market rates through our liquid trading interface.
          </p>
        </div>

        <div class="circular-trading-panel p-8 text-center">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style="background: var(--circular-purple-light);">
            <Icon name="heroicons:percent-badge" class="w-8 h-8" style="color: var(--circular-purple);" />
          </div>
          <h3 class="text-xl font-semibold mb-4" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">OTC Discounts</h3>
          <p style="color: var(--circular-text-secondary);">
            Get 5-12% discounts on CIRX purchases with 6-month linear vesting. Larger purchases get better rates.
          </p>
        </div>

        <div class="circular-trading-panel p-8 text-center">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style="background: rgba(34, 197, 94, 0.1);">
            <Icon name="heroicons:shield-check" class="w-8 h-8" style="color: var(--circular-success);" />
          </div>
          <h3 class="text-xl font-semibold mb-4" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">UniswapV4 Powered</h3>
          <p style="color: var(--circular-text-secondary);">
            Built on UniswapV4 infrastructure with 30% gas savings and battle-tested security.
          </p>
        </div>
      </div>

      <!-- OTC Discount Tiers -->
      <div class="circular-discount-tiers p-8 mb-16">
        <h2 class="text-3xl font-bold text-center mb-8" style="color: var(--circular-purple); font-family: 'Michroma', sans-serif;">
          OTC Discount Tiers
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-4xl font-bold mb-2" style="color: var(--circular-purple);">5%</div>
            <div class="text-lg font-medium mb-2" style="color: var(--circular-text-primary);">$1,000 - $10,000</div>
            <div class="text-sm" style="color: var(--circular-text-secondary);">Entry level discount</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold mb-2" style="color: var(--circular-purple);">8%</div>
            <div class="text-lg font-medium mb-2" style="color: var(--circular-text-primary);">$10,000 - $50,000</div>
            <div class="text-sm" style="color: var(--circular-text-secondary);">Preferred rate</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold mb-2" style="color: var(--circular-purple);">12%</div>
            <div class="text-lg font-medium mb-2" style="color: var(--circular-text-primary);">$50,000+</div>
            <div class="text-sm" style="color: var(--circular-text-secondary);">Maximum discount</div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center pb-20">
        <div class="circular-trading-panel p-12 max-w-4xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold mb-6" style="color: var(--circular-text-primary); font-family: 'Michroma', sans-serif;">
            Ready to Trade CIRX?
          </h2>
          <p class="text-lg mb-8" style="color: var(--circular-text-secondary);">
            Connect your wallet or paste your address to start trading with instant delivery or discounted OTC purchases.
          </p>
          <NuxtLink 
            to="/swap" 
            class="circular-btn px-12 py-4 text-lg inline-block"
          >
            Launch Trading Platform
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