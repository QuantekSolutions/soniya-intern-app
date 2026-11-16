// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {TipJar} from "./TipJar.sol";

contract TipJarTest is Test {
    TipJar tipJar;

    address ownerAddr = address(0x111);
    address tipper = address(0x123);
    address nonOwner = address(0x456);

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
    }

    // Test 2: Zero ETH tip reverts
    function test_ZeroTipReverts() public {
        vm.expectRevert(TipJar.ZeroTip.selector);

        vm.prank(tipper);
        tipJar.tip("No ETH sent");
    }

    // Test 3: Non-owner cannot withdraw
    function test_NonOwnerWithdrawReverts() public {
        vm.expectRevert(
            abi.encodeWithSelector(TipJar.NotOwner.selector, nonOwner)
        );

        vm.prank(nonOwner);
        tipJar.withdraw();
    }

    // Test 4: Owner withdraws full balance
    function test_OwnerWithdrawsFullBalance() public {
        uint256 amount = 3 ether;

        vm.deal(address(tipJar), amount);
        vm.deal(ownerAddr, 1 ether);

        uint256 ownerBalanceBefore = ownerAddr.balance;

        vm.prank(ownerAddr);
        tipJar.withdraw();

        assertEq(ownerAddr.balance, ownerBalanceBefore + amount);
        assertEq(address(tipJar).balance, 0);
    }
}
