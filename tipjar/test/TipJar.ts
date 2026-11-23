import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";
import { parseEther, decodeEventLog } from "viem";

const { viem } = await network.connect();

const publicClient = await viem.getPublicClient();
const walletClients = await viem.getWalletClients();

describe("TipJar", () => {
  let tipJar: any;

  const owner = walletClients[0];
  const tipper = walletClients[1];
  const nonOwner = walletClients[2];

  beforeEach(async () => {
    tipJar = await viem.deployContract("TipJar");
  });

  // Test 1: Tip increases contract balance and tip count
  it("Test 1: should increase balance and tip count", async () => {
    const amount = parseEther("1");

    await tipJar.write.tip(["Great work!"], {
      account: tipper.account,
      value: amount,
    });

    const balance = await publicClient.getBalance({
      address: tipJar.address,
    });

    const tipCount = await tipJar.read.getTipCount();
    const savedTip = await tipJar.read.getTip([0n]);

    assert.equal(balance, amount);
    assert.equal(tipCount, 1n);
    assert.equal(
      savedTip.from.toLowerCase(),
      tipper.account.address.toLowerCase()
    );
    assert.equal(savedTip.amount, amount);
    assert.equal(savedTip.message, "Great work!");
  });

  // Test 2: TipSent event should be emitted
  it("Test 2: should emit TipSent event", async () => {
    const amount = parseEther("1");
    const message = "Keep building!";

    const hash = await tipJar.write.tip([message], {
      account: tipper.account,
      value: amount,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    const tipSentAbi = [
      {
        type: "event",
        name: "TipSent",
        inputs: [
          { name: "from", type: "address", indexed: true },
          { name: "amount", type: "uint256", indexed: false },
          { name: "message", type: "string", indexed: false },
        ],
      },
    ] as const;

    const decodedEvents = receipt.logs
      .filter(
        (log) => log.address.toLowerCase() === tipJar.address.toLowerCase()
      )
      .map((log) => {
        try {
          return decodeEventLog({
            abi: tipSentAbi,
            data: log.data,
            topics: log.topics,
          });
        } catch {
          return null;
        }
      });

    const tipEvent = decodedEvents.find(
      (event) => event?.eventName === "TipSent"
    );

    assert.ok(tipEvent, "TipSent event was not emitted");

    assert.equal(
      tipEvent.args.from.toLowerCase(),
      tipper.account.address.toLowerCase()
    );
    assert.equal(tipEvent.args.amount, amount);
    assert.equal(tipEvent.args.message, message);
  });

  // Test 3: Non-owner cannot withdraw
  it("Test 3: should reject withdrawal by non-owner", async () => {
    await assert.rejects(
      async () => {
        await tipJar.write.withdraw([parseEther("1")], {
          account: nonOwner.account,
        });
      },
      /NotOwner/
    );
  });

  // Test 4: Owner withdraws a specific amount
  it("Test 4: owner should withdraw partial balance", async () => {
    const amount = parseEther("2");
    const withdrawAmount = parseEther("1");

    await tipJar.write.tip(["Withdrawal test"], {
      account: tipper.account,
      value: amount,
    });

    const hash = await tipJar.write.withdraw([withdrawAmount], {
      account: owner.account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    const contractBalance = await publicClient.getBalance({
      address: tipJar.address,
    });

    assert.equal(contractBalance, amount - withdrawAmount);
    assert.equal(receipt.status, "success");
  });

  // Test 5: Contract balance should decrease after withdrawal
  it("Test 5: should retain remaining ETH after partial withdrawal", async () => {
    const amount = parseEther("3");
    const withdrawAmount = parseEther("2");

    await tipJar.write.tip(["Partial withdrawal"], {
      account: tipper.account,
      value: amount,
    });

    await tipJar.write.withdraw([withdrawAmount], {
      account: owner.account,
    });

    const remainingBalance = await tipJar.read.getBalance();

    assert.equal(remainingBalance, parseEther("1"));
  });

  // Test 6: Gas measurement
  it("Gas measurement: tip and withdraw", async () => {
    const amount = parseEther("1");

    const firstTipHash = await tipJar.write.tip(["First tip"], {
      account: tipper.account,
      value: amount,
    });

    const firstTipReceipt =
      await publicClient.waitForTransactionReceipt({ hash: firstTipHash });

    const secondTipHash = await tipJar.write.tip(["Second tip"], {
      account: tipper.account,
      value: amount,
    });

    const secondTipReceipt =
      await publicClient.waitForTransactionReceipt({ hash: secondTipHash });

    const withdrawHash = await tipJar.write.withdraw([amount], {
      account: owner.account,
    });

    const withdrawReceipt =
      await publicClient.waitForTransactionReceipt({ hash: withdrawHash });

    console.log("First tip gasUsed:", firstTipReceipt.gasUsed.toString());
    console.log("Second tip gasUsed:", secondTipReceipt.gasUsed.toString());
    console.log("Withdraw gasUsed:", withdrawReceipt.gasUsed.toString());

    assert.equal(
      await publicClient.getBalance({ address: tipJar.address }),
      amount
    );
  });
});