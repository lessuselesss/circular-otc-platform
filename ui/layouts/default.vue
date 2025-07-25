<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <nav class="nav">
          <NuxtLink to="/" class="logo">
            UniswapV3 Clone
          </NuxtLink>
          <div class="flex items-center gap-4">
            <NuxtLink to="/swap" class="nav-link">
              Swap
            </NuxtLink>
            <NuxtLink to="/pool" class="nav-link">
              Pool
            </NuxtLink>
            <UButton variant="outline" size="sm">
              Connect Wallet
            </UButton>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 main-content">
      <div class="container">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 UniswapV3 Clone. Built with Nuxt.js and Solidity.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.nav-link {
  @apply text-gray-600 hover:text-gray-900 font-medium transition-colors;
}

.nav-link.router-link-active {
  @apply text-blue-600;
}
</style>