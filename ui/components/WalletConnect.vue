<template>
  <div class="wallet-connect-wrapper">
    <!-- Connected State - Simplified View -->
    <div v-if="isAnyWalletConnected" class="flex items-center gap-3">
      <!-- Network/Chain Indicator -->
      <div class="flex items-center gap-2">
        <div 
          :class="[
            'circular-network-indicator',
            !isOnCorrectNetwork ? 'error' : ''
          ]"
        ></div>
        <span class="text-sm" style="color: var(--circular-text-secondary);">
          {{ currentNetworkName }}
        </span>
      </div>

      <!-- Balance Display -->
      <div class="text-sm" style="color: var(--circular-text-secondary);">
        {{ currentBalance }} {{ currentCurrency }}
      </div>

      <!-- Account Display -->
      <div class="circular-wallet-connected flex items-center gap-2 px-3 py-2">
        <div class="w-6 h-6 rounded-full" :style="connectedWalletGradient"></div>
        <span class="font-mono text-sm" style="color: var(--circular-text-primary);">
          {{ currentFormattedAddress }}
        </span>
        <button 
          @click="copyCurrentAddress"
          class="transition-colors"
          style="color: var(--circular-text-secondary);"
          title="Copy address"
        >
          <Icon 
            :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" 
            class="w-4 h-4" 
            :style="copied ? 'color: var(--circular-primary);' : ''"
          />
        </button>
      </div>

      <!-- Disconnect Button -->
      <button
        @click="disconnectCurrentWallet"
        class="text-sm transition-colors"
        style="color: var(--circular-error);"
        title="Disconnect wallet"
      >
        <Icon name="heroicons:power" class="w-4 h-4" />
      </button>

      <!-- Wallet Type Badge -->
      <div class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
        {{ activeWalletType }}
      </div>
    </div>

    <!-- Disconnected State - Show Wallet Connector -->
    <div v-else>
      <WalletConnector ref="walletConnectorRef" />
    </div>

    <!-- Network Switch Button -->
    <button
      v-if="isAnyWalletConnected && !isOnCorrectNetwork"
      @click="switchToCorrectNetwork"
      class="circular-btn px-3 py-1 text-sm ml-3"
      style="background: var(--circular-warning); font-size: 0.75rem;"
    >
      Switch Network
    </button>
  </div>

  <!-- Error Message -->
  <div v-if="error" class="circular-error mt-2 p-2">
    <p class="text-sm">{{ error }}</p>
  </div>
</template>

<script setup>
import { useAccount, useBalance, useChainId } from '@wagmi/vue'
import { useSolanaWallet } from '~/config/solana'

// Ethereum wallet state (Wagmi)
const { address: ethereumAccount, isConnected: ethereumConnected } = useAccount()
const { data: ethereumBalanceData } = useBalance({ address: ethereumAccount })
const ethereumChainId = useChainId()

// Solana wallet state
const {
  isConnected: solanaConnected,
  publicKey: solanaPublicKey,
  balance: solanaBalance,
  error: solanaError,
  networkInfo: solanaNetworkInfo,
  disconnectPhantom,
  formatSolanaAddress
} = useSolanaWallet()

// Legacy wallet state (for backward compatibility)
const {
  isConnected: legacyConnected,
  account: legacyAccount,
  chainId: legacyChainId,
  balance: legacyBalance,
  error: legacyError,
  isCorrectNetwork: legacyIsCorrectNetwork,
  disconnect: legacyDisconnect,
  switchNetwork: legacySwitch,
  formatAddress: legacyFormat
} = useWallet()

// Component state
const walletConnectorRef = ref(null)
const copied = ref(false)

// Computed properties
const isAnyWalletConnected = computed(() => {
  return ethereumConnected.value || solanaConnected.value || legacyConnected.value
})

const activeWalletType = computed(() => {
  if (ethereumConnected.value) return 'Ethereum'
  if (solanaConnected.value) return 'Solana'
  if (legacyConnected.value) return 'Legacy'
  return 'None'
})

const currentFormattedAddress = computed(() => {
  if (ethereumConnected.value && ethereumAccount.value) {
    return formatAddress(ethereumAccount.value)
  }
  if (solanaConnected.value && solanaPublicKey.value) {
    return formatSolanaAddress(solanaPublicKey.value)
  }
  if (legacyConnected.value && legacyAccount.value) {
    return legacyFormat(legacyAccount.value)
  }
  return ''
})

const currentBalance = computed(() => {
  if (ethereumConnected.value && ethereumBalanceData.value) {
    return parseFloat(formatEther(ethereumBalanceData.value.value)).toFixed(4)
  }
  if (solanaConnected.value && solanaBalance.value) {
    return solanaBalance.value.toFixed(4)
  }
  if (legacyConnected.value && legacyBalance.value) {
    return legacyBalance.value
  }
  return '0'
})

const currentCurrency = computed(() => {
  if (ethereumConnected.value || legacyConnected.value) return 'ETH'
  if (solanaConnected.value) return 'SOL'
  return 'ETH'
})

const currentNetworkName = computed(() => {
  if (ethereumConnected.value) {
    return getNetworkName(ethereumChainId.value)
  }
  if (solanaConnected.value) {
    return solanaNetworkInfo.value?.name || 'Solana'
  }
  if (legacyConnected.value) {
    return getNetworkName(legacyChainId.value)
  }
  return 'Unknown'
})

const isOnCorrectNetwork = computed(() => {
  if (ethereumConnected.value) {
    const supportedChains = [1, 11155111, 8453, 42161] // Mainnet, Sepolia, Base, Arbitrum
    return supportedChains.includes(ethereumChainId.value)
  }
  if (solanaConnected.value) {
    return true // Solana networks are generally acceptable
  }
  if (legacyConnected.value) {
    return legacyIsCorrectNetwork.value
  }
  return false
})

const connectedWalletGradient = computed(() => {
  if (ethereumConnected.value) {
    return 'background: linear-gradient(135deg, #627EEA, #1F8BF4);' // Ethereum colors
  }
  if (solanaConnected.value) {
    return 'background: linear-gradient(135deg, #9945FF, #14F195);' // Solana colors
  }
  return 'background: linear-gradient(135deg, var(--circular-primary), var(--circular-purple));'
})

const error = computed(() => {
  return solanaError.value || legacyError.value
})

// Methods
const copyCurrentAddress = async () => {
  let address = ''
  
  if (ethereumConnected.value && ethereumAccount.value) {
    address = ethereumAccount.value
  } else if (solanaConnected.value && solanaPublicKey.value) {
    address = solanaPublicKey.value.toString()
  } else if (legacyConnected.value && legacyAccount.value) {
    address = legacyAccount.value
  }
  
  if (!address) return
  
  try {
    await navigator.clipboard.writeText(address)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy address:', err)
  }
}

const disconnectCurrentWallet = async () => {
  try {
    if (ethereumConnected.value) {
      // Wagmi disconnect will be handled by the WalletConnector
      await walletConnectorRef.value?.disconnectEthereum?.()
    }
    if (solanaConnected.value) {
      await disconnectPhantom()
    }
    if (legacyConnected.value) {
      await legacyDisconnect()
    }
  } catch (err) {
    console.error('Failed to disconnect wallet:', err)
  }
}

const switchToCorrectNetwork = async () => {
  try {
    if (ethereumConnected.value || legacyConnected.value) {
      await switchToMainnet()
    }
    // Solana network switching would be handled differently
  } catch (err) {
    console.error('Failed to switch network:', err)
  }
}

const switchToMainnet = async () => {
  try {
    if (legacyConnected.value) {
      await legacySwitch(1) // Mainnet
    } else {
      // Use direct ethereum request for Wagmi
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Mainnet
      })
    }
  } catch (err) {
    console.error('Failed to switch network:', err)
  }
}

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    8453: 'Base',
    42161: 'Arbitrum One',
    5: 'Goerli' // Legacy support
  }
  return networks[chainId] || `Chain ${chainId}`
}

// Helper function for formatting ether (simplified)
const formatEther = (value) => {
  return (Number(value) / 1e18).toString()
}

// Expose state for parent components (maintaining backward compatibility)
defineExpose({
  // Legacy compatibility
  isConnected: isAnyWalletConnected,
  account: computed(() => {
    if (ethereumConnected.value) return ethereumAccount.value
    if (solanaConnected.value) return solanaPublicKey.value?.toString()
    if (legacyConnected.value) return legacyAccount.value
    return null
  }),
  
  // Enhanced state
  ethereumConnected,
  ethereumAccount,
  solanaConnected,
  solanaPublicKey,
  activeWalletType,
  
  // Manual address from wallet connector
  manualAddress: computed(() => walletConnectorRef.value?.manualAddress || '')
})
</script>