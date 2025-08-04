/**
 * Wallet initialization plugin
 * Automatically initializes the wallet store on client-side app startup
 * Handles auto-reconnection and sets up global error handling
 */
export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (process.server) return

  // Wait for DOM to be ready
  await new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve)
    } else {
      resolve()
    }
  })

  try {
    const { $pinia } = useNuxtApp()
    const walletStore = useWalletStore($pinia)

    // Initialize wallet store with proper error handling
    try {
      await walletStore.initialize()
      console.log('✅ Wallet store initialized successfully')
    } catch (initError) {
      console.warn('⚠️ Wallet store initialization failed, continuing without auto-reconnect:', initError)
      // Don't throw - allow app to continue without wallet functionality
    }

    // Enhanced error handler for wallet-related errors
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason
      const errorMessage = error?.message || String(error)
      
      // Check for wallet-related errors
      if (errorMessage.includes('wallet') || 
          errorMessage.includes('Web3') ||
          errorMessage.includes('connection') ||
          errorMessage.includes('metamask') ||
          errorMessage.includes('ethereum')) {
        
        console.error('🔒 Wallet error caught and handled:', error)
        
        // Prevent the error from causing critical error dialog
        event.preventDefault()
        
        // Clear any wallet state that might be causing issues
        try {
          walletStore.clearError()
        } catch (clearError) {
          console.warn('Failed to clear wallet error:', clearError)
        }
      }
    })

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      try {
        walletStore.cleanup()
      } catch (cleanupError) {
        console.warn('Wallet cleanup failed:', cleanupError)
      }
    })

  } catch (error) {
    console.error('❌ Critical failure in wallet initialization plugin:', error)
    // Don't rethrow - prevent this from breaking the entire app
  }
})