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
            <button class="connect-wallet-btn">
              Connect Wallet
            </button>
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
  color: #6b7280;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #111827;
}

.nav-link.router-link-active {
  color: #2563eb;
}

.connect-wallet-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.connect-wallet-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
</style>