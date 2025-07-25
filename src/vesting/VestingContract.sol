// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VestingContract
 * @dev Manages 6-month linear vesting for OTC CIRX token purchases
 * @notice Handles vested token positions with linear unlock over 6 months
 */
contract VestingContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev 6 months in seconds (180 days)
    uint256 public constant VESTING_DURATION = 180 days;

    /// @dev CIRX token contract
    IERC20 public immutable cirxToken;

    /// @dev Struct to track individual vesting positions
    struct VestingPosition {
        uint256 totalAmount; // Total CIRX tokens vesting
        uint256 startTime; // When vesting started
        uint256 claimedAmount; // Amount already claimed
        bool isActive; // Whether position is active
    }

    /// @dev Mapping from user address to their vesting position
    mapping(address => VestingPosition) public vestingPositions;

    /// @dev Mapping to track authorized OTC contracts that can create positions
    mapping(address => bool) public authorizedContracts;

    /// @dev Total tokens currently vesting
    uint256 public totalVesting;

    event VestingPositionCreated(address indexed user, uint256 amount, uint256 startTime);
    event TokensClaimed(address indexed user, uint256 amount);
    event ContractAuthorized(address indexed contractAddress);
    event ContractDeauthorized(address indexed contractAddress);

    constructor(address _cirxToken, address initialOwner) Ownable(initialOwner) {
        require(_cirxToken != address(0), "CIRX token address cannot be zero");
        cirxToken = IERC20(_cirxToken);
    }

    /**
     * @dev Authorize a contract to create vesting positions
     * @param contractAddress Address of OTC contract to authorize
     */
    function authorizeContract(address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Cannot authorize zero address");
        authorizedContracts[contractAddress] = true;
        emit ContractAuthorized(contractAddress);
    }

    /**
     * @dev Deauthorize a contract
     * @param contractAddress Address to deauthorize
     */
    function deauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
        emit ContractDeauthorized(contractAddress);
    }

    /**
     * @dev Create a vesting position for a user (only authorized contracts)
     * @param user Address of the user receiving vested tokens
     * @param amount Amount of CIRX tokens to vest
     */
    function createVestingPosition(address user, uint256 amount) external {
        require(authorizedContracts[msg.sender], "Only authorized contracts can create positions");
        require(user != address(0), "User address cannot be zero");
        require(amount > 0, "Vesting amount must be greater than zero");
        require(!vestingPositions[user].isActive, "User already has active vesting position");

        // Transfer tokens from the OTC contract to this vesting contract
        cirxToken.safeTransferFrom(msg.sender, address(this), amount);

        // Create vesting position
        vestingPositions[user] =
            VestingPosition({totalAmount: amount, startTime: block.timestamp, claimedAmount: 0, isActive: true});

        totalVesting += amount;

        emit VestingPositionCreated(user, amount, block.timestamp);
    }

    /**
     * @dev Calculate how many tokens are currently claimable for a user
     * @param user Address to check claimable amount for
     * @return claimableAmount Amount of tokens that can be claimed now
     */
    function getClaimableAmount(address user) public view returns (uint256 claimableAmount) {
        VestingPosition memory position = vestingPositions[user];

        if (!position.isActive || position.totalAmount == 0) {
            return 0;
        }

        uint256 elapsed = block.timestamp - position.startTime;

        if (elapsed >= VESTING_DURATION) {
            // Fully vested
            claimableAmount = position.totalAmount - position.claimedAmount;
        } else {
            // Partially vested (linear)
            uint256 vestedAmount = (position.totalAmount * elapsed) / VESTING_DURATION;
            claimableAmount = vestedAmount - position.claimedAmount;
        }
    }

    /**
     * @dev Get complete vesting information for a user
     * @param user Address to get vesting info for
     * @return totalAmount Total tokens in vesting
     * @return startTime When vesting started
     * @return claimedAmount Amount already claimed
     * @return claimableAmount Amount currently claimable
     * @return isActive Whether position is active
     */
    function getVestingInfo(address user)
        external
        view
        returns (uint256 totalAmount, uint256 startTime, uint256 claimedAmount, uint256 claimableAmount, bool isActive)
    {
        VestingPosition memory position = vestingPositions[user];
        return (
            position.totalAmount,
            position.startTime,
            position.claimedAmount,
            getClaimableAmount(user),
            position.isActive
        );
    }

    /**
     * @dev Claim vested tokens
     * @dev Users can call this to claim their available vested tokens
     */
    function claimTokens() external nonReentrant {
        uint256 claimableAmount = getClaimableAmount(msg.sender);
        require(claimableAmount > 0, "No tokens available to claim");

        VestingPosition storage position = vestingPositions[msg.sender];
        position.claimedAmount += claimableAmount;

        // If fully claimed, deactivate position
        if (position.claimedAmount >= position.totalAmount) {
            position.isActive = false;
            totalVesting -= position.totalAmount;
        }

        // Transfer tokens to user
        cirxToken.safeTransfer(msg.sender, claimableAmount);

        emit TokensClaimed(msg.sender, claimableAmount);
    }

    /**
     * @dev Emergency function to recover tokens (only owner)
     * @param token Token to recover
     * @param amount Amount to recover
     */
    function emergencyRecover(address token, uint256 amount) external onlyOwner {
        require(
            token != address(cirxToken) || amount <= cirxToken.balanceOf(address(this)) - totalVesting,
            "Cannot recover vesting tokens"
        );
        IERC20(token).safeTransfer(owner(), amount);
    }
}
