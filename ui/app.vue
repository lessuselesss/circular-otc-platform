<template>
  <div class="min-h-screen">
    <!-- Main App Content -->
    <NuxtPage />
    
    <!-- Global Toast Notifications -->
    <ToastNotifications ref="toastManager" />
    
    <!-- Global Error Boundary -->
    <div v-if="globalError" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-xl border border-red-500/30 p-6 max-w-md w-full">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <div class="flex-1">
            <h3 class="text-red-300 font-semibold mb-2">Critical Error</h3>
            <p class="text-sm text-gray-300 mb-4">{{ globalError }}</p>
            <div class="flex gap-2">
              <button
                @click="handleGlobalErrorRetry"
                class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
              <button
                @click="handleGlobalErrorReload"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onErrorCaptured } from 'vue'

// Global error state
const globalError = ref(null)
const toastManager = ref(null)

// Global error handler
const handleGlobalError = (error, context = 'Unknown') => {
  console.error('Global error:', error, 'Context:', context)
  
  // For critical errors, show modal
  if (error.message?.includes('chunk') || error.message?.includes('Loading')) {
    globalError.value = 'Failed to load application resources. This may be due to a network issue or an update.'
  } else if (error.message?.includes('hydration')) {
    globalError.value = 'Application initialization failed. Please refresh the page.'
  } else {
    globalError.value = 'A critical error occurred. Please try refreshing the page.'
  }
}

// Global error recovery
const handleGlobalErrorRetry = () => {
  globalError.value = null
  // Additional retry logic could go here
}

const handleGlobalErrorReload = () => {
  window.location.reload()
}

// Vue error boundary
onErrorCaptured((error, instance, info) => {
  console.error('Vue error captured:', error, instance, info)
  
  // Determine if this is a critical error
  if (error.message?.includes('Cannot read properties') || 
      error.message?.includes('Cannot access before initialization')) {
    handleGlobalError(error, `Vue component: ${info}`)
    return false // Prevent error from propagating
  }
  
  // For non-critical errors, show toast notification
  if (toastManager.value) {
    toastManager.value.error('A component error occurred. Some features may not work correctly.', {
      title: 'Component Error',
      autoTimeoutMs: 8000,
      actions: [{
        label: 'Refresh Page',
        handler: () => window.location.reload(),
        primary: true
      }]
    })
  }
  
  return false
})

// Global unhandled error handlers
onMounted(() => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Prevent default error handling
    event.preventDefault()
    
    // Check if this is a critical error
    const error = event.reason
    if (error?.message?.includes('Loading chunk') || 
        error?.message?.includes('ChunkLoadError')) {
      handleGlobalError(error, 'Chunk loading')
    } else if (toastManager.value) {
      // Show as toast for less critical errors
      toastManager.value.error('An unexpected error occurred.', {
        title: 'Application Error',
        autoTimeoutMs: 6000
      })
    }
  })
  
  // Handle regular JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error)
    
    const error = event.error
    if (error?.message?.includes('Script error') || 
        error?.message?.includes('ResizeObserver')) {
      // Ignore these common but non-critical errors
      return
    }
    
    if (toastManager.value) {
      toastManager.value.error('A JavaScript error occurred.', {
        title: 'Script Error',
        autoTimeoutMs: 6000
      })
    }
  })
  
  // Make toast manager globally available
  if (toastManager.value) {
    window.$toast = toastManager.value
    // Provide to all child components
    provide('toast', toastManager.value)
  }
})

// Page metadata
useHead({
  title: 'Circular CIRX OTC Platform',
  meta: [
    { name: 'description', content: 'Trade CIRX tokens with instant delivery or OTC discounts up to 12%' }
  ]
})
</script>

<style>
/* Global styles */
html {
  scroll-behavior: smooth;
}

body {
  background-color: #0a0a0a;
  color: #ffffff;
}

/* Prevent flash of unstyled content */
.nuxt-loading-indicator {
  background: linear-gradient(to right, #00ff88, #0088ff);
  height: 3px;
}
</style>