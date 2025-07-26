<template>
  <div class="flex flex-col gap-4">
    <!-- Wallet Type Selector -->
    <div class="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        @click="activeTab = 'ethereum'"
        :class="[
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          activeTab === 'ethereum'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        ]"
      >
        <Icon name="simple-icons:ethereum" class="w-4 h-4 inline mr-2" />
        Ethereum
      </button>
      <button
        @click="activeTab = 'solana'"
        :class="[
          'flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors',
          activeTab === 'solana'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        ]"
      >
        <Icon name="simple-icons:solana" class="w-4 h-4 inline mr-2" />
        Solana
      </button>
    </div>

    <!-- Ethereum Wallets -->
    <div v-if="activeTab === 'ethereum'" class="space-y-3">
      <!-- Connected State -->
      <div v-if="ethereumConnected" class="space-y-3">
        <div class="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ formatAddress(ethereumAccount) }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ ethereumBalance }} ETH on {{ getNetworkName(ethereumChainId) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="copyAddress(ethereumAccount)" class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-4 h-4" />
            </button>
            <button @click="disconnectEthereum" class="p-2 text-red-500 hover:text-red-700">
              <Icon name="heroicons:power" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Network Switch Warning -->
        <div v-if="!ethereumOnCorrectNetwork" class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p class="text-sm text-yellow-800 dark:text-yellow-200">Please switch to a supported network</p>
          <button @click="switchToMainnet" class="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">
            Switch Network
          </button>
        </div>
      </div>

      <!-- Connection Options -->
      <div v-else class="space-y-2">
        <button
          v-for="connector in availableConnectors"
          :key="connector.uid"
          @click="connectEthereum(connector)"
          :disabled="ethereumConnecting"
          class="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <div class="flex items-center gap-3">
            <Icon :name="getConnectorIcon(connector.name)" class="w-6 h-6" />
            <span class="font-medium">{{ connector.name }}</span>
          </div>
          <div v-if="ethereumConnecting" class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <Icon v-else name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>

    <!-- Solana Wallets -->
    <div v-if="activeTab === 'solana'" class="space-y-3">
      <!-- Connected State -->
      <div v-if="solanaConnected" class="space-y-3">
        <div class="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ formatSolanaAddress(solanaPublicKey) }}</p>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ solanaBalance }} SOL on {{ solanaNetworkInfo?.name }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="copyAddress(solanaPublicKey?.toString())" class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-4 h-4" />
            </button>
            <button @click="disconnectSolana" class="p-2 text-red-500 hover:text-red-700">
              <Icon name="heroicons:power" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Connection Options -->
      <div v-else class="space-y-2">
        <button
          @click="connectSolana"
          :disabled="solanaConnecting || !isPhantomInstalled"
          class="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <div class="flex items-center gap-3">
            <Icon name="simple-icons:phantom" class="w-6 h-6 text-purple-600" />
            <span class="font-medium">Phantom</span>
            <span v-if="!isPhantomInstalled" class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Not Installed</span>
          </div>
          <div v-if="solanaConnecting" class="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <Icon v-else name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
        </button>

        <!-- Install Phantom Link -->
        <a
          v-if="!isPhantomInstalled"
          href="https://phantom.app/"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex items-center justify-center p-3 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors"
        >
          <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4 mr-2" />
          Install Phantom Wallet
        </a>
      </div>
    </div>

    <!-- Manual Address Input -->
    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Or paste a wallet address (read-only)
      </label>
      <div class="flex gap-2">
        <input
          v-model="manualAddress"
          type="text"
          placeholder="0x... or wallet address"
          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          v-if="manualAddress"
          @click="clearManualAddress"
          class="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="ethereumError || solanaError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-800 dark:text-red-200">
        {{ ethereumError || solanaError }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useConnect, useAccount, useDisconnect, useBalance, useChainId } from '@wagmi/vue'
import { useSolanaWallet } from '~/config/solana'

// Ethereum wallet state
const { connectors: availableConnectors, connect: connectWagmi, isPending: ethereumConnecting, error: connectError } = useConnect()
const { address: ethereumAccount, isConnected: ethereumConnected, connector } = useAccount()
const { disconnect: disconnectWagmi } = useDisconnect()
const { data: balanceData } = useBalance({ address: ethereumAccount })
const chainId = useChainId()

// Solana wallet state  
const {
  isConnected: solanaConnected,
  publicKey: solanaPublicKey,
  balance: solanaBalance,
  connecting: solanaConnecting,
  error: solanaError,
  networkInfo: solanaNetworkInfo,
  isPhantomInstalled,
  connectPhantom,
  disconnectPhantom,
  formatSolanaAddress
} = useSolanaWallet()

// Component state
const activeTab = ref('ethereum')
const manualAddress = ref('')
const copied = ref(false)

// Computed
const ethereumBalance = computed(() => {
  if (!balanceData.value) return '0'
  return parseFloat(formatEther(balanceData.value.value)).toFixed(4)
})

const ethereumChainId = computed(() => chainId.value)
const ethereumError = computed(() => connectError.value?.message)

const ethereumOnCorrectNetwork = computed(() => {
  const supportedChains = [1, 11155111, 8453, 42161] // Mainnet, Sepolia, Base, Arbitrum
  return supportedChains.includes(ethereumChainId.value)
})

// Methods
const connectEthereum = async (connector) => {
  try {
    await connectWagmi({ connector })
  } catch (error) {
    console.error('Failed to connect Ethereum wallet:', error)
  }
}

const disconnectEthereum = async () => {
  try {
    await disconnectWagmi()
  } catch (error) {
    console.error('Failed to disconnect Ethereum wallet:', error)
  }
}

const connectSolana = async () => {
  await connectPhantom()
}

const disconnectSolana = async () => {
  await disconnectPhantom()
}

const copyAddress = async (address) => {
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

const clearManualAddress = () => {
  manualAddress.value = ''
}

const switchToMainnet = async () => {
  // This would trigger a network switch in the wallet
  // Implementation depends on the specific wallet connector
  try {
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }], // Mainnet
    })
  } catch (error) {
    console.error('Failed to switch network:', error)
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
    42161: 'Arbitrum One'
  }
  return networks[chainId] || `Chain ${chainId}`
}

const getConnectorIcon = (name) => {
  const icons = {
    'MetaMask': 'simple-icons:metamask',
    'WalletConnect': 'simple-icons:walletconnect',
    'Coinbase Wallet': 'simple-icons:coinbase',
    'Injected': 'heroicons:wallet'
  }
  return icons[name] || 'heroicons:wallet'
}

// Helper function for formatting ether (simplified)
const formatEther = (value) => {
  return (Number(value) / 1e18).toString()
}

// Expose state to parent components
defineExpose({
  // Ethereum
  ethereumConnected,
  ethereumAccount,
  ethereumChainId,
  ethereumBalance,
  
  // Solana
  solanaConnected,
  solanaPublicKey,
  solanaBalance,
  
  // Manual address
  manualAddress: readonly(manualAddress),
  
  // Active wallet type
  activeTab: readonly(activeTab)
})
</script>