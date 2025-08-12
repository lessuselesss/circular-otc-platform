<template>
  <!-- Simple Wallet Connection Button -->
  <button
    @click="handleClick"
    :class="[
      'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 border relative gradient-border',
      isConnected 
        ? 'border-gray-600/30 hover:border-gray-400/60 text-white shadow-lg' 
        : 'border-transparent text-black shadow-lg hover:shadow-xl',
      isConnecting ? 'cursor-wait opacity-75' : 'cursor-pointer'
    ]"
    :style="!isConnected ? 'background-color: #09BE8BCC;' : 'background-color: #1B2E33;'"
    :disabled="isConnecting"
  >
    <!-- Connection Status Indicator -->
    <div v-if="isConnected" class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
    
    <!-- Loading Spinner -->
    <div v-if="isConnecting" class="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
    
    <!-- Wallet Icon -->
    <div v-else-if="isConnected" class="w-5 h-5">
      <img v-if="walletIcon" :src="walletIcon" :alt="walletName" class="w-full h-full rounded-sm" @error="$event.target.style.display='none'" />
      <svg v-else viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>
    </div>
    
    <!-- Default Connect Icon -->
    <div v-else class="w-5 h-5">
      <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>
    </div>

    <!-- Button Text -->
    <span class="text-sm font-semibold">
      {{ buttonText }}
    </span>
  </button>
</template>

<script setup>
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/vue'
import { useAccount, useBalance } from '@wagmi/vue'
import { computed, ref, watch } from 'vue'

// AppKit hooks
const { open } = useAppKit()
const appKitAccount = useAppKitAccount()
const appKitNetwork = useAppKitNetwork()
const { address, isConnected, isConnecting, connector } = useAccount()
const { data: balance, isLoading: isBalanceLoading } = useBalance({ address })

// Computed properties
const walletName = computed(() => {
  if (!connector.value) return 'Unknown'
  const name = connector.value.name
  return name === 'MetaMask' ? 'MetaMask' : 
         name === 'Coinbase Wallet' ? 'Coinbase' :
         name === 'WalletConnect' ? 'WalletConnect' : name
})

const walletIcon = computed(() => {
  // Try to get icon from AppKit account data first
  if (appKitAccount.value?.connector?.icon) {
    return appKitAccount.value.connector.icon
  }
  
  // Try to get icon from Wagmi connector
  if (connector.value?.icon) {
    return connector.value.icon
  }
  
  // Fallback to common wallet icons from CDN
  const name = walletName.value.toLowerCase()
  const iconMap = {
    'metamask': 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
    'coinbase': 'https://avatars.githubusercontent.com/u/18060234?s=280&v=4',
    'walletconnect': 'https://avatars.githubusercontent.com/u/37784886?s=280&v=4',
    'phantom': 'https://avatars.githubusercontent.com/u/78782331?s=280&v=4'
  }
  
  return iconMap[name] || null
})

const buttonText = computed(() => {
  if (isConnecting.value) return 'Connecting...'
  if (isConnected.value) {
    const addr = address.value
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Connected'
  }
  return 'Connect Wallet'
})

// Methods
const handleClick = () => {
  try {
    open()
  } catch (error) {
    console.error('Failed to open AppKit modal:', error)
  }
}

// isConnecting is now properly managed by Wagmi hooks
</script>