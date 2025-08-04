import { defineNuxtPlugin } from '#app'
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, base, arbitrum } from 'wagmi/chains'
import { walletConnect, metaMask, coinbaseWallet, injected } from 'wagmi/connectors'
import { WagmiPlugin } from '@wagmi/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  const projectId = runtimeConfig.public.walletConnectProjectId

  if (!projectId || projectId === 'your-project-id-here') {
    console.warn('⚠️ WalletConnect Project ID not configured in nuxt.config.ts. Please set WALLETCONNECT_PROJECT_ID environment variable.')
  }

  const config = createConfig({
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

  nuxtApp.vueApp.use(WagmiPlugin, { config })
})
