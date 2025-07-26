// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "v4-core/interfaces/IPoolManager.sol";
import "v4-core/types/PoolKey.sol";
import "v4-core/types/Currency.sol";
import "v4-core/types/PoolId.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../tokens/CIRXToken.sol";
import "../vesting/VestingContract.sol";

/**
 * @title SimpleOTCSwap
 * @dev Basic OTC swap contract for CIRX tokens using UniswapV4
 * @notice Handles both liquid and vested CIRX purchases with discount tiers
 */
contract SimpleOTCSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev UniswapV4 Pool Manager
    IPoolManager public immutable poolManager;

    /// @dev CIRX token contract
    CIRXToken public immutable cirxToken;

    /// @dev Vesting contract for OTC purchases
    VestingContract public immutable vestingContract;

    /// @dev Discount tiers for OTC vested purchases (in basis points)
    struct DiscountTier {
        uint256 minAmount; // Minimum purchase amount in USD (with 18 decimals)
        uint256 discountBps; // Discount in basis points (100 = 1%)
    }

    /// @dev Discount tiers array
    DiscountTier[] public discountTiers;

    /// @dev Fee for liquid swaps (in basis points)
    uint256 public liquidFee = 30; // 0.3%

    /// @dev Fee for OTC vested swaps (in basis points)
    uint256 public otcFee = 15; // 0.15%

    /// @dev Treasury address for collecting fees
    address public treasury;

    /// @dev Mapping of supported input tokens
    mapping(address => bool) public supportedTokens;

    /// @dev Mapping of token to USD price (with 18 decimals)
    mapping(address => uint256) public tokenPrices;

    event LiquidSwap(address indexed user, address indexed inputToken, uint256 inputAmount, uint256 cirxAmount);
    event OTCSwap(
        address indexed user, address indexed inputToken, uint256 inputAmount, uint256 cirxAmount, uint256 discountBps
    );
    event DiscountTierAdded(uint256 minAmount, uint256 discountBps);
    event TokenSupported(address indexed token, uint256 price);
    event PriceUpdated(address indexed token, uint256 newPrice);

    constructor(
        address _poolManager,
        address _cirxToken,
        address _vestingContract,
        address _treasury,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_poolManager != address(0), "Pool manager cannot be zero address");
        require(_cirxToken != address(0), "CIRX token cannot be zero address");
        require(_vestingContract != address(0), "Vesting contract cannot be zero address");
        require(_treasury != address(0), "Treasury cannot be zero address");

        poolManager = IPoolManager(_poolManager);
        cirxToken = CIRXToken(_cirxToken);
        vestingContract = VestingContract(_vestingContract);
        treasury = _treasury;

        // Initialize default discount tiers
        _addDiscountTier(1_000 * 10 ** 18, 500); // $1K+: 5%
        _addDiscountTier(10_000 * 10 ** 18, 800); // $10K+: 8%
        _addDiscountTier(50_000 * 10 ** 18, 1200); // $50K+: 12%
    }

    /**
     * @dev Add supported token with USD price
     * @param token Token address to support
     * @param priceUSD Price in USD with 18 decimals
     */
    function addSupportedToken(address token, uint256 priceUSD) external onlyOwner {
        require(token != address(0), "Token address cannot be zero");
        require(priceUSD > 0, "Price must be greater than zero");

        supportedTokens[token] = true;
        tokenPrices[token] = priceUSD;

        emit TokenSupported(token, priceUSD);
    }

    /**
     * @dev Update token price
     * @param token Token address
     * @param newPrice New price in USD with 18 decimals
     */
    function updateTokenPrice(address token, uint256 newPrice) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        require(newPrice > 0, "Price must be greater than zero");

        tokenPrices[token] = newPrice;
        emit PriceUpdated(token, newPrice);
    }

    /**
     * @dev Add discount tier for OTC purchases
     * @param minAmount Minimum amount in USD (18 decimals)
     * @param discountBps Discount in basis points
     */
    function addDiscountTier(uint256 minAmount, uint256 discountBps) external onlyOwner {
        _addDiscountTier(minAmount, discountBps);
    }

    function _addDiscountTier(uint256 minAmount, uint256 discountBps) internal {
        require(discountBps <= 2000, "Discount cannot exceed 20%");

        discountTiers.push(DiscountTier({minAmount: minAmount, discountBps: discountBps}));

        emit DiscountTierAdded(minAmount, discountBps);
    }

    /**
     * @dev Calculate discount for purchase amount
     * @param usdAmount Purchase amount in USD (18 decimals)
     * @return discountBps Discount in basis points
     */
    function calculateDiscount(uint256 usdAmount) public view returns (uint256 discountBps) {
        for (uint256 i = discountTiers.length; i > 0; i--) {
            if (usdAmount >= discountTiers[i - 1].minAmount) {
                return discountTiers[i - 1].discountBps;
            }
        }
        return 0;
    }

    /**
     * @dev Get quote for liquid swap
     * @param inputToken Input token address
     * @param inputAmount Amount of input token
     * @return cirxAmount Amount of CIRX tokens to receive
     * @return fee Fee amount in input token
     */
    function getLiquidQuote(address inputToken, uint256 inputAmount)
        external
        view
        returns (uint256 cirxAmount, uint256 fee)
    {
        require(supportedTokens[inputToken], "Token not supported");
        require(inputAmount > 0, "Input amount must be greater than zero");

        // Calculate fee
        fee = (inputAmount * liquidFee) / 10000;
        uint256 amountAfterFee = inputAmount - fee;

        // Simple 1:1 USD conversion for now (would use V4 pool pricing in production)
        uint256 usdValue = _calculateUsdValue(inputToken, amountAfterFee);

        // Assume CIRX is $1 for simplicity
        cirxAmount = usdValue;
    }

    /**
     * @dev Get quote for OTC vested swap
     * @param inputToken Input token address
     * @param inputAmount Amount of input token
     * @return cirxAmount Amount of CIRX tokens to receive (including discount)
     * @return fee Fee amount in input token
     * @return discountBps Discount applied in basis points
     */
    function getOTCQuote(address inputToken, uint256 inputAmount)
        external
        view
        returns (uint256 cirxAmount, uint256 fee, uint256 discountBps)
    {
        require(supportedTokens[inputToken], "Token not supported");
        require(inputAmount > 0, "Input amount must be greater than zero");

        // Calculate USD value (before fees for discount calculation) 
        uint256 totalUsdValue = _calculateUsdValue(inputToken, inputAmount);

        // Calculate discount based on total purchase amount
        discountBps = calculateDiscount(totalUsdValue);

        // Calculate fee
        fee = (inputAmount * otcFee) / 10000;
        uint256 amountAfterFee = inputAmount - fee;
        uint256 usdValue = _calculateUsdValue(inputToken, amountAfterFee);

        // Apply discount to get more CIRX tokens
        cirxAmount = usdValue + (usdValue * discountBps) / 10000;
    }

    /**
     * @dev Execute liquid swap (immediate CIRX delivery)
     * @param inputToken Token to swap from
     * @param inputAmount Amount of input token to swap
     * @param minCirxOut Minimum CIRX tokens to receive
     */
    function swapLiquid(address inputToken, uint256 inputAmount, uint256 minCirxOut) external nonReentrant {
        require(supportedTokens[inputToken], "Token not supported");
        require(inputAmount > 0, "Input amount must be greater than zero");

        // Get quote
        (uint256 cirxAmount, uint256 fee) = this.getLiquidQuote(inputToken, inputAmount);
        require(cirxAmount >= minCirxOut, "Insufficient output amount");

        // Transfer input token from user
        IERC20(inputToken).safeTransferFrom(msg.sender, address(this), inputAmount);

        // Transfer fee to treasury
        IERC20(inputToken).safeTransfer(treasury, fee);

        // Mint and transfer CIRX tokens to user
        cirxToken.mint(msg.sender, cirxAmount);

        emit LiquidSwap(msg.sender, inputToken, inputAmount, cirxAmount);
    }

    /**
     * @dev Execute OTC vested swap (CIRX delivered through vesting)
     * @param inputToken Token to swap from
     * @param inputAmount Amount of input token to swap
     * @param minCirxOut Minimum CIRX tokens to receive (including discount)
     */
    function swapOTC(address inputToken, uint256 inputAmount, uint256 minCirxOut) external nonReentrant {
        require(supportedTokens[inputToken], "Token not supported");
        require(inputAmount > 0, "Input amount must be greater than zero");

        // Get quote
        (uint256 cirxAmount, uint256 fee, uint256 discountBps) = this.getOTCQuote(inputToken, inputAmount);
        require(cirxAmount >= minCirxOut, "Insufficient output amount");

        // Transfer input token from user
        IERC20(inputToken).safeTransferFrom(msg.sender, address(this), inputAmount);

        // Transfer fee to treasury
        IERC20(inputToken).safeTransfer(treasury, fee);

        // Mint CIRX tokens to this contract
        cirxToken.mint(address(this), cirxAmount);

        // Approve vesting contract to spend CIRX
        cirxToken.approve(address(vestingContract), cirxAmount);

        // Create vesting position
        vestingContract.createVestingPosition(msg.sender, cirxAmount);

        emit OTCSwap(msg.sender, inputToken, inputAmount, cirxAmount, discountBps);
    }

    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Treasury cannot be zero address");
        treasury = newTreasury;
    }

    /**
     * @dev Update fees
     * @param newLiquidFee New liquid fee in basis points
     * @param newOtcFee New OTC fee in basis points
     */
    function updateFees(uint256 newLiquidFee, uint256 newOtcFee) external onlyOwner {
        require(newLiquidFee <= 1000, "Liquid fee cannot exceed 10%");
        require(newOtcFee <= 1000, "OTC fee cannot exceed 10%");

        liquidFee = newLiquidFee;
        otcFee = newOtcFee;
    }

    /**
     * @dev Calculate USD value from token amount accounting for decimals
     * @param token Token address  
     * @param amount Token amount
     * @return usdValue USD value with 18 decimals
     */
    function _calculateUsdValue(address token, uint256 amount) internal view returns (uint256 usdValue) {
        uint256 tokenDecimals = IERC20Metadata(token).decimals();
        uint256 price = tokenPrices[token]; // Price has 18 decimals
        
        // Normalize amount to 18 decimals, then multiply by price
        if (tokenDecimals <= 18) {
            usdValue = (amount * 10 ** (18 - tokenDecimals) * price) / 10 ** 18;
        } else {
            usdValue = (amount * price) / (10 ** tokenDecimals);
        }
    }
}
