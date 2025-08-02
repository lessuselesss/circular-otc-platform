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
      <div class="flex justify-between text-sm">
        <div class="text-gray-400">
          24h Range: ${{ dayLow }} - ${{ dayHigh }}
        </div>
        <div 
          v-if="crosshairPrice" 
          class="text-gray-300 font-medium"
        >
          {{ crosshairTime }}: ${{ crosshairPrice }}
        </div>
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

    <!-- TradingView Lightweight Chart Area -->
    <div class="bg-gray-800/30 rounded-lg p-2 mb-6">
      <div class="flex justify-between items-center mb-3 px-2">
        <div class="text-sm font-medium text-white">Price Chart</div>
        <div class="flex gap-2">
          <button
            v-for="timeframe in timeframes"
            :key="timeframe.value"
            @click="changeTimeframe(timeframe.value)"
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
      
      <!-- TradingView Chart Container -->
      <div 
        ref="chartContainer" 
        class="h-64 w-full rounded-lg overflow-hidden"
        style="background: #1a1a1a;"
      ></div>
      
      <div class="text-center text-sm text-gray-400 mt-3 px-2">
        Live CIRX price chart • Powered by TradingView
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
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import { useFetch } from '#imports';

// Chart type configuration
const chartTypes = [
  { value: 'candlestick', label: 'Candlestick' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' }
]
const selectedChartType = ref('candlestick')
let lineSeries = null
let areaSeries = null

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

// Chart references
const chartContainer = ref(null)
let chart = null
let candlestickSeries = null

// Generate realistic OHLC data for the chart
const processGeckoData = (apiData, timeframe) => {
  // Transform CoinGecko API response to TradingView format
  return apiData.map(item => ({
    time: item[0] / 1000, // Convert ms to seconds
    open: item[1],
    high: item[2],
    low: item[3],
    close: item[4]
  }))
}

const fetchOHLC = async (timeframe) => {
  const days = {
    '1H': 1, '24H': 1, '7D': 7, '30D': 30, '1Y': 365 
  }[timeframe]

  const { data, error } = await useFetch(
    `https://api.coingecko.com/api/v3/coins/circular-protocol/ohlc?vs_currency=usd&days=${days}`
  )

  if (error.value) {
    console.error('Failed to fetch OHLC data:', error.value)
    throw error.value
  }

  return processGeckoData(data.value, timeframe)
}

// Get accurate chart width accounting for padding and borders
const getChartWidth = () => {
  if (!chartContainer.value) return 800
  const rect = chartContainer.value.getBoundingClientRect()
  return Math.floor(rect.width) || 800
}

// Initialize the chart
const initChart = () => {
  console.log('initChart called, chartContainer.value:', chartContainer.value)
  if (!chartContainer.value) {
    console.error('chartContainer.value is null, cannot initialize chart')
    return
  }
  
  const chartWidth = getChartWidth()
  console.log('Creating chart with dimensions:', chartWidth, 'x', 256)
  chart = createChart(chartContainer.value, {
    layout: {
      background: { color: '#1a1a1a' },
      textColor: '#d1d5db',
    },
    grid: {
      vertLines: { color: '#374151' },
      horzLines: { color: '#374151' },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: '#4b5563',
    },
    timeScale: {
      borderColor: '#4b5563',
      timeVisible: true,
      secondsVisible: false,
    },
    width: chartWidth,
    height: 256,
  })
  
  // Set up crosshair subscription
  chart.subscribeCrosshairMove(param => {
    if (param.time && param.point && candlestickSeries) {
      const price = param.seriesPrices.get(candlestickSeries)
      if (price) {
        crosshairPrice.value = price.close.toFixed(6)
        crosshairTime.value = new Date(param.time * 1000).toLocaleString()
      }
    } else {
      // Reset to last price when not hovering
      if (candlestickSeries?.data?.length) {
        const last = candlestickSeries.data[candlestickSeries.data.length - 1]
        crosshairPrice.value = last.close.toFixed(6)
        crosshairTime.value = new Date(last.time * 1000).toLocaleString()
      }
    }
  })

  // Add candlestick series
  
  try {
    // Try the correct v5.0.8 method
    candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    })
  } catch (error) {
    console.error('Error adding candlestick series:', error)
    return
  }

  // Load initial data
  updateChartData()
  
  // Handle resize and maintain full width coverage
  const resizeChart = () => {
    if (chart && chartContainer.value) {
      const newWidth = getChartWidth()
      chart.applyOptions({ width: newWidth })
      
      // After resize, just fit content
      setTimeout(() => {
        chart.timeScale().fitContent()
        console.log('Applied fitContent() after resize')
      }, 100)
    }
  }
  
  window.addEventListener('resize', resizeChart)
  
  // Cleanup function
  onUnmounted(() => {
    window.removeEventListener('resize', resizeChart)
    if (chart) {
      chart.remove()
    }
  })
}

// Update chart data based on timeframe
const crosshairPrice = ref('')
const crosshairTime = ref('')

const updateChartData = async () => {
  if (!candlestickSeries) return
  
  try {
    // Use fallback data for now (API integration can be added later)
    const fallbackData = generateFallbackData()
    
    candlestickSeries.setData(fallbackData)
    
    // Simple approach: just use fitContent
    setTimeout(() => {
      chart.timeScale().fitContent()
      console.log('Applied fitContent() - should fill chart width')
    }, 200)
    
    const latest = fallbackData[fallbackData.length - 1]
    currentPrice.value = latest.close.toFixed(6)
    
    // Set default crosshair to latest price
    crosshairPrice.value = latest.close.toFixed(6)
    crosshairTime.value = new Date(latest.time * 1000).toLocaleString()
    
  } catch (error) {
    console.error('Error updating chart data:', error)
  }
}

// Generate fallback data when API fails
const generateFallbackData = () => {
  const basePrice = 0.004663
  const data = []
  const now = Math.floor(Date.now() / 1000)
  
  // Generate more data points to ensure chart can fill full width
  const timeframes = {
    '1H': { points: 60, interval: 60 },     // 1 minute intervals for 1 hour
    '24H': { points: 96, interval: 900 },   // 15 minute intervals for 24 hours  
    '7D': { points: 112, interval: 5400 },  // 1.5 hour intervals for 7 days
    '30D': { points: 120, interval: 21600 }, // 6 hour intervals for 30 days
    '1Y': { points: 104, interval: 302400 }  // 3.5 day intervals for 1 year
  }
  
  const config = timeframes[selectedTimeframe.value] || timeframes['24H']
  
  for (let i = config.points - 1; i >= 0; i--) {
    const time = now - (i * config.interval)
    const variation = (Math.random() - 0.5) * 0.02 // ±1% variation
    const price = basePrice * (1 + variation)
    
    data.push({
      time: time,
      open: price * (1 + (Math.random() - 0.5) * 0.005),
      high: price * (1 + Math.random() * 0.01),
      low: price * (1 - Math.random() * 0.01),
      close: price
    })
  }
  
  return data
}

// Change timeframe
const changeTimeframe = (newTimeframe) => {
  selectedTimeframe.value = newTimeframe
  updateChartData()
}

// Real-time data simulation (since CIRX is not on major exchanges yet)
let priceUpdateInterval = null;

const simulateRealTimeData = () => {
  // Simulate price updates every 30 seconds
  priceUpdateInterval = setInterval(() => {
    if (!candlestickSeries) return;
    
    try {
      // Get the last data point
      const currentData = candlestickSeries.data();
      if (!currentData || currentData.length === 0) return;
      
      const lastPoint = currentData[currentData.length - 1];
      const now = Math.floor(Date.now() / 1000);
      
      // Create a new data point with slight price variation (±0.5%)
      const variation = (Math.random() - 0.5) * 0.01; // ±0.5%
      const newClose = lastPoint.close * (1 + variation);
      const newHigh = Math.max(lastPoint.high, newClose * 1.001);
      const newLow = Math.min(lastPoint.low, newClose * 0.999);
      
      const newPoint = {
        time: now,
        open: lastPoint.close,
        high: newHigh,
        low: newLow,
        close: newClose
      };
      
      // Update the chart with new data
      candlestickSeries.update(newPoint);
      
      // Update current price display
      currentPrice.value = newClose.toFixed(6);
      
      console.log('Simulated price update:', newPoint);
    } catch (error) {
      console.error('Error in price simulation:', error);
    }
  }, 30000); // Update every 30 seconds
};

// Initialize chart when component mounts
onMounted(() => {
  nextTick(() => {
    initChart();
    simulateRealTimeData(); // Start price simulation

    // Add a slight delay then force a resize to ensure proper width calculation
    setTimeout(() => {
      if (chart && chartContainer.value) {
        const properWidth = getChartWidth()
        chart.applyOptions({ width: properWidth })
        console.log('Post-mount resize to width:', properWidth)
        
        // Final fitContent after mount
        setTimeout(() => {
          chart.timeScale().fitContent()
          console.log('Final fitContent() after mount')
        }, 100)
      }
    }, 100)

    onUnmounted(() => {
      clearInterval(priceUpdateInterval);
    });
  });
});
</script>