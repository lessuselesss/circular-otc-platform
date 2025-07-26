import { http, createConfig } from '@wagmi/vue'
import { mainnet, sepolia, base, arbitrum } from '@wagmi/vue/chains'
import { injected, metaMask, walletConnect, coinbaseWallet } from '@wagmi/vue/connectors'

// Create Wagmi config factory function
export const createWagmiConfig = (runtimeConfig?: any) => {
  // Use provided config or fallback to environment variables
  const projectId = runtimeConfig?.public?.walletConnectProjectId || 
                   process.env.WALLETCONNECT_PROJECT_ID || 
                   'your-project-id-here'

  const metadata = {
    name: runtimeConfig?.public?.appName || 'Circular CIRX OTC Platform',
    description: runtimeConfig?.public?.appDescription || 'Circular CIRX OTC Trading Platform - Buy CIRX tokens with instant delivery or OTC discounts up to 12%',
    url: runtimeConfig?.public?.appUrl || 'https://circular.io',
    icons: [`${runtimeConfig?.public?.appUrl || 'https://circular.io'}/favicon.ico`]
  }

  return createConfig({
    chains: [mainnet, sepolia, base, arbitrum],
    connectors: [
      // Injected wallets (MetaMask, etc.)
      injected(),
      
      // MetaMask specifically
      metaMask(),
      
      // WalletConnect
      walletConnect({ 
        projectId,
        metadata,
        showQrModal: true 
      }),
      
      // Coinbase Wallet
      coinbaseWallet({
        appName: metadata.name,
        appLogoUrl: metadata.icons[0]
      })
    ],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [base.id]: http(),
      [arbitrum.id]: http(),
    },
  })
}

// Default config for environments without runtime config
export const config = createWagmiConfig()

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}