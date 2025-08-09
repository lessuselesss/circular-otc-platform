import { createAppKit } from '@reown/appkit/vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { projectId, networks, metadata, wagmiAdapter, solanaAdapter } from '~/config/appkit.js'

export default defineNuxtPlugin(() => {
  try {
    console.log('⚙️ Initializing Reown AppKit plugin...')
    console.log('Project ID:', projectId)
    console.log('Networks:', networks.length, 'networks configured')
    
    // Create the AppKit instance with multi-chain support
    createAppKit({
      adapters: [wagmiAdapter, solanaAdapter],
      networks,
      projectId,
      metadata,
      features: {
        analytics: true, // Enable analytics
        email: true, // Enable email login
        socials: ['google', 'x', 'discord'], // Enable social logins
        emailShowWallets: true // Show wallets even when email is enabled
      }
    })
    
    console.log('✅ Reown AppKit plugin initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize Reown AppKit plugin:', error)
    throw error
  }
})