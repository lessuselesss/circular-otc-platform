<template>
  <div>
    <div class="text-center py-16">
      <h1 class="text-4xl font-bold text-gray-900 mb-6">
        Welcome to UniswapV3 Clone
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        A decentralized exchange protocol built with modern web technologies and Ethereum smart contracts.
      </p>
      
      <div class="flex justify-center gap-4">
        <UButton to="/swap" size="lg" class="px-8">
          Start Trading
        </UButton>
        <UButton to="/pool" variant="outline" size="lg" class="px-8">
          Provide Liquidity
        </UButton>
      </div>
    </div>

    <!-- Feature Cards -->
    <div class="grid md:grid-cols-3 gap-8 py-16">
      <div class="text-center p-6 bg-white rounded-xl shadow-lg">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:arrow-path-rounded-square" class="w-8 h-8 text-blue-600" />
        </div>
        <h3 class="text-xl font-semibold mb-2">Instant Swaps</h3>
        <p class="text-gray-600">
          Swap tokens instantly with optimal pricing and minimal slippage.
        </p>
      </div>

      <div class="text-center p-6 bg-white rounded-xl shadow-lg">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:currency-dollar" class="w-8 h-8 text-green-600" />
        </div>
        <h3 class="text-xl font-semibold mb-2">Earn Fees</h3>
        <p class="text-gray-600">
          Provide liquidity to earn fees from every trade in the pool.
        </p>
      </div>

      <div class="text-center p-6 bg-white rounded-xl shadow-lg">
        <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:shield-check" class="w-8 h-8 text-purple-600" />
        </div>
        <h3 class="text-xl font-semibold mb-2">Secure & Decentralized</h3>
        <p class="text-gray-600">
          Built on Ethereum with battle-tested smart contract security.
        </p>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-gray-50 rounded-2xl p-8 text-center">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">Protocol Stats</h2>
      <div class="grid md:grid-cols-4 gap-8">
        <div>
          <div class="text-3xl font-bold text-blue-600 mb-2">$0</div>
          <div class="text-gray-600">Total Volume</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-green-600 mb-2">$0</div>
          <div class="text-gray-600">Total Liquidity</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-purple-600 mb-2">0</div>
          <div class="text-gray-600">Total Pools</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-orange-600 mb-2">0</div>
          <div class="text-gray-600">Total Users</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'UniswapV3 Clone - Decentralized Exchange',
  description: 'Trade tokens and provide liquidity on our decentralized exchange protocol.'
})

// Head configuration
useHead({
  title: 'UniswapV3 Clone - Home',
  meta: [
    { name: 'description', content: 'A modern decentralized exchange built with Nuxt.js and Ethereum smart contracts.' }
  ]
})
</script>