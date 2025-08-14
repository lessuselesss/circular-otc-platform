export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  // Global error handler for Reown AppKit and other unhandled errors
  const originalConsoleError = console.error
  const originalWindowError = window.onerror
  const originalUnhandledRejection = window.onunhandledrejection

  // Filter out known Reown AppKit errors that cause toast spam
  const suppressedErrors = [
    'Application Error',
    'An unexpected error occurred',
    'ChunkLoadError',
    'Loading chunk',
    'Failed to fetch dynamically imported module',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'wallet_requestPermissions',
    'User rejected the request'
  ]

  const shouldSuppressError = (message) => {
    if (!message || typeof message !== 'string') return false
    return suppressedErrors.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  // Override console.error to filter AppKit spam
  console.error = (...args) => {
    const message = args.join(' ')
    
    // Log Reown/AppKit errors in a different way
    if (message.includes('AppKit') || message.includes('Reown') || message.includes('w3m-')) {
      console.warn('🔧 AppKit Debug:', ...args)
      return
    }
    
    // Suppress common non-critical errors that spam toasts
    if (shouldSuppressError(message)) {
      console.warn('🔇 Suppressed error:', ...args)
      return
    }

    // Allow other errors through
    originalConsoleError.apply(console, args)
  }

  // Handle window.onerror
  window.onerror = (message, source, lineno, colno, error) => {
    if (shouldSuppressError(message)) {
      console.warn('🔇 Suppressed window error:', message)
      return true // Prevent default handling
    }
    
    // Call original handler if it exists
    if (originalWindowError) {
      return originalWindowError(message, source, lineno, colno, error)
    }
    return false
  }

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event) => {
    const message = event.reason?.message || event.reason?.toString() || 'Unknown error'
    
    if (shouldSuppressError(message)) {
      console.warn('🔇 Suppressed unhandled rejection:', event.reason)
      event.preventDefault() // Prevent default handling
      return
    }
    
    // Call original handler if it exists
    if (originalUnhandledRejection) {
      return originalUnhandledRejection(event)
    }
  }

  // Add a global method to restore original error handling if needed
  window.__restoreErrorHandlers = () => {
    console.error = originalConsoleError
    window.onerror = originalWindowError
    window.onunhandledrejection = originalUnhandledRejection
    console.log('✅ Original error handlers restored')
  }

  console.log('🔇 Error suppression plugin loaded - filtering AppKit/Reown noise')
})