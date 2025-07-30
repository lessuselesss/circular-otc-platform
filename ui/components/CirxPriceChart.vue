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
    <div class="bg-gray-800/30 rounded-lg p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
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
      
      <div class="text-center text-sm text-gray-400 mt-4">
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
import { createChart } from 'lightweight-charts';
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import { useFetch } from '#imports';
import pako from 'pako';

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

// Initialize the chart
const initChart = () => {
  if (!chartContainer.value) return
  
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
    width: chartContainer.value.clientWidth,
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
  candlestickSeries = chart.addCandlestickSeries({
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderDownColor: '#ef4444',
    borderUpColor: '#22c55e',
    wickDownColor: '#ef4444',
    wickUpColor: '#22c55e',
  })

  // Load initial data
  updateChartData()
  
  // Handle resize
  const resizeChart = () => {
    if (chart && chartContainer.value) {
      chart.applyOptions({ width: chartContainer.value.clientWidth })
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
    const data = await fetchOHLC(selectedTimeframe.value)
    candlestickSeries.setData(data)
    
    if (data.length > 0) {
      const latest = data[data.length - 1]
      currentPrice.value = latest.close.toFixed(6)
      
      // Set default crosshair to latest price
      crosshairPrice.value = latest.close.toFixed(6)
      crosshairTime.value = new Date(latest.time * 1000).toLocaleString()
    }
  } catch (error) {
    console.error('Error updating chart data:', error)
    // Fallback to mock data if API fails
    // const data = generateOHLCData(selectedTimeframe.value)
    // candlestickSeries.setData(data)
  }
}

// Change timeframe
const changeTimeframe = (newTimeframe) => {
  selectedTimeframe.value = newTimeframe
  updateChartData()
}

// WebSocket for real-time data
let ws = null;
let pingInterval = null;

const connectWebSocket = () => {
  ws = new WebSocket('wss://fstream.xt.com/ws/market');

  ws.onopen = () => {
    console.log('WebSocket connected.');
    // Subscribe to CIRX/USDT K-line data (1-minute interval for real-time)
    const subscribeMessage = {
      req: 'sub_kline',
      symbol: 'cirx_usdt', // Assuming CIRX/USDT is the correct symbol
      type: '1m'
    };
    ws.send(JSON.stringify(subscribeMessage));

    // Start pinging to keep the connection alive
    pingInterval = setInterval(() => {
      ws.send(JSON.stringify({ ping: Date.now() }));
    }, 30000); // Ping every 30 seconds
  };

  ws.onmessage = (event) => {
    // XT.COM data is GZIP compressed and Base64 encoded
    // You might need to install 'pako' for decompression: npm install pako
    // import pako from 'pako';
    try {
      const decodedData = atob(event.data);
      const decompressedData = pako.inflate(decodedData, { to: 'string' });
      const message = JSON.parse(decompressedData);

      if (message.data && message.channel === 'kline_1m') { // Adjust channel name if different
        const kline = message.data;
        const newPoint = {
          time: kline.t / 1000, // Convert ms to seconds
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c)
        };
        candlestickSeries.update(newPoint);

        // Update current price display
        currentPrice.value = newPoint.close.toFixed(6);
        // 24h change would ideally come from a separate 24h ticker feed
        // For now, it will remain static or you can implement a calculation based on fetched data.
      } else if (message.ping) {
        // Respond to ping with pong
        ws.send(JSON.stringify({ pong: message.ping }));
      }
    } catch (e) {
      console.error('Error processing WebSocket message:', e);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket closed. Attempting to reconnect...');
    clearInterval(pingInterval);
    setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
  };
};

// Initialize chart when component mounts
onMounted(() => {
  nextTick(() => {
    initChart();
    connectWebSocket(); // Establish WebSocket connection

    onUnmounted(() => {
      if (ws) {
        ws.close();
      }
      clearInterval(pingInterval);
    });
  });
});
</script>