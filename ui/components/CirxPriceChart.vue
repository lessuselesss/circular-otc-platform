<template>
  <div class="bg-circular-bg-primary/60 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 h-full flex flex-col">
    <!-- Chart Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-circular-primary/20 rounded-lg flex items-center justify-center">
          <span class="text-circular-primary font-bold text-sm">C</span>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">CIRX / USD</h3>
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
    <div class="mb-4">
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
    <div class="grid grid-cols-2 lg:grid-cols-2 gap-3 mb-4">
      <div class="bg-transparent border border-gray-700/30 hover:border-gray-600/50 rounded-lg p-3 transition-all duration-300">
        <div class="text-xs text-gray-400 mb-1">Market Cap</div>
        <div class="text-sm font-semibold text-white">${{ marketCap }}</div>
      </div>
      <div class="bg-transparent border border-gray-700/30 hover:border-gray-600/50 rounded-lg p-3 transition-all duration-300">
        <div class="text-xs text-gray-400 mb-1">24h Volume</div>
        <div class="text-sm font-semibold text-white">${{ volume24h }}</div>
      </div>
      <div class="bg-transparent border border-gray-700/30 hover:border-gray-600/50 rounded-lg p-3 transition-all duration-300">
        <div class="text-xs text-gray-400 mb-1">Circulating Supply</div>
        <div class="text-sm font-semibold text-white">{{ circulatingSupply }}</div>
      </div>
      <div class="bg-transparent border border-gray-700/30 hover:border-gray-600/50 rounded-lg p-3 transition-all duration-300">
        <div class="text-xs text-gray-400 mb-1">Total Supply</div>
        <div class="text-sm font-semibold text-white">{{ totalSupply }}</div>
      </div>
    </div>

    <!-- TradingView Lightweight Chart Area -->
    <div class="bg-gray-800/30 rounded-lg p-2 flex-1 flex flex-col overflow-hidden">
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
        class="flex-1 w-full rounded-lg overflow-hidden min-h-[360px]"
        style="background: #0f1115;"
      ></div>
      
      <div class="text-center text-sm text-gray-400 mt-3 px-2">
        Live CIRX price chart • Powered by TradingView
      </div>
    </div>

    <!-- External Links -->
    <div class="flex gap-2 mt-2">
      <a
        href="https://coinmarketcap.com/currencies/circular-protocol/"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 px-3 py-1.5 bg-transparent border border-gray-600/50 hover:border-gray-500 text-white rounded-lg text-center text-xs font-medium transition-all duration-300"
      >
        View on CMC
      </a>
      <a
        href="https://circularlabs.io"
        target="_blank"
        rel="noopener noreferrer"
        class="flex-1 px-3 py-1.5 bg-circular-primary/20 border border-circular-primary/30 hover:bg-circular-primary/30 text-circular-primary rounded-lg text-center text-xs font-medium transition-all duration-300"
      >
        Learn More
      </a>
    </div>
  </div>
</template>

<script setup>
import { createChart, LineStyle } from 'lightweight-charts'
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useFetch } from '#imports'

// Props and emits
defineEmits(['close'])

// CIRX market data (static placeholders; price auto-updated from last candle)
const currentPrice = ref('0.004663')
const priceChange24h = ref(0.81)
const dayLow = ref('0.004615')
const dayHigh = ref('0.00468')
const marketCap = ref('7.11M')
const volume24h = ref('1.4M')
const circulatingSupply = ref('1.52B CIRX')
const totalSupply = ref('1T CIRX')

// Chart controls (Jupiter-like chips)
const selectedTimeframe = ref('24H')
const timeframes = [
  { label: '15m', value: '15M' },
  { label: '1h', value: '1H' },
  { label: '24h', value: '24H' },
  { label: '7d', value: '7D' },
  { label: '30d', value: '30D' }
]

// Chart refs
const chartContainer = ref(null)
let chart = null
let candleSeries = null
let volumeSeries = null
let highLine = null
let lowLine = null

// Crosshair readout
const crosshairPrice = ref('')
const crosshairTime = ref('')

// Map timeframe to CoinGecko OHLC "days" parameter
const timeframeToDays = (tf) => ({
  '15M': 1,
  '1H': 1,
  '24H': 1,
  '7D': 7,
  '30D': 30,
  '1Y': 365
}[tf] || 1)

// Fetch OHLC data from CoinGecko and transform
const fetchOHLC = async (tf) => {
  const days = timeframeToDays(tf)
  const { data, error } = await useFetch(
    `https://api.coingecko.com/api/v3/coins/circular-protocol/ohlc?vs_currency=usd&days=${days}`
  )
  if (error.value) throw error.value
  const raw = data.value || []
  // raw: [timestamp, open, high, low, close]
  const candles = raw.map((r) => ({
    time: Math.floor(r[0] / 1000),
    open: r[1],
    high: r[2],
    low: r[3],
    close: r[4]
  }))
  return candles
}

const computeVolumeProxy = (candles) => {
  // Use body size as a rough proxy for volume coloring and height
  return candles.map((c) => ({
    time: c.time,
    value: Math.max(0.00000001, Math.abs(c.close - c.open)),
    color: c.close >= c.open ? '#10b981' : '#ef4444'
  }))
}

const initChart = () => {
  if (!chartContainer.value) return
  chart = createChart(chartContainer.value, {
    layout: { background: { color: '#0f1115' }, textColor: '#cbd5e1' },
    grid: {
      vertLines: { color: '#1f2937' },
      horzLines: { color: '#1f2937' }
    },
    crosshair: { mode: 1 },
    rightPriceScale: { borderColor: '#30363d' },
    timeScale: { borderColor: '#30363d', timeVisible: true, secondsVisible: false },
    width: chartContainer.value.offsetWidth,
    height: 360
  })

  candleSeries = chart.addCandlestickSeries({
    upColor: '#10b981',
    downColor: '#ef4444',
    borderUpColor: '#10b981',
    borderDownColor: '#ef4444',
    wickUpColor: '#10b981',
    wickDownColor: '#ef4444'
  })

  volumeSeries = chart.addHistogramSeries({
    priceFormat: { type: 'volume' },
    priceScaleId: '',
    scaleMargins: { top: 0.85, bottom: 0 },
    color: '#64748b'
  })

  chart.subscribeCrosshairMove((param) => {
    if (!param.time) return
    const price = param.seriesPrices.get(candleSeries)
    if (!price) return
    const close = price.close ?? price
    crosshairPrice.value = Number(close).toFixed(6)
    crosshairTime.value = new Date(Number(param.time) * 1000).toLocaleString()
  })

  // Responsive
  let ro = null
  if (window.ResizeObserver) {
    ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width
      if (!w) return
      chart.applyOptions({ width: Math.floor(w) })
      chart.timeScale().fitContent()
    })
    ro.observe(chartContainer.value)
  }
  onUnmounted(() => { ro?.disconnect(); chart?.remove() })
}

const drawHighLowLines = (candles) => {
  try { highLine && candleSeries.removePriceLine(highLine) } catch {}
  try { lowLine && candleSeries.removePriceLine(lowLine) } catch {}
  if (!candles?.length) return
  const highs = candles.map((c) => c.high)
  const lows = candles.map((c) => c.low)
  const hi = Math.max(...highs)
  const lo = Math.min(...lows)
  highLine = candleSeries.createPriceLine({ price: hi, color: '#3b82f6', lineStyle: LineStyle.Dotted, axisLabelVisible: true, title: 'High' })
  lowLine = candleSeries.createPriceLine({ price: lo, color: '#94a3b8', lineStyle: LineStyle.Dotted, axisLabelVisible: true, title: 'Low' })
}

const updateChartData = async () => {
  if (!candleSeries) return
  try {
    const candles = await fetchOHLC(selectedTimeframe.value)
    candleSeries.setData(candles)
    volumeSeries.setData(computeVolumeProxy(candles))
    chart.timeScale().fitContent()

    const last = candles[candles.length - 1]
    currentPrice.value = Number(last.close).toFixed(6)
    dayHigh.value = Number(Math.max(...candles.slice(-96).map((c) => c.high))).toFixed(6)
    dayLow.value = Number(Math.min(...candles.slice(-96).map((c) => c.low))).toFixed(6)

    drawHighLowLines(candles)
  } catch (e) {
    console.warn('Chart data load failed, falling back to no-op:', e)
  }
}

const changeTimeframe = (tf) => {
  selectedTimeframe.value = tf
}

// React when timeframe changes
watch(selectedTimeframe, async () => {
  await updateChartData()
})

// Initialize
onMounted(async () => {
  nextTick(async () => {
    initChart()
    await updateChartData()
  })
})
</script>