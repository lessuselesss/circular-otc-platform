import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { mainnet, arbitrum, sepolia, base, solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'

// Project ID from Reown Cloud
export const projectId = '2585d3b6fd8a214ece0e26b344957169'

// Supported networks - including both EVM and Solana chains
export const networks = [
  mainnet,
  base,
  arbitrum,
  sepolia, // For testing
  solana,
  solanaTestnet,
  solanaDevnet
]

// Application metadata
export const metadata = {
  name: 'Circular CIRX OTC Platform',
  description: 'Professional OTC trading platform for CIRX tokens with instant delivery and discounted vesting options.',
  url: 'https://circular.io', // Must match your domain
  icons: ['https://circular.io/circular-logo.svg']
}

// Initialize Wagmi Adapter for EVM chains
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false // Disabled for client-side only rendering
})

// Initialize Solana Adapter
export const solanaAdapter = new SolanaAdapter({
  projectId
})

// Export Wagmi config for use in plugins
export const wagmiConfig = wagmiAdapter.wagmiConfig