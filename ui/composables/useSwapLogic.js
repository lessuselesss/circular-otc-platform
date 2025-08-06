import { computed, ref } from 'vue'
import { getTokenPrices, getTokenPrice } from '../services/priceService.js'

/**
 * Swap business logic composable
 * Handles quote calculations, price feeds, and swap validation
 * Separated from UI components for better testability
 */
export function useSwapLogic() {
  
  // Real-time token prices (fetched from live APIs)
  const tokenPrices = ref({
    ETH: 2500,   // Will be updated with live prices
    USDC: 1,     
    USDT: 1,     
    SOL: 100,    
    CIRX: 1      
  })

  // Track if we're using live or fallback prices
  const priceSource = ref('loading')

  // Initialize prices on first use
  const initializePrices = async () => {
    try {
      const livePrices = await getTokenPrices()
      tokenPrices.value = { ...livePrices }
      priceSource.value = 'live'
    } catch (error) {
      console.warn('Failed to load live prices, using fallback:', error)
      priceSource.value = 'fallback'
    }
  }

  // Auto-initialize prices
  initializePrices()

  // Fee structure
  const fees = {
    liquid: 0.3,  // 0.3% for liquid swaps
    otc: 0.15     // 0.15% for OTC swaps
  }

  // OTC discount tiers
  const discountTiers = [
    { minAmount: 50000, discount: 12 },  // $50K+: 12%
    { minAmount: 10000, discount: 8 },   // $10K+: 8%  
    { minAmount: 1000, discount: 5 }     // $1K+: 5%
  ]

  /**
   * Calculate discount percentage based on USD amount
   */
  const calculateDiscount = (usdAmount) => {
    for (const tier of discountTiers) {
      if (usdAmount >= tier.minAmount) {
        return tier.discount
      }
    }
    return 0
  }

  /**
   * Normalize token symbol for price lookup
   */
  const normalizeTokenSymbol = (tokenSymbol) => {
    // Handle Solana-specific token naming
    if (tokenSymbol === 'USDC_SOL') return 'USDC'
    if (tokenSymbol === 'USDT_SOL') return 'USDT'
    return tokenSymbol
  }

  /**
   * Get token price in USD
   */
  const getTokenPrice = (tokenSymbol) => {
    const normalizedSymbol = normalizeTokenSymbol(tokenSymbol)
    const price = tokenPrices.value[normalizedSymbol]
    
    // Add validation to prevent NaN
    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
      console.warn(`Invalid price for token ${tokenSymbol}:`, price)
      return 0
    }
    
    return price
  }

  /**
   * Refresh prices from live feed
   */
  const refreshPrices = async () => {
    await initializePrices()
  }

  /**
   * Calculate swap quote
   */
  const calculateQuote = (inputAmount, inputToken, isOTC = false) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) return null
    
    const inputValue = parseFloat(inputAmount)
    
    // Add validation for inputValue
    if (isNaN(inputValue) || inputValue <= 0) {
      console.warn('Invalid input amount:', inputAmount)
      return null
    }
    
    const tokenPrice = getTokenPrice(inputToken)
    
    // Prevent calculations with invalid token prices
    if (tokenPrice <= 0) {
      console.warn(`Cannot calculate quote: invalid price for ${inputToken}`)
      return null
    }
    
    const totalUsdValue = inputValue * tokenPrice
    
    // Calculate fee
    const feeRate = isOTC ? fees.otc : fees.liquid
    const feeAmount = (inputValue * feeRate) / 100
    const amountAfterFee = inputValue - feeAmount
    const usdAfterFee = amountAfterFee * tokenPrice
    
    // Base CIRX amount (1:1 with USD)
    let cirxReceived = usdAfterFee
    let discount = 0
    
    // Apply OTC discount
    if (isOTC) {
      discount = calculateDiscount(totalUsdValue)
      cirxReceived = usdAfterFee * (1 + discount / 100)
    }
    
    // Validate final calculations
    if (isNaN(cirxReceived) || cirxReceived < 0) {
      console.error('Invalid CIRX calculation result:', cirxReceived)
      return null
    }
    
    return {
      inputAmount: inputValue,
      inputToken,
      inputUsdValue: totalUsdValue,
      tokenPrice,
      feeRate,
      feeAmount,
      feeUsd: feeAmount * tokenPrice,
      discount,
      cirxAmount: cirxReceived.toFixed(6),
      cirxAmountFormatted: formatNumber(cirxReceived),
      exchangeRate: `1 ${inputToken} = ${tokenPrice.toLocaleString()} CIRX`,
      isOTC,
      priceImpact: 0, // Could be calculated based on liquidity
      minimumReceived: (cirxReceived * 0.995).toFixed(6), // 0.5% slippage
      vestingPeriod: isOTC ? '6 months' : null
    }
  }

  /**
   * Calculate reverse quote (CIRX amount -> input token amount)
   */
  const calculateReverseQuote = (cirxAmount, targetToken, isOTC = false) => {
    if (!cirxAmount || parseFloat(cirxAmount) <= 0) return null
    
    const cirxValue = parseFloat(cirxAmount)
    
    // Add validation for cirxValue
    if (isNaN(cirxValue) || cirxValue <= 0) {
      console.warn('Invalid CIRX amount:', cirxAmount)
      return null
    }
    
    const tokenPrice = getTokenPrice(targetToken)
    
    // Prevent calculations with invalid token prices
    if (tokenPrice <= 0) {
      console.warn(`Cannot calculate reverse quote: invalid price for ${targetToken}`)
      return null
    }
    
    // Reverse the OTC discount calculation
    let usdAfterFee = cirxValue
    let discount = 0
    
    if (isOTC) {
      // We need to estimate the discount tier based on the final amount
      // This is an approximation since we don't know the original USD amount
      const estimatedUsdValue = cirxValue // Starting estimate
      discount = calculateDiscount(estimatedUsdValue)
      
      // Reverse the discount: cirxReceived = usdAfterFee * (1 + discount / 100)
      usdAfterFee = cirxValue / (1 + discount / 100)
    }
    
    // Reverse the fee calculation: amountAfterFee = inputValue - feeAmount
    const feeRate = isOTC ? fees.otc : fees.liquid
    // usdAfterFee = amountAfterFee * tokenPrice
    const amountAfterFee = usdAfterFee / tokenPrice
    
    // amountAfterFee = inputValue * (1 - feeRate/100)
    const inputValue = amountAfterFee / (1 - feeRate / 100)
    
    // Validate final calculations
    if (isNaN(inputValue) || inputValue < 0) {
      console.error('Invalid reverse calculation result:', inputValue)
      return null
    }
    
    // Calculate the forward quote for verification and additional data
    const forwardQuote = calculateQuote(inputValue.toString(), targetToken, isOTC)
    
    return {
      inputAmount: inputValue,
      inputToken: targetToken,
      cirxAmount: cirxValue,
      tokenPrice,
      feeRate,
      discount,
      isReverse: true,
      forwardQuote // Include forward calculation for verification
    }
  }

  /**
   * Validate swap parameters
   */
  const validateSwap = (inputAmount, inputToken, recipientAddress = null, isConnected = false) => {
    const errors = []

    // Amount validation
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      errors.push('Invalid amount')
    }

    // Token validation
    if (!inputToken || !tokenPrices[inputToken]) {
      errors.push('Unsupported token')
    }

    // Recipient validation
    if (!isConnected && !recipientAddress) {
      errors.push('Recipient address required')
    }

    if (recipientAddress && !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      errors.push('Invalid recipient address')
    }

    // Minimum amount validation
    const usdValue = parseFloat(inputAmount) * getTokenPrice(inputToken)
    if (usdValue < 10) {
      errors.push('Minimum swap amount is $10')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Calculate maximum input amount based on balance
   */
  const calculateMaxAmount = (balance, tokenSymbol) => {
    const availableBalance = parseFloat(balance) || 0
    
    if (availableBalance <= 0) return '0'

    // Reserve small amount for gas fees if using native tokens
    const reserveAmount = ['ETH', 'SOL'].includes(tokenSymbol) ? 0.001 : 0
    const maxAmount = Math.max(0, availableBalance - reserveAmount)

    return maxAmount.toString()
  }

  /**
   * Format number for display
   */
  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value)
    if (isNaN(num)) return '0'

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    } else if (num >= 1) {
      return num.toFixed(decimals)
    } else {
      return num.toFixed(6).replace(/\.?0+$/, '')
    }
  }

  /**
   * Format USD value
   */
  const formatUsd = (value) => {
    const num = parseFloat(value)
    if (isNaN(num)) return '$0.00'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  /**
   * Get available tokens for current wallet
   */
  const getAvailableTokens = (walletChain) => {
    if (walletChain === 'solana') {
      return [
        { symbol: 'SOL', name: 'Solana', logo: '/tokens/sol.svg' },
        { symbol: 'USDC', name: 'USD Coin', logo: '/tokens/usdc.svg' }
      ]
    } else {
      return [
        { symbol: 'ETH', name: 'Ethereum', logo: '/tokens/eth.svg' },
        { symbol: 'USDC', name: 'USD Coin', logo: '/tokens/usdc.svg' },
        { symbol: 'USDT', name: 'Tether', logo: '/tokens/usdt.svg' }
      ]
    }
  }

  /**
   * Check if amount qualifies for OTC discount
   */
  const qualifiesForOTC = (inputAmount, inputToken) => {
    const usdValue = parseFloat(inputAmount) * getTokenPrice(inputToken)
    return usdValue >= 1000 // Minimum for OTC discount
  }

  /**
   * Get estimated transaction time
   */
  const getEstimatedTime = (isOTC, walletChain) => {
    if (isOTC) return 'Immediate (with 6-month vesting)'
    
    if (walletChain === 'ethereum') return '~15 seconds'
    if (walletChain === 'solana') return '~1 second'
    
    return '~1 minute'
  }

  return {
    // Price data
    tokenPrices,
    priceSource,
    fees,
    discountTiers,
    
    // Core functions
    calculateQuote,
    calculateReverseQuote,
    calculateDiscount,
    validateSwap,
    calculateMaxAmount,
    refreshPrices,
    
    // Utility functions
    formatNumber,
    formatUsd,
    getTokenPrice,
    normalizeTokenSymbol,
    getAvailableTokens,
    qualifiesForOTC,
    getEstimatedTime
  }
}