import { createAppKit } from '@reown/appkit/vue'
import { defineNuxtPlugin } from 'nuxt/app'
import { wagmiAdapter, solanaAdapter, networks, projectId, metadata } from '~/config/appkit.js'

// Debug logging for adapter state
console.log('🔧 Adapters imported:', {
  wagmiNetworks: networks.filter(n => n.id && typeof n.id === 'string' && !n.id.includes('solana')).length,
  solanaNetworks: networks.filter(n => n.id && typeof n.id === 'string' && n.id.includes('solana')).length
})

// Store adapters globally for debugging
if (typeof window !== 'undefined') {
  window.__wagmiAdapter = wagmiAdapter
  window.__solanaAdapter = solanaAdapter
}

export default defineNuxtPlugin(() => {
  // Only run on client-side
  if (typeof window === 'undefined') {
    console.log('⚠️ AppKit plugin skipped - running on server')
    return
  }

  try {
    console.log('⚙️ Initializing Reown AppKit plugin...')
    console.log('Project ID:', projectId)
    console.log('Networks configured:', networks.length)
    console.log('Environment:', process.env.NODE_ENV)
    
    // Create the AppKit instance with Cloudflare-friendly configuration
    const appKit = createAppKit({
      adapters: [wagmiAdapter, solanaAdapter],
      networks,
      projectId,
      metadata: {
        ...metadata,
        // Ensure absolute URLs for Cloudflare
        url: typeof window !== 'undefined' ? window.location.origin : metadata.url,
        icons: metadata.icons.map(icon => 
          icon.startsWith('http') ? icon : `${typeof window !== 'undefined' ? window.location.origin : ''}${icon}`
        )
      },
      features: {
        analytics: false,
        email: false,
        socials: [],
        onramp: false,
        swaps: false,
        allWallets: true // Explicitly enable all wallets to fix missing icon
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#00D4FF'
      },
      // Prevent auto-connection attempts
      autoConnect: false,
      defaultChain: 'ethereum',
      // Add error boundary configuration
      enableAnalytics: false,
      enableOnramp: false,
      // Cloudflare-specific settings
      includeWalletIds: undefined, // Let it auto-detect
      excludeWalletIds: undefined,
      enableWalletFeatures: true
    })
    
    // Make AppKit instance globally accessible
    if (typeof window !== 'undefined') {
      window.$appKit = appKit
      
      // Listen for custom events from components
      window.addEventListener('openWalletModal', () => {
        appKit.open()
      })
      
      // Add disconnect functionality
      window.$disconnect = async () => {
        try {
          await appKit.disconnect()
          // Also clear any cached connections
          localStorage.removeItem('wagmi.wallet')
          localStorage.removeItem('wagmi.store')
          window.location.reload()
          console.log('✅ Wallet disconnected and page refreshed')
        } catch (error) {
          console.error('❌ Error disconnecting wallet:', error)
          // Force disconnect by clearing storage and refreshing
          localStorage.clear()
          window.location.reload()
        }
      }
      
      // Debug AppKit state changes with error handling
      try {
        appKit.subscribeAccount((account) => {
          try {
            console.log('🔍 AppKit Account State:', {
              ...account,
              balanceSymbol: account.balanceSymbol,
              balance: account.balance,
              profileName: account.profileName
            })
            
            // Store AppKit account state for debugging
            window.__appKitAccountState = account
            
            // Force balance refresh when account changes
            if (account.isConnected && account.address) {
              console.log('🔄 Account connected, forcing balance refresh...')
              // Give it a moment then force balance refresh
              setTimeout(() => {
                try {
                  // Trigger a balance refresh by emitting a custom event
                  window.dispatchEvent(new CustomEvent('forceBalanceRefresh', {
                    detail: { address: account.address, chainId: account.chainId }
                  }))
                } catch (error) {
                  console.warn('⚠️ Error triggering balance refresh:', error)
                }
              }, 1000)
            }
            
            // If AppKit thinks we're disconnected but Wagmi shows connected, log warning
            try {
              const wagmiStore = localStorage.getItem('wagmi.store')
              if (wagmiStore && !account.isConnected && window.ethereum?.selectedAddress) {
                console.warn('⚠️ State mismatch detected: Wagmi connected but AppKit disconnected')
                console.warn('Wagmi storage:', wagmiStore)
                console.warn('Selected address:', window.ethereum?.selectedAddress)
              }
            } catch (error) {
              console.warn('⚠️ Error checking state mismatch:', error)
            }
          } catch (error) {
            console.error('❌ Error in AppKit account subscription:', error)
          }
        })
      } catch (error) {
        console.error('❌ Error setting up AppKit account subscription:', error)
      }
      
      try {
        appKit.subscribeNetwork((network) => {
          try {
            console.log('🔍 AppKit Network State:', network)
          } catch (error) {
            console.error('❌ Error in AppKit network subscription:', error)
          }
        })
      } catch (error) {
        console.error('❌ Error setting up AppKit network subscription:', error)
      }
      
      // Force sync AppKit with any existing Wagmi connection (with error handling)
      setTimeout(() => {
        try {
          const account = wagmiAdapter.wagmiConfig.getAccount()
          console.log('🔄 Checking for existing Wagmi connection:', account)
          
          if (account.isConnected && account.address) {
            console.log('🔧 Wagmi is connected, forcing AppKit to recognize this connection')
            
            try {
              // Force trigger AppKit's internal state update by simulating adapter events
              const connectEvent = new CustomEvent('wagmi:accountChanged', {
                detail: {
                  account: account.address,
                  chainId: account.chainId,
                  isConnected: true
                }
              })
              
              // Dispatch to both window and appKit if it has event handling
              window.dispatchEvent(connectEvent)
              
              // Also try to trigger AppKit's account subscription manually
              setTimeout(() => {
                try {
                  console.log('🔄 Second sync attempt - checking AppKit state...')
                  if (window.__appKitAccountState) {
                    console.log('Current AppKit state:', window.__appKitAccountState)
                    if (!window.__appKitAccountState.isConnected) {
                      console.warn('❌ AppKit still not synced after manual trigger')
                    } else {
                      console.log('✅ AppKit is now synced!')
                    }
                  }
                } catch (error) {
                  console.error('❌ Error in second sync attempt:', error)
                }
              }, 2000)
            } catch (error) {
              console.error('❌ Error triggering AppKit sync events:', error)
            }
          } else {
            console.log('ℹ️ No existing Wagmi connection to sync')
          }
        } catch (error) {
          console.error('❌ Error during AppKit sync:', error)
        }
      }, 1000) // Give time for initial setup
    }
    
    console.log('✅ Reown AppKit plugin initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize Reown AppKit plugin:', error)
    console.error('Error details:', error)
  }
})