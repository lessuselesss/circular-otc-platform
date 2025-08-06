#!/usr/bin/env node

/**
 * Business Logic Verification for OTC Discounts
 * Tests the exact requirements against implementation
 */

import { useSwapLogic } from './ui/composables/useSwapLogic.js'

console.log('💼 OTC Business Logic Verification')
console.log('==================================\n')

function testBusinessRequirements() {
  const swapLogic = useSwapLogic()
  
  console.log('📋 Business Requirements Test:')
  console.log('• Discount Tiers: $1K+ (5%), $10K+ (8%), $50K+ (12%)')
  console.log('• Fee Structure: Liquid (0.3%), OTC (0.15%)')  
  console.log('• OTC provides bonus CIRX tokens via discount multiplier\n')
  
  // Test specific scenarios that match business requirements
  const businessTests = [
    {
      name: 'Small Purchase (Below Threshold)',
      input: { amount: '0.2', token: 'ETH', isOTC: true }, // $500
      expected: {
        discount: 0,
        feeRate: 0.15,
        shouldHaveBonus: false
      }
    },
    {
      name: 'Tier 1: $1K Purchase',
      input: { amount: '0.4', token: 'ETH', isOTC: true }, // $1000
      expected: {
        discount: 5,
        feeRate: 0.15,
        shouldHaveBonus: true
      }
    },
    {
      name: 'Tier 2: $10K Purchase', 
      input: { amount: '4', token: 'ETH', isOTC: true }, // $10000
      expected: {
        discount: 8,
        feeRate: 0.15,
        shouldHaveBonus: true
      }
    },
    {
      name: 'Tier 3: $50K Purchase',
      input: { amount: '20', token: 'ETH', isOTC: true }, // $50000
      expected: {
        discount: 12,
        feeRate: 0.15,
        shouldHaveBonus: true
      }
    },
    {
      name: 'Large Purchase: $100K',
      input: { amount: '40', token: 'ETH', isOTC: true }, // $100000
      expected: {
        discount: 12, // Should still be 12% (highest tier)
        feeRate: 0.15,
        shouldHaveBonus: true
      }
    }
  ]
  
  let passedTests = 0
  const totalTests = businessTests.length * 4 // 4 checks per test
  
  businessTests.forEach(test => {
    console.log(`\n🧪 ${test.name}:`)
    
    // Get OTC quote
    const otcQuote = swapLogic.calculateQuote(
      test.input.amount, 
      test.input.token, 
      test.input.isOTC
    )
    
    // Get liquid quote for comparison
    const liquidQuote = swapLogic.calculateQuote(
      test.input.amount,
      test.input.token,
      false
    )
    
    if (otcQuote && liquidQuote) {
      // Test 1: Discount percentage
      const discountPass = otcQuote.discount === test.expected.discount
      console.log(`  ${discountPass ? '✅' : '❌'} Discount: ${otcQuote.discount}% (expected ${test.expected.discount}%)`)
      if (discountPass) passedTests++
      
      // Test 2: Fee rate
      const feePass = otcQuote.feeRate === test.expected.feeRate
      console.log(`  ${feePass ? '✅' : '❌'} Fee Rate: ${otcQuote.feeRate}% (expected ${test.expected.feeRate}%)`)
      if (feePass) passedTests++
      
      // Test 3: Bonus CIRX calculation
      const otcCirx = parseFloat(otcQuote.cirxAmount)
      const liquidCirx = parseFloat(liquidQuote.cirxAmount)
      const hasBonus = otcCirx > liquidCirx
      const bonusPass = hasBonus === test.expected.shouldHaveBonus
      
      if (hasBonus) {
        const bonusPercent = ((otcCirx - liquidCirx) / liquidCirx * 100).toFixed(2)
        console.log(`  ${bonusPass ? '✅' : '❌'} Bonus CIRX: +${bonusPercent}% more than liquid (${liquidCirx} -> ${otcCirx})`)
      } else {
        console.log(`  ${bonusPass ? '✅' : '❌'} Bonus CIRX: None (expected: ${test.expected.shouldHaveBonus ? 'Yes' : 'No'})`)
      }
      if (bonusPass) passedTests++
      
      // Test 4: USD value calculation
      const expectedUsdValue = parseFloat(test.input.amount) * 2500 // Assuming $2500 ETH
      const usdValuePass = Math.abs(otcQuote.inputUsdValue - expectedUsdValue) < 1
      console.log(`  ${usdValuePass ? '✅' : '❌'} USD Value: $${otcQuote.inputUsdValue.toLocaleString()} (expected ~$${expectedUsdValue.toLocaleString()})`)
      if (usdValuePass) passedTests++
      
    } else {
      console.log(`  ❌ Failed to calculate quotes`)
    }
  })
  
  // Test mathematical accuracy
  console.log('\n🧮 Mathematical Accuracy Test:')
  
  // Test exact $10K scenario with known values
  const mathTest = swapLogic.calculateQuote('4', 'ETH', true)
  if (mathTest) {
    console.log(`Input: 4 ETH × $2,500 = $10,000`)
    console.log(`Discount Tier: 8% (for $10K+)`)
    console.log(`Fee: 0.15% (OTC rate)`)
    
    // Calculate step by step
    const inputUsd = 10000
    const feeAmount = 4 * 0.0015 // 0.15% of 4 ETH
    const usdAfterFee = inputUsd - (feeAmount * 2500) // Convert fee to USD
    const baseCirx = usdAfterFee / 0.15 // Assuming $0.15 per CIRX
    const discountMultiplier = 1.08 // 8% bonus
    const finalCirx = baseCirx * discountMultiplier
    
    console.log(`\nStep-by-step calculation:`)
    console.log(`1. Input USD: $${inputUsd.toLocaleString()}`)
    console.log(`2. Fee (0.15%): ${feeAmount} ETH = $${(feeAmount * 2500).toFixed(2)}`)
    console.log(`3. USD after fee: $${usdAfterFee.toFixed(2)}`)
    console.log(`4. Base CIRX (÷ $0.15): ${baseCirx.toLocaleString()}`)
    console.log(`5. With 8% bonus: ${finalCirx.toLocaleString()} CIRX`)
    console.log(`6. Actual result: ${parseFloat(mathTest.cirxAmount).toLocaleString()} CIRX`)
    
    const mathAccuracy = Math.abs(parseFloat(mathTest.cirxAmount) - finalCirx) / finalCirx < 0.01
    console.log(`\nMath Accuracy: ${mathAccuracy ? '✅ PASS' : '❌ FAIL'} (within 1%)`)
    
    if (mathAccuracy) passedTests++
  }
  
  console.log(`\n📊 Final Results: ${passedTests}/${totalTests + 1} tests passed (${((passedTests/(totalTests + 1)) * 100).toFixed(1)}%)`)
  
  return passedTests === (totalTests + 1)
}

// Edge case testing
function testEdgeCases() {
  console.log('\n⚠️ Edge Case Testing:')
  
  const swapLogic = useSwapLogic()
  const edgeCases = [
    { amount: '0.39999', description: 'Just below $1K threshold', expectedDiscount: 0 },
    { amount: '0.40001', description: 'Just above $1K threshold', expectedDiscount: 5 },
    { amount: '3.99999', description: 'Just below $10K threshold', expectedDiscount: 5 },
    { amount: '4.00001', description: 'Just above $10K threshold', expectedDiscount: 8 },
    { amount: '19.99999', description: 'Just below $50K threshold', expectedDiscount: 8 },
    { amount: '20.00001', description: 'Just above $50K threshold', expectedDiscount: 12 }
  ]
  
  let edgePassed = 0
  
  edgeCases.forEach(test => {
    const quote = swapLogic.calculateQuote(test.amount, 'ETH', true)
    if (quote && quote.discount === test.expectedDiscount) {
      console.log(`  ✅ ${test.description}: ${quote.discount}%`)
      edgePassed++
    } else {
      console.log(`  ❌ ${test.description}: Expected ${test.expectedDiscount}%, got ${quote ? quote.discount : 'null'}%`)
    }
  })
  
  console.log(`\nEdge Cases: ${edgePassed}/${edgeCases.length} passed`)
  return edgePassed === edgeCases.length
}

// Run all tests
try {
  const businessPassed = testBusinessRequirements()
  const edgesPassed = testEdgeCases()
  
  console.log('\n🎯 Overall Results:')
  console.log(`Business Logic: ${businessPassed ? 'PASSED' : 'FAILED'}`)
  console.log(`Edge Cases: ${edgesPassed ? 'PASSED' : 'FAILED'}`)
  
  if (businessPassed && edgesPassed) {
    console.log('\n🎉 ALL OTC DISCOUNT TESTS PASSED!')
    console.log('\n✅ Verified Features:')
    console.log('   • Correct discount tiers ($1K/5%, $10K/8%, $50K/12%)')
    console.log('   • Lower OTC fees (0.15% vs 0.3% liquid)')
    console.log('   • Bonus CIRX token calculation')
    console.log('   • Mathematical accuracy')
    console.log('   • Threshold boundary conditions')
  } else {
    console.log('\n❌ Some OTC discount tests failed')
  }
  
  process.exit((businessPassed && edgesPassed) ? 0 : 1)
  
} catch (error) {
  console.error('❌ Test suite error:', error.message)
  process.exit(1)
}