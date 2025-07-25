import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'

// Contract addresses (update with deployed addresses)
const CONTRACT_ADDRESSES = {
  CIRX_TOKEN: '0x0000000000000000000000000000000000000000', // TODO: Update with deployed address
  VESTING_CONTRACT: '0x0000000000000000000000000000000000000000', // TODO: Update with deployed address
  OTC_SWAP: '0x0000000000000000000000000000000000000000', // TODO: Update with deployed address
}

// ERC20 ABI
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
]

// SimpleOTCSwap ABI (simplified)
const OTC_SWAP_ABI = [
  {
    name: 'getLiquidQuote',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'inputToken', type: 'address' },
      { name: 'inputAmount', type: 'uint256' }
    ],
    outputs: [
      { name: 'cirxAmount', type: 'uint256' },
      { name: 'fee', type: 'uint256' }
    ]
  },
  {
    name: 'getOTCQuote',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'inputToken', type: 'address' },
      { name: 'inputAmount', type: 'uint256' }
    ],
    outputs: [
      { name: 'cirxAmount', type: 'uint256' },
      { name: 'fee', type: 'uint256' },
      { name: 'discountBps', type: 'uint256' }
    ]
  },
  {
    name: 'swapLiquid',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'inputToken', type: 'address' },
      { name: 'inputAmount', type: 'uint256' },
      { name: 'minCirxOut', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'swapOTC',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'inputToken', type: 'address' },
      { name: 'inputAmount', type: 'uint256' },
      { name: 'minCirxOut', type: 'uint256' }
    ],
    outputs: []
  }
]

// VestingContract ABI (simplified)
const VESTING_ABI = [
  {
    name: 'getVestingInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'totalAmount', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'claimedAmount', type: 'uint256' },
      { name: 'claimableAmount', type: 'uint256' },
      { name: 'isActive', type: 'bool' }
    ]
  },
  {
    name: 'claimTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  }
]

// Token addresses (mainnet addresses - update for your deployment)
const TOKEN_ADDRESSES = {
  ETH: '0x0000000000000000000000000000000000000000', // Native ETH
  USDC: '0xA0b86a33E6417c5c6E9c8B9b4f5b5e4E8d8e8d8e', // Mock USDC address
  USDT: '0xB0b86a33E6417c5c6E9c8B9b4f5b5e4E8d8e8d8e', // Mock USDT address
}

export const useContracts = () => {
  const { readContract, writeContract, account, isConnected } = useWallet()

  // Get token balance
  const getTokenBalance = async (tokenSymbol, userAddress = null) => {
    const address = userAddress || account.value
    if (!address) return '0'

    try {
      if (tokenSymbol === 'ETH') {
        // For ETH, use the wallet's balance
        return balance.value?.toString() || '0'
      }

      const tokenAddress = TOKEN_ADDRESSES[tokenSymbol]
      if (!tokenAddress) return '0'

      const balance = await readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address]
      })

      // Format based on token decimals (assuming 18 for now)
      return formatUnits(balance, 18)
    } catch (err) {
      console.error(`Failed to get ${tokenSymbol} balance:`, err)
      return '0'
    }
  }

  // Get CIRX balance
  const getCIRXBalance = async (userAddress = null) => {
    const address = userAddress || account.value
    if (!address || !CONTRACT_ADDRESSES.CIRX_TOKEN) return '0'

    try {
      const balance = await readContract({
        address: CONTRACT_ADDRESSES.CIRX_TOKEN,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address]
      })

      return formatUnits(balance, 18)
    } catch (err) {
      console.error('Failed to get CIRX balance:', err)
      return '0'
    }
  }

  // Get liquid swap quote
  const getLiquidQuote = async (inputToken, inputAmount) => {
    if (!CONTRACT_ADDRESSES.OTC_SWAP) {
      // Mock quote for development
      return {
        cirxAmount: (parseFloat(inputAmount) * 2500).toFixed(2), // Mock: 1 ETH = 2500 CIRX
        fee: '0.3'
      }
    }

    try {
      const tokenAddress = TOKEN_ADDRESSES[inputToken]
      const amountWei = parseUnits(inputAmount, 18)

      const [cirxAmount, fee] = await readContract({
        address: CONTRACT_ADDRESSES.OTC_SWAP,
        abi: OTC_SWAP_ABI,
        functionName: 'getLiquidQuote',
        args: [tokenAddress, amountWei]
      })

      return {
        cirxAmount: formatUnits(cirxAmount, 18),
        fee: formatUnits(fee, 18)
      }
    } catch (err) {
      console.error('Failed to get liquid quote:', err)
      throw err
    }
  }

  // Get OTC swap quote
  const getOTCQuote = async (inputToken, inputAmount) => {
    if (!CONTRACT_ADDRESSES.OTC_SWAP) {
      // Mock quote for development
      const baseAmount = parseFloat(inputAmount) * 2500 // Mock: 1 ETH = 2500 CIRX
      const usdValue = parseFloat(inputAmount) * 2500 // Mock ETH price
      
      let discount = 0
      if (usdValue >= 50000) discount = 12
      else if (usdValue >= 10000) discount = 8
      else if (usdValue >= 1000) discount = 5

      const cirxAmount = baseAmount * (1 + discount / 100)

      return {
        cirxAmount: cirxAmount.toFixed(2),
        fee: '0.15',
        discount: discount.toString()
      }
    }

    try {
      const tokenAddress = TOKEN_ADDRESSES[inputToken]
      const amountWei = parseUnits(inputAmount, 18)

      const [cirxAmount, fee, discountBps] = await readContract({
        address: CONTRACT_ADDRESSES.OTC_SWAP,
        abi: OTC_SWAP_ABI,
        functionName: 'getOTCQuote',
        args: [tokenAddress, amountWei]
      })

      return {
        cirxAmount: formatUnits(cirxAmount, 18),
        fee: formatUnits(fee, 18),
        discount: (Number(discountBps) / 100).toString() // Convert basis points to percentage
      }
    } catch (err) {
      console.error('Failed to get OTC quote:', err)
      throw err
    }
  }

  // Execute liquid swap
  const executeLiquidSwap = async (inputToken, inputAmount, minCirxOut) => {
    if (!isConnected.value) {
      throw new Error('Wallet not connected')
    }

    if (!CONTRACT_ADDRESSES.OTC_SWAP) {
      throw new Error('Contract addresses not configured')
    }

    try {
      const tokenAddress = TOKEN_ADDRESSES[inputToken]
      const amountWei = parseUnits(inputAmount, 18)
      const minOutWei = parseUnits(minCirxOut, 18)

      // If not ETH, need to approve token spend first
      if (inputToken !== 'ETH') {
        await approveToken(inputToken, inputAmount)
      }

      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.OTC_SWAP,
        abi: OTC_SWAP_ABI,
        functionName: 'swapLiquid',
        args: [tokenAddress, amountWei, minOutWei],
        value: inputToken === 'ETH' ? amountWei : 0n
      })

      return hash
    } catch (err) {
      console.error('Liquid swap failed:', err)
      throw err
    }
  }

  // Execute OTC swap
  const executeOTCSwap = async (inputToken, inputAmount, minCirxOut) => {
    if (!isConnected.value) {
      throw new Error('Wallet not connected')
    }

    if (!CONTRACT_ADDRESSES.OTC_SWAP) {
      throw new Error('Contract addresses not configured')
    }

    try {
      const tokenAddress = TOKEN_ADDRESSES[inputToken]
      const amountWei = parseUnits(inputAmount, 18)
      const minOutWei = parseUnits(minCirxOut, 18)

      // If not ETH, need to approve token spend first
      if (inputToken !== 'ETH') {
        await approveToken(inputToken, inputAmount)
      }

      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.OTC_SWAP,
        abi: OTC_SWAP_ABI,
        functionName: 'swapOTC',
        args: [tokenAddress, amountWei, minOutWei],
        value: inputToken === 'ETH' ? amountWei : 0n
      })

      return hash
    } catch (err) {
      console.error('OTC swap failed:', err)
      throw err
    }
  }

  // Approve token spending
  const approveToken = async (tokenSymbol, amount) => {
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol]
    if (!tokenAddress || tokenSymbol === 'ETH') return

    try {
      const amountWei = parseUnits(amount, 18)
      
      const hash = await writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.OTC_SWAP, amountWei]
      })

      return hash
    } catch (err) {
      console.error('Token approval failed:', err)
      throw err
    }
  }

  // Get vesting info
  const getVestingInfo = async (userAddress = null) => {
    const address = userAddress || account.value
    if (!address || !CONTRACT_ADDRESSES.VESTING_CONTRACT) {
      return {
        totalAmount: '0',
        startTime: 0,
        claimedAmount: '0',
        claimableAmount: '0',
        isActive: false
      }
    }

    try {
      const [totalAmount, startTime, claimedAmount, claimableAmount, isActive] = await readContract({
        address: CONTRACT_ADDRESSES.VESTING_CONTRACT,
        abi: VESTING_ABI,
        functionName: 'getVestingInfo',
        args: [address]
      })

      return {
        totalAmount: formatUnits(totalAmount, 18),
        startTime: Number(startTime),
        claimedAmount: formatUnits(claimedAmount, 18),
        claimableAmount: formatUnits(claimableAmount, 18),
        isActive
      }
    } catch (err) {
      console.error('Failed to get vesting info:', err)
      return {
        totalAmount: '0',
        startTime: 0,
        claimedAmount: '0',
        claimableAmount: '0',
        isActive: false
      }
    }
  }

  // Claim vested tokens
  const claimVestedTokens = async () => {
    if (!isConnected.value) {
      throw new Error('Wallet not connected')
    }

    if (!CONTRACT_ADDRESSES.VESTING_CONTRACT) {
      throw new Error('Vesting contract address not configured')
    }

    try {
      const hash = await writeContract({
        address: CONTRACT_ADDRESSES.VESTING_CONTRACT,
        abi: VESTING_ABI,
        functionName: 'claimTokens',
        args: []
      })

      return hash
    } catch (err) {
      console.error('Claim failed:', err)
      throw err
    }
  }

  return {
    // Contract addresses
    CONTRACT_ADDRESSES,
    TOKEN_ADDRESSES,

    // Token operations
    getTokenBalance,
    getCIRXBalance,
    approveToken,

    // Swap operations
    getLiquidQuote,
    getOTCQuote,
    executeLiquidSwap,
    executeOTCSwap,

    // Vesting operations
    getVestingInfo,
    claimVestedTokens
  }
}