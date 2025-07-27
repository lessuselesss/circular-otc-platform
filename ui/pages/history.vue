<template>
  <div class="min-h-screen bg-circular-bg-primary">
    <!-- Header -->
    <header class="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2 sm:gap-4">
            <NuxtLink to="/swap" class="font-michroma text-lg sm:text-xl text-circular-primary hover:text-circular-primary-hover transition-colors">
              Circular CIRX
            </NuxtLink>
            <span class="text-xs sm:text-sm hidden sm:block text-gray-400">Transaction History</span>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <NuxtLink to="/swap" class="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors">
              Back to Swap
            </NuxtLink>
            <MultiWalletButton />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-6xl mx-auto p-4 md:p-8">
      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Transaction History</h1>
        <p class="text-gray-400">View your CIRX purchase and vesting history</p>
      </div>

      <!-- Wallet Connection Check -->
      <div v-if="!isConnected" class="text-center py-16">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
          <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" class="text-gray-400">
              <path d="M21 6h-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v2H1v14a2 2 0 002 2h18a2 2 0 002-2V6zM5 4h12v2H5V4zm14 16H3V8h2v2h2V8h10v2h2V8h2v12z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p class="text-gray-400 mb-6">Connect your wallet to view your transaction history and vesting positions.</p>
          <MultiWalletButton />
        </div>
      </div>

      <!-- Transaction History (Connected State) -->
      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Total Purchases -->
          <div class="bg-gradient-to-br from-circular-bg-secondary to-circular-bg-secondary/95 border border-gray-700 rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-400">Total Purchases</h3>
              <div class="w-8 h-8 bg-circular-primary/20 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="text-circular-primary">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
            </div>
            <div class="text-2xl font-bold text-white">{{ mockStats.totalPurchases }}</div>
            <div class="text-sm text-gray-400">{{ mockStats.totalUsdValue }}</div>
          </div>

          <!-- Vesting Balance -->
          <div class="bg-gradient-to-br from-circular-bg-secondary to-circular-bg-secondary/95 border border-gray-700 rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-400">Vesting Balance</h3>
              <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="text-purple-400">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <div class="text-2xl font-bold text-white">{{ mockStats.vestingBalance }}</div>
            <div class="text-sm text-gray-400">{{ mockStats.claimableAmount }} claimable</div>
          </div>

          <!-- Liquid Balance -->
          <div class="bg-gradient-to-br from-circular-bg-secondary to-circular-bg-secondary/95 border border-gray-700 rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-400">Liquid Balance</h3>
              <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="text-green-400">
                  <path d="M17 6V4a2 2 0 00-2-2H9a2 2 0 00-2 2v2H3v14a2 2 0 002 2h14a2 2 0 002-2V6h-4zM9 4h6v2H9V4zm8 16H7V8h10v12z"/>
                </svg>
              </div>
            </div>
            <div class="text-2xl font-bold text-white">{{ displayCirxBalance }}</div>
            <div class="text-sm text-gray-400">Available immediately</div>
          </div>
        </div>

        <!-- Transaction List -->
        <div class="bg-gradient-to-br from-circular-bg-secondary to-circular-bg-secondary/95 border border-gray-700 rounded-xl overflow-hidden">
          <div class="p-6 border-b border-gray-700">
            <h2 class="text-xl font-semibold text-white">Recent Transactions</h2>
          </div>
          
          <div v-if="mockTransactions.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" class="text-gray-400">
                <path d="M9 11H7v8h2v-8zm4 0h-2v8h2v-8zm4 0h-2v8h2v-8zm2-7v2H3V4h4V2h6v2h4zm-6 0V2H9v2h6z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-300 mb-2">No transactions yet</h3>
            <p class="text-gray-400 mb-4">Your CIRX purchases will appear here</p>
            <NuxtLink to="/swap" class="inline-flex items-center px-4 py-2 bg-circular-primary text-gray-900 rounded-lg font-medium hover:bg-circular-primary-hover transition-colors">
              Make your first purchase
            </NuxtLink>
          </div>

          <div v-else class="divide-y divide-gray-700">
            <div
              v-for="tx in mockTransactions"
              :key="tx.id"
              class="p-6 hover:bg-gray-800/50 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- Transaction Type Icon -->
                  <div :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    tx.type === 'liquid' ? 'bg-green-500/20' : 'bg-purple-500/20'
                  ]">
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      :class="tx.type === 'liquid' ? 'text-green-400' : 'text-purple-400'"
                    >
                      <path v-if="tx.type === 'liquid'" d="M17 6V4a2 2 0 00-2-2H9a2 2 0 00-2 2v2H3v14a2 2 0 002 2h14a2 2 0 002-2V6h-4z"/>
                      <path v-else d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  
                  <!-- Transaction Details -->
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-medium text-white">
                        {{ tx.type === 'liquid' ? 'Liquid Purchase' : 'OTC Purchase' }}
                      </span>
                      <span :class="[
                        'px-2 py-1 text-xs rounded-full font-medium',
                        tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      ]">
                        {{ tx.status }}
                      </span>
                    </div>
                    <div class="text-sm text-gray-400">
                      {{ tx.date }} • {{ tx.inputAmount }} {{ tx.inputToken }} → {{ tx.cirxAmount }} CIRX
                      <span v-if="tx.discount > 0" class="text-purple-400 ml-2">
                        ({{ tx.discount }}% discount)
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Transaction Hash -->
                <div class="flex items-center gap-2">
                  <a
                    :href="`https://etherscan.io/tx/${tx.hash}`"
                    target="_blank"
                    class="text-gray-400 hover:text-white transition-colors"
                    title="View on Etherscan"
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                      <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Vesting Positions (if any OTC purchases exist) -->
        <div v-if="mockVestingPositions.length > 0" class="bg-gradient-to-br from-circular-bg-secondary to-circular-bg-secondary/95 border border-gray-700 rounded-xl overflow-hidden">
          <div class="p-6 border-b border-gray-700">
            <h2 class="text-xl font-semibold text-white">Vesting Positions</h2>
          </div>
          
          <div class="divide-y divide-gray-700">
            <div
              v-for="position in mockVestingPositions"
              :key="position.id"
              class="p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <div>
                  <div class="font-medium text-white mb-1">{{ position.totalAmount }} CIRX</div>
                  <div class="text-sm text-gray-400">Started {{ position.startDate }}</div>
                </div>
                <button
                  v-if="parseFloat(position.claimableAmount) > 0"
                  @click="claimTokens(position.id)"
                  class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  :disabled="claimingPositions.includes(position.id)"
                >
                  <span v-if="claimingPositions.includes(position.id)">Claiming...</span>
                  <span v-else>Claim {{ position.claimableAmount }} CIRX</span>
                </button>
              </div>
              
              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{{ position.progressPercent }}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                  <div
                    class="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: position.progressPercent + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div class="text-gray-400">Total</div>
                  <div class="text-white font-medium">{{ position.totalAmount }} CIRX</div>
                </div>
                <div>
                  <div class="text-gray-400">Claimed</div>
                  <div class="text-white font-medium">{{ position.claimedAmount }} CIRX</div>
                </div>
                <div>
                  <div class="text-gray-400">Claimable</div>
                  <div class="text-purple-400 font-medium">{{ position.claimableAmount }} CIRX</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Transaction History - Circular CIRX',
  layout: 'default'
})

// Multi-Wallet connection
const { 
  isConnected, 
  getTokenBalance
} = useMultiWallet()

// Mock data for transaction history (replace with real data when contracts are connected)
const mockStats = ref({
  totalPurchases: '5 purchases',
  totalUsdValue: '$12,500 USD spent',
  vestingBalance: '8,750 CIRX',
  claimableAmount: '1,250 CIRX'
})

const mockTransactions = ref([
  {
    id: 1,
    type: 'otc',
    status: 'completed',
    date: '2024-01-15',
    inputAmount: '2.5',
    inputToken: 'ETH',
    cirxAmount: '7,000',
    discount: 8,
    hash: '0x742d35Cc6575f8D2D42b8E6A5B1F9A9A5F5F9C5C'
  },
  {
    id: 2,
    type: 'liquid',
    status: 'completed',
    date: '2024-01-10',
    inputAmount: '1000',
    inputToken: 'USDC',
    cirxAmount: '1,000',
    discount: 0,
    hash: '0x123d35Cc6575f8D2D42b8E6A5B1F9A9A5F5F9ABC'
  }
])

const mockVestingPositions = ref([
  {
    id: 1,
    totalAmount: '7,000',
    claimedAmount: '2,333',
    claimableAmount: '1,250',
    startDate: '2024-01-15',
    progressPercent: 55
  }
])

const displayCirxBalance = computed(() => {
  return isConnected.value ? getTokenBalance('CIRX') : '1,000'
})

// Claiming state
const claimingPositions = ref([])

const claimTokens = async (positionId) => {
  if (claimingPositions.value.includes(positionId)) return
  
  try {
    claimingPositions.value.push(positionId)
    
    // Execute claim (mock for now)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update the position (in real app, this would be fetched from contract)
    const position = mockVestingPositions.value.find(p => p.id === positionId)
    if (position) {
      const claimAmount = parseFloat(position.claimableAmount.replace(',', ''))
      position.claimedAmount = (parseFloat(position.claimedAmount.replace(',', '')) + claimAmount).toLocaleString()
      position.claimableAmount = '0'
    }
    
    alert(`Successfully claimed ${position?.claimableAmount || '0'} CIRX tokens!`)
  } catch (error) {
    console.error('Failed to claim tokens:', error)
    alert(`Failed to claim tokens: ${error.message}`)
  } finally {
    claimingPositions.value = claimingPositions.value.filter(id => id !== positionId)
  }
}

// Head configuration
useHead({
  title: 'Transaction History - Circular CIRX OTC Platform',
  meta: [
    { 
      name: 'description', 
      content: 'View your CIRX token purchase history and manage vesting positions.' 
    }
  ]
})
</script>