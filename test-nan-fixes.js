#!/usr/bin/env node

/**
 * Test script for NaN fixes in quote calculations
 * Tests edge cases that could cause NaN in the swap system
 */

// Import the swap logic
import { useSwapLogic } from './ui/composables/useSwapLogic.js'

console.log('🧪 Testing NaN Fixes in Quote Calculations')
console.log('==========================================\n')

function runNaNTests() {
  const swapLogic = useSwapLogic()
  
  const testCases = [
    // Test 1: Invalid input amounts
    {
      name: 'Invalid input amounts',
      tests: [
        { input: '', token: 'ETH', expected: null },
        { input: '0', token: 'ETH', expected: null },
        { input: 'abc', token: 'ETH', expected: null },
        { input: 'NaN', token: 'ETH', expected: null },
        { input: 'Infinity', token: 'ETH', expected: null },
        { input: '-5', token: 'ETH', expected: null }
      ]
    },
    
    // Test 2: Edge case numbers
    {
      name: 'Edge case numbers',
      tests: [
        { input: '0.000001', token: 'ETH', expected: 'valid' },
        { input: '99999999', token: 'ETH', expected: 'valid' },
        { input: '1e-10', token: 'ETH', expected: 'valid' },
        { input: '1e10', token: 'ETH', expected: 'valid' }
      ]
    },
    
    // Test 3: Invalid tokens
    {
      name: 'Invalid token symbols',
      tests: [
        { input: '1', token: 'INVALID', expected: null },
        { input: '1', token: '', expected: null },
        { input: '1', token: null, expected: null },
        { input: '1', token: undefined, expected: null }
      ]
    }
  ]
  
  let totalTests = 0
  let passedTests = 0
  
  testCases.forEach(testCase => {
    console.log(`🔍 ${testCase.name}:`)
    
    testCase.tests.forEach((test, index) => {
      totalTests++
      
      try {
        const result = swapLogic.calculateQuote(test.input, test.token, false)
        const passed = (test.expected === null && result === null) || 
                      (test.expected === 'valid' && result !== null)
        
        if (passed) {
          console.log(`  ✅ Test ${index + 1}: PASS (${test.input} ${test.token} -> ${result ? 'valid quote' : 'null'})`)
          passedTests++
        } else {
          console.log(`  ❌ Test ${index + 1}: FAIL (${test.input} ${test.token} -> expected ${test.expected}, got ${result ? 'valid' : 'null'})`)
        }
        
      } catch (error) {
        console.log(`  ❌ Test ${index + 1}: ERROR (${test.input} ${test.token} -> ${error.message})`)
      }
    })
    
    console.log('')
  })
  
  // Test reverse quotes
  console.log('🔄 Testing Reverse Quote NaN Protection:')
  const reverseTestCases = [
    { cirx: '', token: 'ETH', expected: null },
    { cirx: '0', token: 'ETH', expected: null },
    { cirx: 'NaN', token: 'ETH', expected: null },
    { cirx: 'Infinity', token: 'ETH', expected: null },
    { cirx: '-100', token: 'ETH', expected: null },
    { cirx: '1000', token: 'ETH', expected: 'valid' }
  ]
  
  reverseTestCases.forEach((test, index) => {
    totalTests++
    
    try {
      const result = swapLogic.calculateReverseQuote(test.cirx, test.token, false)
      const passed = (test.expected === null && result === null) || 
                    (test.expected === 'valid' && result !== null)
      
      if (passed) {
        console.log(`  ✅ Reverse ${index + 1}: PASS (${test.cirx} CIRX -> ${result ? 'valid quote' : 'null'})`)
        passedTests++
      } else {
        console.log(`  ❌ Reverse ${index + 1}: FAIL (${test.cirx} CIRX -> expected ${test.expected}, got ${result ? 'valid' : 'null'})`)
      }
      
    } catch (error) {
      console.log(`  ❌ Reverse ${index + 1}: ERROR (${test.cirx} CIRX -> ${error.message})`)
    }
  })
  
  console.log('')
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests) * 100).toFixed(1)}%)`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All NaN protection tests passed!')
  } else {
    console.log('⚠️ Some tests failed - NaN protection needs improvement')
  }
}

// Run the tests
try {
  runNaNTests()
} catch (error) {
  console.error('❌ Test suite failed:', error.message)
  process.exit(1)
}