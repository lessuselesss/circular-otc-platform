# UniswapV3 Clone Frontend

A modern decentralized exchange frontend built with Nuxt.js 3, designed for deployment on Cloudflare Pages.

## Features

- 🚀 **Nuxt.js 3** - Modern Vue.js framework with server-side rendering
- ☁️ **Cloudflare Pages** - Fast, global deployment with edge computing
- 🎨 **Nuxt UI** - Beautiful, accessible UI components
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Performance Optimized** - Built for speed and SEO

## Tech Stack

- **Framework**: Nuxt.js 3
- **UI Library**: Nuxt UI (built on Tailwind CSS)
- **Deployment**: Cloudflare Pages
- **Build Tool**: Vite
- **Package Manager**: npm

## Development

### Prerequisites

- Node.js 18+ 
- npm or equivalent package manager

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run generate     # Generate static site
npm run preview      # Preview production build locally
```

## Deployment

### Cloudflare Pages

This app is configured for Cloudflare Pages deployment:

1. **Build Settings**:
   - Framework preset: Nuxt.js
   - Build command: `npm run build`
   - Build output directory: `.output/public`

2. **Deploy**:
   - Connect your Git repository to Cloudflare Pages
   - Set build command and output directory
   - Deploy automatically on git push

### Manual Deployment with Wrangler

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy:
```bash
npm run build
wrangler pages deploy .output/public
```

## Project Structure

```
ui/
├── assets/           # Static assets (CSS, images)
├── components/       # Vue components
├── composables/      # Vue composables
├── layouts/          # Layout components
├── pages/            # File-based routing
├── public/           # Static files
├── server/           # Server-side API routes
├── nuxt.config.ts    # Nuxt configuration
├── package.json      # Dependencies and scripts
└── wrangler.toml     # Cloudflare deployment config
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Public variables (exposed to client)
NUXT_PUBLIC_SITE_URL=https://your-domain.pages.dev
NUXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### Cloudflare Integration

The app is configured for Cloudflare Pages with:
- Nitro preset: `cloudflare-pages`
- WASM support enabled
- Edge runtime compatibility

## Web3 Integration

This frontend is designed to work with:
- **Smart Contracts**: Ethereum-based DEX contracts
- **Wallet Connection**: MetaMask, WalletConnect, etc.
- **Web3 Libraries**: ethers.js or web3.js (to be integrated)

## License

This project is part of the UniswapV3 Clone and follows the same license terms.