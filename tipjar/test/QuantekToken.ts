
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("QuantekToken", async function () {
  const { viem } = await network.create();

  it("Should have the correct name and symbol", async function () {
    const token = await viem.deployContract("QuantekToken");

    assert.equal(await token.read.name(), "QuantekToken");
    assert.equal(await token.read.symbol(), "QTK");
  });

  it("Should mint 1,000,000 tokens to the deployer", async function () {
    const [deployer] = await viem.getWalletClients();

    const token = await viem.deployContract("QuantekToken");

    const expectedSupply = 1_000_000n * 10n ** 18n;

    assert.equal(await token.read.totalSupply(), expectedSupply);
    assert.equal(
      await token.read.balanceOf([deployer.account.address]),
      expectedSupply,
    );
  });

  it("Should transfer tokens between accounts", async function () {
    const [deployer, recipient] = await viem.getWalletClients();

    const token = await viem.deployContract("QuantekToken");

    const transferAmount = 100n * 10n ** 18n;

    await token.write.transfer([
      recipient.account.address,
      transferAmount,
    ]);

    assert.equal(
      await token.read.balanceOf([recipient.account.address]),
      transferAmount,
    );
  });
});
