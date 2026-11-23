// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TipJar {
    // 1. Owner address
    address public owner;

    // 2. Tip structure
    struct Tip {
        address from;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    // 3. Array to store all tips
    Tip[] public tips;

    // 4. Custom errors
    error ZeroTip();
    error NotOwner(address caller);
    error ZeroWithdrawal();
    error InsufficientBalance(uint256 requested, uint256 available);
    error WithdrawalFailed();

    // 5. Events
    event TipSent(address indexed from, uint256 amount, string message);
    event Withdrawn(address indexed owner, uint256 amount);

    // 6. Constructor
    constructor() {
        owner = msg.sender;
    }

    // 7. Owner-only modifier
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner(msg.sender);
        }
        _;
    }

    // 8. Receive tips
    function tip(string calldata message) external payable {
        if (msg.value == 0) {
            revert ZeroTip();
        }

        tips.push(
            Tip({
                from: msg.sender,
                amount: msg.value,
                message: message,
                timestamp: block.timestamp
            })
        );

        emit TipSent(msg.sender, msg.value, message);
    }

    // 9. Get total number of tips
    function getTipCount() external view returns (uint256) {
        return tips.length;
    }

    // 10. Get tip details by index
    function getTip(uint256 index) external view returns (Tip memory) {
        return tips[index];
    }

    // 11. Get contract ETH balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // 12. Withdraw a specific ETH amount
    function withdraw(uint256 amount) external onlyOwner {
        uint256 availableBalance = address(this).balance;

        if (amount == 0) {
            revert ZeroWithdrawal();
        }

        if (amount > availableBalance) {
            revert InsufficientBalance(amount, availableBalance);
        }

        (bool success, ) = payable(owner).call{value: amount}("");

        if (!success) {
            revert WithdrawalFailed();
        }

        emit Withdrawn(owner, amount);
    }
}
