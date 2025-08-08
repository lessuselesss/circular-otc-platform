# Console/Logs Checking Guide

## How to Check Chrome Console/Logs

### 1. Open Developer Tools
- **Chrome**: Press `F12` or `Ctrl+Shift+I` (Linux/Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+I` (Linux/Windows) / `Cmd+Option+I` (Mac)

### 2. Navigate to Console Tab
- Click on the **Console** tab in DevTools
- This shows all JavaScript console output, errors, and warnings

### 3. Key Console Messages to Look For

Your application has extensive logging. Key things to monitor:

#### ✅ **Success Messages (Green)**
- `✅ MetaMask connected successfully`
- `✅ Phantom connected successfully` 
- `✅ WalletStore initialized in SwapForm`
- `✅ Contracts initialized in SwapForm`

#### ❌ **Error Messages (Red)**
- `❌ MetaMask connection failed:`
- `❌ Phantom connection failed:`
- `❌ Failed to initialize walletStore in SwapForm:`
- `🚨 GLOBAL ERROR TRIGGERED:`
- `🔴 VUE ERROR CAPTURED:`

#### ⚠️ **Warning Messages (Yellow)**
- `⚠️ Non-critical Vue error - showing toast`
- `Console errors about useOtcConfig or component loading`
- Wallet connection warnings

### 4. Debug Commands Available

Your app includes debug commands. In the console, try:

```javascript
// Check OTC dropdown status
otcDebug.checkOtcDropdown()

// Run full diagnostic
otcDebug.diagnose()

// Check for recent errors
otcDebug.checkConsoleErrors()

// Test use OtcConfig composable
otcDebug.testUseOtcConfig()
```

### 5. Network Tab
- Click **Network** tab to see:
  - Failed HTTP requests (red entries)
  - API calls and their responses
  - Asset loading issues

### 6. Clear Console
- Right-click in console → "Clear console"
- Or press `Ctrl+L` (Linux/Windows) / `Cmd+K` (Mac)

## Common Issues to Look For

### Wallet Connection Issues
- Look for `Cannot read properties of undefined (reading 'some')` errors
- Connector array initialization problems
- SSR/hydration mismatches

### Component Loading Issues  
- Vue component mounting errors
- Missing composables (`useOtcConfig`, `useSwapLogic`)
- Asset loading failures (SVGs, images)

### Network Issues
- Failed API calls
- CORS errors
- Timeout errors

## Current Server Status

Your development server is running at: `http://localhost:3000`

The application includes comprehensive error handling with:
- Global error boundaries
- Toast notifications for non-critical errors
- Critical error modal for severe issues
- Defensive initialization to prevent crashes

## Recent Console Activity Pattern

Based on the code analysis, you should expect to see:
1. Initial wallet store initialization messages
2. Composable loading messages (SwapForm, SwapOutput, etc.)
3. Chart initialization logs from CirxPriceChart
4. OTC configuration loading logs
5. Wallet detection and connection status messages