// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Configure for static generation
  nitro: {
    preset: 'static'
  },
  
  // Disable SSR for Web3 compatibility
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
    // '@nuxt/ui' // Temporarily disabled - causing build issues
  ],

  // CSS configuration
  css: ['~/assets/css/main.css'],

  // App configuration
  app: {
    head: {
      title: 'Circular CIRX OTC Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Circular CIRX OTC Trading Platform - Buy CIRX tokens with instant delivery or OTC discounts up to 12%' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Runtime configuration for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    // Public keys (exposed to client-side)
    public: {
      walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || 'your-project-id-here',
      appName: 'Circular CIRX OTC Platform',
      appDescription: 'Circular CIRX OTC Trading Platform - Buy CIRX tokens with instant delivery or OTC discounts up to 12%',
      appUrl: process.env.APP_URL || 'https://circular.io',
    }
  },

})
