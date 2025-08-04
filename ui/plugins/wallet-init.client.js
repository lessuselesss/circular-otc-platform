/**
 * Wallet initialization plugin
 * Automatically initializes the wallet store on client-side app startup
 * Handles auto-reconnection and sets up global error handling
 */
export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (process.server) return

  const { $pinia } = useNuxtApp()
  const walletStore = useWalletStore($pinia)

  try {
    // Initialize wallet store and attempt auto-reconnection
    await walletStore.initialize()

    // Global error handler for unhandled wallet errors
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('wallet') || 
          event.reason?.message?.includes('Web3') ||
          event.reason?.message?.includes('connection')) {
        console.error('Unhandled wallet error:', event.reason)
        // Optionally show user-friendly error notification here
      }
    })

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      walletStore.cleanup()
    })

  } catch (error) {
    console.error('Failed to initialize wallet store:', error)
  }
})