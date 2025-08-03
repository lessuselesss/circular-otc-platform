import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { config } from '~/wagmi.config'

export default defineNuxtPlugin((nuxtApp) => {
  // Configure Vue Query for Wagmi
  nuxtApp.vueApp.use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
        },
      },
    },
  })

  // Configure Wagmi
  nuxtApp.vueApp.use(WagmiPlugin, { config })
})