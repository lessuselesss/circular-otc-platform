// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CIRXToken
 * @dev ERC20 token for Circular Protocol with permit functionality
 * @notice This is the CIRX token used in the OTC trading platform
 */
contract CIRXToken is ERC20, ERC20Permit, Ownable {
    /// @dev Maximum supply of CIRX tokens (1 billion tokens)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    /// @dev Mapping to track addresses that can mint tokens (for OTC contracts)
    mapping(address => bool) public minters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    constructor(address initialOwner, uint256 initialSupply)
        ERC20("Circular", "CIRX")
        ERC20Permit("Circular")
        Ownable(initialOwner)
    {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        if (initialSupply > 0) {
            _mintWithCap(initialOwner, initialSupply);
        }
    }

    /**
     * @dev Add a minter address (for OTC contracts)
     * @param minter Address to add as minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Cannot add zero address as minter");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter address
     * @param minter Address to remove from minters
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint tokens to address (only for authorized minters)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "Only authorized minters can mint");
        _mintWithCap(to, amount);
    }

    /**
     * @dev Internal mint with supply cap check
     */
    function _mintWithCap(address to, uint256 amount) internal {
        require(totalSupply() + amount <= MAX_SUPPLY, "Minting would exceed max supply");
        _mint(to, amount);
    }
}
