<template>
  <div class="min-h-screen bg-circular-bg-primary p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-white mb-8">Multi-Wallet Integration Test</h1>
      
      <!-- Connection Status -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Connection Status</h2>
        
        <!-- Multi-Wallet Button -->
        <div class="mb-6">
          <MultiWalletButton />
        </div>
        
        <!-- Status Display -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-gray-400 mb-1">MetaMask</div>
            <div :class="[
              'font-semibold',
              isMetaMaskInstalled ? 'text-green-400' : 'text-red-400'
            ]">
              {{ isMetaMaskInstalled ? '✅ Installed' : '❌ Not Installed' }}
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-400 mb-1">Phantom</div>
            <div :class="[
              'font-semibold',
              isPhantomInstalled ? 'text-green-400' : 'text-red-400'
            ]">
              {{ isPhantomInstalled ? '✅ Installed' : '❌ Not Installed' }}
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-400 mb-1">WalletConnect</div>
            <div class="font-semibold text-green-400">
              ✅ Available
            </div>
          </div>
          
          <div>
            <div class="text-sm text-gray-400 mb-1">Wallet Connected</div>
            <div :class="[
              'font-semibold',
              isConnected ? 'text-green-400' : 'text-gray-400'
            ]">
              {{ isConnected ? '✅ Connected' : '⭕ Not Connected' }}
            </div>
          </div>
          
          <div v-if="isConnected">
            <div class="text-sm text-gray-400 mb-1">Account</div>
            <div class="font-mono text-white text-sm">{{ account || 'N/A' }}</div>
          </div>
          
          <div v-if="isConnected">
            <div class="text-sm text-gray-400 mb-1">Connected Wallet</div>
            <div class="font-semibold text-white capitalize">{{ connectedWallet || 'N/A' }}</div>
          </div>
          
          <div v-if="isConnected">
            <div class="text-sm text-gray-400 mb-1">Chain/Network</div>
            <div class="font-semibold text-white">{{ chainId || 'N/A' }}</div>
          </div>
          
          <div v-if="isConnected">
            <div class="text-sm text-gray-400 mb-1">Balance</div>
            <div class="font-semibold text-white">
              {{ balance }} {{ connectedWallet === 'phantom' ? 'SOL' : 'ETH' }}
            </div>
          </div>
          
          <div v-if="isConnected">
            <div class="text-sm text-gray-400 mb-1">Network Status</div>
            <div :class="[
              'font-semibold',
              isOnSupportedChain ? 'text-green-400' : 'text-yellow-400'
            ]">
              {{ isOnSupportedChain ? '✅ Supported' : '⚠️ Switch Network' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Token Balances -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Token Balances</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <template v-if="connectedWallet === 'phantom'">
            <div v-for="token in ['SOL', 'USDC_SOL', 'CIRX']" :key="token" class="text-center p-4 bg-gray-700 rounded-lg">
              <div class="text-2xl font-bold text-white mb-1">{{ getTokenBalance(token) }}</div>
              <div class="text-sm text-gray-400">{{ token.replace('_SOL', '') }}</div>
            </div>
          </template>
          <template v-else>
            <div v-for="token in ['ETH', 'USDC', 'USDT', 'CIRX']" :key="token" class="text-center p-4 bg-gray-700 rounded-lg">
              <div class="text-2xl font-bold text-white mb-1">{{ getTokenBalance(token) }}</div>
              <div class="text-sm text-gray-400">{{ token }}</div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- Test Actions -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Test Actions</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            @click="testSwap"
            :disabled="!isConnected || isSwapping"
            class="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <span v-if="isSwapping">Testing Swap...</span>
            <span v-else>Test Liquid Swap</span>
          </button>
          
          <button
            @click="testOTCSwap"
            :disabled="!isConnected || isSwapping"
            class="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <span v-if="isSwapping">Testing OTC Swap...</span>
            <span v-else>Test OTC Swap</span>
          </button>
          
          <button
            @click="refreshBalance"
            :disabled="!isConnected"
            class="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Refresh Balance
          </button>
          
          <button
            v-if="!isOnSupportedChain && isConnected"
            @click="switchToMainnet"
            class="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Switch to Mainnet
          </button>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 class="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        
        <div v-if="activities.length === 0" class="text-center py-8 text-gray-400">
          No recent activity. Try testing a swap!
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
          >
            <div>
              <div class="font-medium text-white">{{ activity.action }}</div>
              <div class="text-sm text-gray-400">{{ activity.timestamp }}</div>
            </div>
            <div class="text-right">
              <div class="font-medium text-green-400">{{ activity.status }}</div>
              <div v-if="activity.hash" class="text-xs text-gray-400 font-mono">
                {{ activity.hash.slice(0, 8) }}...{{ activity.hash.slice(-6) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error Display -->
      <div v-if="error" class="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
        <div class="font-medium text-red-200 mb-2">Error</div>
        <div class="text-red-300 text-sm">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Multi-Wallet Integration Test',
  layout: 'default'
})

// Multi-wallet integration
const {
  isConnected,
  account,
  chainId,
  balance,
  connectedWallet,
  error,
  isMetaMaskInstalled,
  isPhantomInstalled,
  isOnSupportedChain,
  getTokenBalance,
  executeSwap,
  updateBalance,
  switchToMainnet
} = useMultiWallet()

// Local state
const isSwapping = ref(false)
const activities = ref([])

// Test functions
const testSwap = async () => {
  if (!isConnected.value) return
  
  isSwapping.value = true
  try {
    const inputToken = connectedWallet.value === 'phantom' ? 'SOL' : 'ETH'
    const result = await executeSwap(inputToken, '0.001', 'CIRX', false)
    
    activities.value.unshift({
      id: Date.now(),
      action: `Liquid Swap: 0.001 ${inputToken} → CIRX (${connectedWallet.value})`,
      status: 'Success',
      hash: result.hash,
      timestamp: new Date().toLocaleTimeString()
    })
    
    // Keep only last 10 activities
    if (activities.value.length > 10) {
      activities.value = activities.value.slice(0, 10)
    }
    
  } catch (err) {
    activities.value.unshift({
      id: Date.now(),
      action: `Liquid Swap Failed (${connectedWallet.value})`,
      status: 'Error',
      hash: null,
      timestamp: new Date().toLocaleTimeString()
    })
  } finally {
    isSwapping.value = false
  }
}

const testOTCSwap = async () => {
  if (!isConnected.value) return
  
  isSwapping.value = true
  try {
    const inputToken = connectedWallet.value === 'phantom' ? 'SOL' : 'ETH'
    const result = await executeSwap(inputToken, '1.0', 'CIRX', true)
    
    activities.value.unshift({
      id: Date.now(),
      action: `OTC Swap: 1.0 ${inputToken} → CIRX (12% discount, ${connectedWallet.value})`,
      status: 'Success',
      hash: result.hash,
      timestamp: new Date().toLocaleTimeString()
    })
    
    if (activities.value.length > 10) {
      activities.value = activities.value.slice(0, 10)
    }
    
  } catch (err) {
    activities.value.unshift({
      id: Date.now(),
      action: `OTC Swap Failed (${connectedWallet.value})`,
      status: 'Error',
      hash: null,
      timestamp: new Date().toLocaleTimeString()
    })
  } finally {
    isSwapping.value = false
  }
}

const refreshBalance = async () => {
  if (!isConnected.value) return
  
  try {
    await updateBalance()
    
    activities.value.unshift({
      id: Date.now(),
      action: 'Balance Refreshed',
      status: 'Success',
      hash: null,
      timestamp: new Date().toLocaleTimeString()
    })
    
  } catch (err) {
    console.error('Failed to refresh balance:', err)
  }
}

// Head configuration
useHead({
  title: 'Multi-Wallet Integration Test - Circular CIRX',
  meta: [
    { 
      name: 'description', 
      content: 'Test page for multi-wallet integration (MetaMask, Phantom, WalletConnect)' 
    }
  ]
})
</script>