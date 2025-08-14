import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Configure for static generation with Cloudflare optimizations
  nitro: {
    preset: 'static',
    // Add Cloudflare Pages compatibility
    experimental: {
      wasm: false
    },
    storage: {
      redis: false
    }
  },
  
  // Disable SSR for Web3 compatibility
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss', 
    '@pinia/nuxt',
    '@wagmi/vue/nuxt',
    // '@nuxt/ui' // Temporarily disabled - causing build issues
    'nuxt-icon',
    'unplugin-icons/nuxt',
    'floating-vue/nuxt'
  ],

  // Configure unplugin-icons
  icons: {
    // Enable auto-install of icon collections
    autoInstall: true
  },

  

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

  // Vue configuration for custom elements (AppKit web components)
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('w3m-') || tag.startsWith('wui-') || tag.startsWith('appkit-')
    }
  },

  // Runtime configuration for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    // Public keys (exposed to client-side)
    public: {
      walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID || '2585d3b6fd8a214ece0e26b344957169',
      reownProjectId: '2585d3b6fd8a214ece0e26b344957169',
      appName: 'Circular CIRX OTC Platform',
      appDescription: 'Circular CIRX OTC Trading Platform - Buy CIRX tokens with instant delivery or OTC discounts up to 12%',
      appUrl: process.env.APP_URL || 'https://circular.io',
    }
  },

  // Build configuration for Cloudflare Pages
  build: {
    transpile: ['@reown/appkit']
  },

  // Vite configuration for better Cloudflare compatibility
  vite: {
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      include: ['@reown/appkit', '@reown/appkit-adapter-wagmi', '@reown/appkit-adapter-solana']
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        external: [],
        output: {
          manualChunks: {
            'appkit': ['@reown/appkit'],
            'wagmi': ['@wagmi/vue', '@wagmi/core'],
            'vue': ['vue', '@vue/runtime-core']
          }
        }
      }
    }
  },

})
