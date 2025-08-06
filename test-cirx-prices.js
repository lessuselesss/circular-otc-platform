#!/usr/bin/env node

/**
 * Test script for CIRX price fetching
 * Run with: node test-cirx-prices.js
 */

// Import the price service
import { getTokenPrices, getCacheInfo, getCirxPriceInfo, testCirxFetch } from './ui/services/priceService.js'

console.log('🧪 Testing CIRX Price Fetching System')
console.log('=====================================\n')

async function runTests() {
  try {
    // Test 1: Direct CIRX fetch
    console.log('1️⃣ Testing direct CIRX/USDT price fetch...')
    const directCirxPrice = await testCirxFetch()
    console.log(`   Result: $${directCirxPrice} USDT\n`)
    
    // Test 2: Full token price system
    console.log('2️⃣ Testing complete token price system...')
    const allPrices = await getTokenPrices()
    console.log('   All prices (USD-denominated):')
    Object.entries(allPrices).forEach(([token, price]) => {
      console.log(`   ${token.padEnd(4)}: $${price}`)
    })
    console.log('')
    
    // Test 3: CIRX-specific info
    console.log('3️⃣ Testing CIRX price information...')
    const cirxInfo = await getCirxPriceInfo()
    console.log('   CIRX Price Details:')
    console.log(`   USD Price:    $${cirxInfo.priceUsd}`)
    console.log(`   USDT Price:   ${cirxInfo.priceUsdt} USDT`)
    console.log(`   USDT/USD Rate: ${cirxInfo.usdtRate}`)
    console.log(`   Source:       ${cirxInfo.source}`)
    console.log(`   Is Live:      ${cirxInfo.isLive}`)
    console.log(`   Is Fallback:  ${cirxInfo.isFallback}`)
    console.log('')
    
    // Test 4: Cache information
    console.log('4️⃣ Testing cache system...')
    const cacheInfo = getCacheInfo()
    console.log('   Cache Status:')
    console.log(`   Has Cache:    ${cacheInfo.hasCache}`)
    console.log(`   Age:          ${cacheInfo.age.minutes} minutes`)
    console.log(`   Source:       ${cacheInfo.source}`)
    console.log(`   Is Stale:     ${cacheInfo.age.isStale}`)
    console.log(`   Cache Expiry: ${cacheInfo.cacheExpiry}`)
    
    console.log('\n✅ All tests completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Run the tests
runTests()