#!/usr/bin/env node

/**
 * Manual verification of OTC discount calculations
 * Step-by-step breakdown of the math
 */

// Import the swap logic
import { useSwapLogic } from './ui/composables/useSwapLogic.js'

console.log('🔍 Manual OTC Discount Verification')
console.log('=====================================\n')

function verifyOTCCalculations() {
  const swapLogic = useSwapLogic()
  
  console.log('📊 Test Scenario: 4 ETH swap ($10,000 USD value)')
  console.log('Expected: 8% OTC discount for $10K tier\n')
  
  // Test with 4 ETH (should be $10,000 at $2500/ETH -> 8% discount)
  const inputAmount = '4'
  const inputToken = 'ETH'
  
  console.log('🔄 Calculating Liquid Quote (no discount):')
  const liquidQuote = swapLogic.calculateQuote(inputAmount, inputToken, false)
  
  if (liquidQuote) {
    console.log(`  Input: ${liquidQuote.inputAmount} ${liquidQuote.inputToken}`)
    console.log(`  Input USD Value: $${liquidQuote.inputUsdValue.toLocaleString()}`)
    console.log(`  Token Price: $${liquidQuote.tokenPrice}`)
    console.log(`  CIRX Price: $${liquidQuote.cirxPrice}`)
    console.log(`  Fee Rate: ${liquidQuote.feeRate}%`)
    console.log(`  Fee Amount: ${liquidQuote.feeAmount} ${liquidQuote.inputToken}`)
    console.log(`  CIRX Received: ${liquidQuote.cirxAmount} CIRX`)
    console.log(`  Exchange Rate: ${liquidQuote.exchangeRate}`)
  } else {
    console.log('  ❌ Failed to calculate liquid quote')
    return false
  }
  
  console.log('\n🎁 Calculating OTC Quote (with discount):')
  const otcQuote = swapLogic.calculateQuote(inputAmount, inputToken, true)
  
  if (otcQuote) {
    console.log(`  Input: ${otcQuote.inputAmount} ${otcQuote.inputToken}`)
    console.log(`  Input USD Value: $${otcQuote.inputUsdValue.toLocaleString()}`)
    console.log(`  Discount Tier: ${otcQuote.discount}%`)
    console.log(`  Fee Rate: ${otcQuote.feeRate}% (lower for OTC)`)
    console.log(`  Fee Amount: ${otcQuote.feeAmount} ${otcQuote.inputToken}`)
    console.log(`  CIRX Received: ${otcQuote.cirxAmount} CIRX`)
    console.log(`  Exchange Rate: ${otcQuote.exchangeRate}`)
  } else {
    console.log('  ❌ Failed to calculate OTC quote')
    return false
  }
  
  console.log('\n📈 Comparison Analysis:')
  if (liquidQuote && otcQuote) {
    const liquidCirx = parseFloat(liquidQuote.cirxAmount)
    const otcCirx = parseFloat(otcQuote.cirxAmount)
    const bonusCirx = otcCirx - liquidCirx
    const bonusPercent = (bonusCirx / liquidCirx) * 100
    
    console.log(`  Liquid CIRX:   ${liquidCirx.toLocaleString()} CIRX`)
    console.log(`  OTC CIRX:      ${otcCirx.toLocaleString()} CIRX`)
    console.log(`  Bonus CIRX:    ${bonusCirx.toLocaleString()} CIRX`)
    console.log(`  Bonus %:       ${bonusPercent.toFixed(2)}%`)
    
    // Verify expectations
    const tests = [
      {
        name: 'USD Value Check',
        expected: 10000,
        actual: otcQuote.inputUsdValue,
        tolerance: 1,
        pass: Math.abs(otcQuote.inputUsdValue - 10000) < 1
      },
      {
        name: 'Discount Tier Check',
        expected: 8,
        actual: otcQuote.discount,
        tolerance: 0,
        pass: otcQuote.discount === 8
      },
      {
        name: 'OTC Bonus Check',
        expected: true,
        actual: otcCirx > liquidCirx,
        tolerance: 0,
        pass: otcCirx > liquidCirx
      },
      {
        name: 'Lower OTC Fee Check',
        expected: true,
        actual: otcQuote.feeRate < liquidQuote.feeRate,
        tolerance: 0,
        pass: otcQuote.feeRate < liquidQuote.feeRate
      }
    ]
    
    console.log('\n✅ Verification Results:')
    let allPassed = true
    
    tests.forEach(test => {
      if (test.pass) {
        console.log(`  ✅ ${test.name}: PASS (${test.actual})`)
      } else {
        console.log(`  ❌ ${test.name}: FAIL (Expected: ${test.expected}, Got: ${test.actual})`)
        allPassed = false
      }
    })
    
    return allPassed
  }
  
  return false
}

// Test different tiers
function testAllTiers() {
  console.log('\n🎯 Testing All Discount Tiers:')
  
  const tierTests = [
    { amount: '0.2', expectedDiscount: 0, description: '$500 (No discount)' },
    { amount: '1', expectedDiscount: 5, description: '$2,500 (5% discount)' },
    { amount: '4', expectedDiscount: 8, description: '$10,000 (8% discount)' },
    { amount: '20', expectedDiscount: 12, description: '$50,000 (12% discount)' }
  ]
  
  const swapLogic = useSwapLogic()
  let allPassed = true
  
  tierTests.forEach(test => {
    const quote = swapLogic.calculateQuote(test.amount, 'ETH', true)
    
    if (quote && quote.discount === test.expectedDiscount) {
      console.log(`  ✅ ${test.amount} ETH - ${test.description}: ${quote.discount}%`)
    } else {
      console.log(`  ❌ ${test.amount} ETH - ${test.description}: Expected ${test.expectedDiscount}%, got ${quote ? quote.discount : 'null'}%`)
      allPassed = false
    }
  })
  
  return allPassed
}

// Run verification
try {
  console.log('Starting OTC discount verification...\n')
  
  const manualTestPassed = verifyOTCCalculations()
  const tierTestsPassed = testAllTiers()
  
  console.log('\n📊 Final Results:')
  console.log(`Manual Verification: ${manualTestPassed ? 'PASSED' : 'FAILED'}`)
  console.log(`Tier Tests: ${tierTestsPassed ? 'PASSED' : 'FAILED'}`)
  
  if (manualTestPassed && tierTestsPassed) {
    console.log('\n🎉 All OTC discount calculations are working correctly!')
  } else {
    console.log('\n⚠️ Some OTC discount calculations need attention')
  }
  
  process.exit((manualTestPassed && tierTestsPassed) ? 0 : 1)
  
} catch (error) {
  console.error('❌ Verification failed:', error.message)
  process.exit(1)
}