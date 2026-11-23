// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {TipJar} from "./TipJar.sol";

contract TipJarTest is Test {
    TipJar tipJar;

    address ownerAddr = address(0x111);
    address tipper = address(0x123);
    address nonOwner = address(0x456);

    event Withdrawn(address indexed owner, uint256 amount);

    function setUp() public {
        vm.prank(ownerAddr);
        tipJar = new TipJar();
    }

    // Test 1: Tip increases balance and count
    function test_TipIncreasesBalanceAndCount() public {
        vm.deal(tipper, 1 ether);

        vm.prank(tipper);
        tipJar.tip{value: 1 ether}("Great work!");

        assertEq(address(tipJar).balance, 1 ether);
        assertEq(tipJar.getTipCount(), 1);
        assertEq(tipJar.getBalance(), 1 ether);
    }

    // Test 2: Zero ETH tip reverts
    function test_ZeroTipReverts() public {
        vm.expectRevert(TipJar.ZeroTip.selector);

        vm.prank(tipper);
        tipJar.tip("No ETH sent");
    }

    // Test 3: Non-owner cannot withdraw
    function test_NonOwnerWithdrawReverts() public {
        uint256 amount = 1 ether;

        vm.expectRevert(
            abi.encodeWithSelector(TipJar.NotOwner.selector, nonOwner)
        );

        vm.prank(nonOwner);
        tipJar.withdraw(amount);
    }

    // Test 4: Owner withdraws a specific amount
    function test_OwnerWithdrawsSpecificAmount() public {
        uint256 depositAmount = 3 ether;
        uint256 withdrawAmount = 1 ether;

        vm.deal(address(tipJar), depositAmount);
        vm.deal(ownerAddr, 1 ether);

        uint256 ownerBalanceBefore = ownerAddr.balance;

        vm.expectEmit(true, false, false, true);
        emit Withdrawn(ownerAddr, withdrawAmount);

        vm.prank(ownerAddr);
        tipJar.withdraw(withdrawAmount);

        assertEq(ownerAddr.balance, ownerBalanceBefore + withdrawAmount);

        assertEq(address(tipJar).balance, depositAmount - withdrawAmount);
    }

    // Test 5: Zero withdrawal reverts
    function test_ZeroWithdrawalReverts() public {
        vm.expectRevert(TipJar.ZeroWithdrawal.selector);

        vm.prank(ownerAddr);
        tipJar.withdraw(0);
    }

    // Test 6: Withdrawal greater than balance reverts
    function test_InsufficientBalanceReverts() public {
        uint256 availableBalance = 1 ether;
        uint256 requestedAmount = 2 ether;

        vm.deal(address(tipJar), availableBalance);

        vm.expectRevert(
            abi.encodeWithSelector(
                TipJar.InsufficientBalance.selector,
                requestedAmount,
                availableBalance
            )
        );

        vm.prank(ownerAddr);
        tipJar.withdraw(requestedAmount);
    }
}
