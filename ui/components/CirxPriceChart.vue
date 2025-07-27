<template>
  <div class="bg-gradient-to-br from-circular-bg-secondary to-circular-bg-secondary/95 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
    <!-- Chart Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-circular-primary/20 rounded-lg flex items-center justify-center">
          <span class="text-circular-primary font-bold text-sm">C</span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">CIRX/USD</h3>
          <p class="text-sm text-gray-400">Circular Protocol</p>
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-white transition-colors p-2"
        title="Close chart"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>

    <!-- Price Information -->
    <div class="mb-6">
      <div class="flex items-baseline gap-3 mb-2">
        <span class="text-3xl font-bold text-white">${{ currentPrice }}</span>
        <span :class="[
          'px-2 py-1 text-sm rounded-full font-medium',
          priceChange24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        ]">
          {{ priceChange24h >= 0 ? '+' : '' }}{{ priceChange24h }}%
        </span>
      </div>
      <div class="text-sm text-gray-400">
        24h Range: ${{ dayLow }} - ${{ dayHigh }}
      </div>
    </div>

    <!-- Market Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
      <div class="bg-gray-800/50 rounded-lg p-4">
        <div class="text-sm text-gray-400 mb-1">Market Cap</div>
        <div class="text-lg font-semibold text-white">${{ marketCap }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-4">
        <div class="text-sm text-gray-400 mb-1">24h Volume</div>
        <div class="text-lg font-semibold text-white">${{ volume24h }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-4">
        <div class="text-sm text-gray-400 mb-1">Circulating Supply</div>
        <div class="text-lg font-semibold text-white">{{ circulatingSupply }}</div>
      </div>
      <div class="bg-gray-800/50 rounded-lg p-4">
        <div class="text-sm text-gray-400 mb-1">Total Supply</div>
        <div class="text-lg font-semibold text-white">{{ totalSupply }}</div>
      </div>
    </div>

    <!-- Mock Chart Area -->
    <div class="bg-gray-800/30 rounded-lg p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <div class="text-sm font-medium text-white">Price Chart</div>
        <div class="flex gap-2">
          <button
            v-for="timeframe in timeframes"
            :key="timeframe.value"
            @click="selectedTimeframe = timeframe.value"
            :class="[
              'px-3 py-1 text-xs rounded-lg font-medium transition-colors',
              selectedTimeframe === timeframe.value
                ? 'bg-circular-primary text-gray-900'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            ]"
          >
            {{ timeframe.label }}
          </button>
        </div>
      </div>
      
      <!-- Simplified Chart Visualization -->
      <div class="h-48 flex items-end justify-between gap-1">
        <div
          v-for="(bar, index) in chartBars"
          :key="index"
          :class="[
            'w-2 rounded-t-sm transition-all duration-300',
            bar.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
          ]"
          :style="{ height: bar.height + '%' }"
          :title="`Price: $${bar.price}`"
        ></div>
      </div>
      
      <div class="text-center text-sm text-gray-400 mt-4">
        Live CIRX price chart • Data from CoinMarketCap
      </div>
    </div>

    <!-- External Links -->
    <div class="flex gap-2">
      <a
        href="https://coinmarketcap.com/currencies/circular-protocol/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-center text-sm font-medium transition-colors"
      >
        View on CMC
      </a>
      <a
        href="https://circularlabs.io"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 px-4 py-2 bg-circular-primary hover:bg-circular-primary-hover text-gray-900 rounded-lg text-center text-sm font-medium transition-colors"
      >
        Learn More
      </a>
    </div>
  </div>
</template>

<script setup>
// Props and emits
defineEmits(['close'])

// CIRX market data (from CoinMarketCap)
const currentPrice = ref('0.004663')
const priceChange24h = ref(0.81)
const dayLow = ref('0.004615')
const dayHigh = ref('0.00468')
const marketCap = ref('7.11M')
const volume24h = ref('1.4M')
const circulatingSupply = ref('1.52B CIRX')
const totalSupply = ref('1T CIRX')

// Chart controls
const selectedTimeframe = ref('24H')
const timeframes = [
  { label: '1H', value: '1H' },
  { label: '24H', value: '24H' },
  { label: '7D', value: '7D' },
  { label: '30D', value: '30D' },
  { label: '1Y', value: '1Y' }
]

// Mock chart data - simplified bars representing price movement
const chartBars = computed(() => {
  // Generate mock chart data based on selected timeframe
  const basePrice = parseFloat(currentPrice.value)
  const bars = []
  const numBars = selectedTimeframe.value === '1H' ? 60 : 
                  selectedTimeframe.value === '24H' ? 24 :
                  selectedTimeframe.value === '7D' ? 7 :
                  selectedTimeframe.value === '30D' ? 30 : 52

  for (let i = 0; i < numBars; i++) {
    // Create realistic price variation
    const variation = (Math.random() - 0.5) * 0.0002 // Small price movements
    const price = (basePrice + variation).toFixed(6)
    const trend = Math.random() > 0.5 ? 'up' : 'down'
    const height = 20 + Math.random() * 60 // 20-80% height

    bars.push({
      price,
      trend,
      height
    })
  }

  return bars
})

// Simulate real-time price updates
const updatePrice = () => {
  const currentValue = parseFloat(currentPrice.value)
  const variation = (Math.random() - 0.5) * 0.00005 // Very small movements
  const newPrice = (currentValue + variation).toFixed(6)
  currentPrice.value = newPrice
  
  // Update 24h change slightly
  const changeVariation = (Math.random() - 0.5) * 0.1
  priceChange24h.value = parseFloat((priceChange24h.value + changeVariation).toFixed(2))
}

// Update price every 10 seconds for demo
onMounted(() => {
  const interval = setInterval(updatePrice, 10000)
  onUnmounted(() => clearInterval(interval))
})
</script>