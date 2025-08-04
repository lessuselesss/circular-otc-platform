import { createConfig, http } from '@wagmi/vue'
import { mainnet, sepolia, base, arbitrum } from '@wagmi/vue/chains'
import { walletConnect, metaMask, coinbaseWallet, injected } from '@wagmi/vue/connectors'

// WalletConnect project ID - get from https://cloud.walletconnect.com
const projectId = process.env.WALLETCONNECT_PROJECT_ID || 'your-project-id-here'

if (projectId === 'your-project-id-here') {
  console.warn('⚠️ WalletConnect Project ID not configured. Please set WALLETCONNECT_PROJECT_ID environment variable.')
}

export const config = createConfig({
  chains: [mainnet, sepolia, base, arbitrum],
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'Circular CIRX OTC Platform',
        description: 'Buy CIRX tokens with liquid delivery or OTC discounts',
        url: 'https://circular-otc.com',
        icons: ['https://circular-otc.com/circular-logo.svg'],
      },
      showQrModal: true,
    }),
    metaMask({
      dappMetadata: {
        name: 'Circular CIRX OTC Platform',
      },
    }),
    coinbaseWallet({
      appName: 'Circular CIRX OTC Platform',
      appLogoUrl: 'https://circular-otc.com/circular-logo.svg',
    }),
    injected(), // Fallback for other injected wallets
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: false,
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}