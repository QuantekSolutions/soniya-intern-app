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
        // Check that ETH is not zero
        if (msg.value == 0) {
            revert ZeroTip();
        }

        // Store tip details
        tips.push(
            Tip({
                from: msg.sender,
                amount: msg.value,
                message: message,
                timestamp: block.timestamp
            })
        );

        // Emit tip event
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

    // 11. Withdraw complete contract balance
    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;

        // Send ETH to owner
        (bool success, ) = payable(owner).call{value: amount}("");

        // Check whether transfer succeeded
        require(success, "Withdrawal failed");

        // Emit withdrawal event
        emit Withdrawn(owner, amount);
    }
}
