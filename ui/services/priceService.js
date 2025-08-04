/**
 * Real-time price feed service
 * Fetches live token prices from multiple sources with fallback
 */

const PRICE_CACHE_DURATION = 30000 // 30 seconds
let priceCache = {}
let lastFetch = 0

/**
 * CoinGecko price API (free tier: 50 calls/minute)
 */
const fetchCoinGeckoPrices = async () => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,tether,usd-coin&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      ETH: data.ethereum?.usd || 0,
      SOL: data.solana?.usd || 0,
      USDC: data['usd-coin']?.usd || 1,
      USDT: data.tether?.usd || 1,
      CIRX: 1 // CIRX price will be set based on business logic
    }
  } catch (error) {
    console.warn('CoinGecko price fetch failed:', error.message)
    return null
  }
}

/**
 * Fallback price source - can be replaced with other APIs
 */
const getFallbackPrices = () => {
  console.warn('Using fallback price data')
  return {
    ETH: 2500,   // Conservative fallback prices
    SOL: 100,    
    USDC: 1,     
    USDT: 1,     
    CIRX: 1      
  }
}

/**
 * Get current token prices with caching
 */
export const getTokenPrices = async () => {
  const now = Date.now()
  
  // Return cached prices if still fresh
  if (priceCache.data && (now - lastFetch) < PRICE_CACHE_DURATION) {
    return priceCache.data
  }
  
  // Try to fetch live prices
  let prices = await fetchCoinGeckoPrices()
  
  // Use fallback if primary source fails
  if (!prices) {
    prices = getFallbackPrices()
  }
  
  // Cache the results
  priceCache = {
    data: prices,
    timestamp: now,
    source: prices === getFallbackPrices() ? 'fallback' : 'coingecko'
  }
  lastFetch = now
  
  console.log('📊 Prices updated:', prices, `(source: ${priceCache.source})`)
  return prices
}

/**
 * Get price for a specific token
 */
export const getTokenPrice = async (tokenSymbol) => {
  const prices = await getTokenPrices()
  return prices[tokenSymbol] || 0
}

/**
 * Check if prices are from live feed or fallback
 */
export const getPriceSource = () => {
  return priceCache.source || 'unknown'
}

/**
 * Force refresh prices (bypass cache)
 */
export const refreshPrices = async () => {
  lastFetch = 0
  return await getTokenPrices()
}

/**
 * Get cache status for debugging
 */
export const getCacheInfo = () => {
  return {
    hasCache: !!priceCache.data,
    age: priceCache.timestamp ? Date.now() - priceCache.timestamp : 0,
    source: priceCache.source,
    data: priceCache.data
  }
}