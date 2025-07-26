import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { createWagmiConfig } from '~/config/wagmi'

export default defineNuxtPlugin((nuxtApp) => {
  // Get runtime config
  const runtimeConfig = useRuntimeConfig()
  
  // Create Wagmi config with runtime config
  const config = createWagmiConfig(runtimeConfig)

  // Setup Vue Query
  nuxtApp.vueApp.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          // Stale time for blockchain queries
          staleTime: 30_000, // 30 seconds
          // Cache time for wallet data
          gcTime: 5 * 60 * 1000, // 5 minutes
        },
      },
    },
  })

  // Setup Wagmi
  nuxtApp.vueApp.use(WagmiPlugin, { config })
})