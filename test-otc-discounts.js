#!/usr/bin/env node

/**
 * Comprehensive test suite for OTC discount calculations
 * Tests all discount tiers and edge cases
 */

// Import the swap logic
import { useSwapLogic } from './ui/composables/useSwapLogic.js'

console.log('🧪 Testing OTC Discount Calculations')
console.log('===================================\n')

function runDiscountTests() {
  const swapLogic = useSwapLogic()
  
  // Test cases for discount tiers
  const discountTestCases = [
    // Test discount tier boundaries
    {
      name: 'Discount Tier Boundaries',
      tests: [
        // No discount (below $1K)
        { usdAmount: 0, expectedDiscount: 0, description: '$0 - No discount' },
        { usdAmount: 500, expectedDiscount: 0, description: '$500 - No discount' },
        { usdAmount: 999, expectedDiscount: 0, description: '$999 - No discount' },
        
        // 5% discount tier ($1K - $9,999)
        { usdAmount: 1000, expectedDiscount: 5, description: '$1,000 - 5% discount' },
        { usdAmount: 2500, expectedDiscount: 5, description: '$2,500 - 5% discount' },
        { usdAmount: 9999, expectedDiscount: 5, description: '$9,999 - 5% discount' },
        
        // 8% discount tier ($10K - $49,999)
        { usdAmount: 10000, expectedDiscount: 8, description: '$10,000 - 8% discount' },
        { usdAmount: 25000, expectedDiscount: 8, description: '$25,000 - 8% discount' },
        { usdAmount: 49999, expectedDiscount: 8, description: '$49,999 - 8% discount' },
        
        // 12% discount tier ($50K+)
        { usdAmount: 50000, expectedDiscount: 12, description: '$50,000 - 12% discount' },
        { usdAmount: 100000, expectedDiscount: 12, description: '$100,000 - 12% discount' },
        { usdAmount: 1000000, expectedDiscount: 12, description: '$1,000,000 - 12% discount' }
      ]
    }
  ]
  
  let totalTests = 0
  let passedTests = 0
  
  // Test discount calculation directly
  console.log('🎯 Testing Discount Tier Logic:')
  discountTestCases.forEach(testCase => {
    console.log(`\n${testCase.name}:`)
    
    testCase.tests.forEach(test => {
      totalTests++
      
      // Access the internal calculateDiscount function through quote calculation
      const testInput = (test.usdAmount / 2500).toString() // Convert to ETH amount assuming $2500/ETH
      const quote = swapLogic.calculateQuote(testInput, 'ETH', true) // true for OTC
      
      const actualDiscount = quote ? quote.discount : 0
      const passed = actualDiscount === test.expectedDiscount
      
      if (passed) {
        console.log(`  ✅ ${test.description}: ${actualDiscount}%`)
        passedTests++
      } else {
        console.log(`  ❌ ${test.description}: Expected ${test.expectedDiscount}%, got ${actualDiscount}%`)
      }
    })
  })
  
  // Test OTC vs Liquid quote differences
  console.log('\n💰 Testing OTC vs Liquid Quote Differences:')
  
  const comparisonTests = [
    { ethAmount: '1', usdValue: 2500, expectedDiscount: 5 },    // $2.5K -> 5%
    { ethAmount: '4', usdValue: 10000, expectedDiscount: 8 },   // $10K -> 8% 
    { ethAmount: '20', usdValue: 50000, expectedDiscount: 12 }  // $50K -> 12%
  ]
  
  comparisonTests.forEach(test => {
    totalTests += 2 // Liquid + OTC test
    
    const liquidQuote = swapLogic.calculateQuote(test.ethAmount, 'ETH', false)
    const otcQuote = swapLogic.calculateQuote(test.ethAmount, 'ETH', true)
    
    if (liquidQuote && otcQuote) {
      // Test that OTC has correct discount
      const discountPassed = otcQuote.discount === test.expectedDiscount
      if (discountPassed) {
        console.log(`  ✅ ${test.ethAmount} ETH OTC discount: ${otcQuote.discount}%`)
        passedTests++
      } else {
        console.log(`  ❌ ${test.ethAmount} ETH OTC discount: Expected ${test.expectedDiscount}%, got ${otcQuote.discount}%`)
      }
      
      // Test that OTC gives more CIRX than liquid
      const liquidAmount = parseFloat(liquidQuote.cirxAmount)
      const otcAmount = parseFloat(otcQuote.cirxAmount)
      const moreCirxPassed = otcAmount > liquidAmount
      
      if (moreCirxPassed) {
        const bonusPercent = ((otcAmount - liquidAmount) / liquidAmount * 100).toFixed(1)
        console.log(`  ✅ ${test.ethAmount} ETH OTC bonus: ${bonusPercent}% more CIRX (${liquidAmount} -> ${otcAmount})`)
        passedTests++
      } else {
        console.log(`  ❌ ${test.ethAmount} ETH OTC should give more CIRX than liquid: ${liquidAmount} vs ${otcAmount}`)
      }
    } else {
      console.log(`  ❌ Failed to calculate quotes for ${test.ethAmount} ETH`)
    }
  })
  
  // Test reverse quote discount consistency
  console.log('\n🔄 Testing Reverse Quote Discount Consistency:')
  
  const reverseTests = [
    { cirxAmount: '16667', ethAmount: '1', expectedDiscount: 5 },   // ~$2.5K
    { cirxAmount: '66667', ethAmount: '4', expectedDiscount: 8 },   // ~$10K
    { cirxAmount: '333333', ethAmount: '20', expectedDiscount: 12 } // ~$50K
  ]
  
  reverseTests.forEach(test => {
    totalTests++
    
    const reverseQuote = swapLogic.calculateReverseQuote(test.cirxAmount, 'ETH', true)
    
    if (reverseQuote && reverseQuote.forwardQuote) {
      const discountPassed = reverseQuote.forwardQuote.discount === test.expectedDiscount
      if (discountPassed) {
        console.log(`  ✅ ${test.cirxAmount} CIRX reverse quote discount: ${reverseQuote.forwardQuote.discount}%`)
        passedTests++
      } else {
        console.log(`  ❌ ${test.cirxAmount} CIRX reverse quote: Expected ${test.expectedDiscount}%, got ${reverseQuote.forwardQuote.discount}%`)
      }
    } else {
      console.log(`  ❌ Failed to calculate reverse quote for ${test.cirxAmount} CIRX`)
    }
  })
  
  // Test edge cases
  console.log('\n⚠️  Testing Edge Cases:')
  
  const edgeCases = [
    { amount: '0.0001', description: 'Very small amount' },
    { amount: '999999', description: 'Very large amount' },
    { amount: '0.4', description: 'Just below $1K threshold (0.4 ETH × $2500 = $1000)' }
  ]
  
  edgeCases.forEach(test => {
    totalTests++
    
    try {
      const quote = swapLogic.calculateQuote(test.amount, 'ETH', true)
      if (quote) {
        console.log(`  ✅ ${test.description}: ${test.amount} ETH -> ${quote.discount}% discount`)
        passedTests++
      } else {
        console.log(`  ❌ ${test.description}: Failed to calculate quote`)
      }
    } catch (error) {
      console.log(`  ❌ ${test.description}: Error - ${error.message}`)
    }
  })
  
  // Summary
  console.log('\n📊 Test Results Summary:')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${totalTests - passedTests}`)
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All OTC discount tests passed!')
    console.log('\n✅ Discount Tiers Verified:')
    console.log('   • $0 - $999: 0% discount')
    console.log('   • $1K - $9,999: 5% discount') 
    console.log('   • $10K - $49,999: 8% discount')
    console.log('   • $50K+: 12% discount')
    console.log('\n✅ OTC quotes provide correct bonus CIRX tokens')
    console.log('✅ Reverse quotes maintain discount consistency')
    console.log('✅ Edge cases handled properly')
  } else {
    console.log('\n⚠️ Some OTC discount tests failed - please review the implementation')
  }
  
  return passedTests === totalTests
}

// Run the tests
try {
  const allPassed = runDiscountTests()
  process.exit(allPassed ? 0 : 1)
} catch (error) {
  console.error('❌ Test suite failed:', error.message)
  console.error('Stack:', error.stack)
  process.exit(1)
}