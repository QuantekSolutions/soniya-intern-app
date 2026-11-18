
"use client";

import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TIPJAR_ABI, TIPJAR_ADDRESS } from "@/lib/contracts";

export default function Home() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const {
    data: tipCount,
    refetch: refetchTipCount,
  } = useReadContract({
    address: TIPJAR_ADDRESS,
    abi: TIPJAR_ABI,
    functionName: "getTipCount",
  });

  const { data: owner } = useReadContract({
    address: TIPJAR_ADDRESS,
    abi: TIPJAR_ABI,
    functionName: "owner",
  });

  const isOwner =
    !!address &&
    !!owner &&
    address.toLowerCase() === owner.toLowerCase();

  const tipContracts = Array.from(
    { length: Number(tipCount ?? 0) },
    (_, index) => ({
      address: TIPJAR_ADDRESS,
      abi: TIPJAR_ABI,
      functionName: "getTip" as const,
      args: [BigInt(index)] as const,
    })
  );

  const { data: tips } = useReadContracts({
    contracts: tipContracts,
    query: {
      enabled: tipCount !== undefined && tipCount > BigInt(0),
    },
  });

  const {
    writeContract: writeTip,
    data: hash,
    isPending,
    error,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash });

  const {
    writeContract: withdrawContract,
    data: withdrawHash,
    isPending: isWithdrawPending,
    error: withdrawError,
  } = useWriteContract();

  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isWithdrawSuccess,
  } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  useEffect(() => {
    if (isSuccess || isWithdrawSuccess) {
      void refetchTipCount();
    }
  }, [isSuccess, isWithdrawSuccess, refetchTipCount]);

  const handleTip = () => {
    if (!amount || Number(amount) <= 0 || !message.trim()) {
      alert("Enter a valid ETH amount and message");
      return;
    }

    try {
      writeTip({
        address: TIPJAR_ADDRESS,
        abi: TIPJAR_ABI,
        functionName: "tip",
        args: [message.trim()],
        value: parseEther(amount),
      });
    } catch {
      alert("Invalid ETH amount");
    }
  };

  const handleWithdraw = () => {
    withdrawContract({
      address: TIPJAR_ADDRESS,
      abi: TIPJAR_ABI,
      functionName: "withdraw",
    });
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-10">

      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-5">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="text-indigo-400">Tip</span>Jar.
            </h1>
            <p className="text-gray-400 mt-2">
              Support creators with ETH on Sepolia
            </p>
          </div>

          <ConnectButton />
        </header>

        {/* Hero */}
        <section className="rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/80 to-slate-900/80 p-8 md:p-12">
          <p className="text-indigo-300 font-semibold mb-3">
            DECENTRALIZED TIPPING PLATFORM
          </p>

          <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-2xl">
            Your appreciation,
            <span className="text-indigo-400"> powered by Web3.</span>
          </h2>

          <p className="text-gray-300 mt-4 max-w-xl">
            Send ETH tips with a personal message.
            Every tip is recorded transparently on the blockchain.
          </p>

          <p className="text-sm text-indigo-200 mt-6">
            Network: Ethereum Sepolia Testnet
          </p>
        </section>

        {isConnected ? (
          <>
            {/* Wallet Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                <p className="text-gray-400 text-sm">Wallet Address</p>
                <p className="font-semibold mt-3 break-all">
                  {address}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                <p className="text-gray-400 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold mt-3 text-indigo-300">
                  {balance
                    ? Number(balance.formatted).toFixed(4)
                    : "Loading..."}{" "}
                  ETH
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                <p className="text-gray-400 text-sm">Total Tips</p>
                <p className="text-3xl font-bold mt-3 text-indigo-300">
                  {tipCount?.toString() ?? "Loading..."}
                </p>
              </div>

            </section>

            {/* Contract Information */}
            <section className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 space-y-3">
              <h3 className="text-lg font-bold">Contract Information</h3>

              <p className="text-sm text-gray-400">Contract Address</p>
              <p className="text-indigo-300 break-all text-sm">
                {TIPJAR_ADDRESS}
              </p>

              <p className="text-sm text-gray-400 pt-2">Contract Owner</p>
              <p className="break-all text-sm">
                {owner?.toString() ?? "Loading..."}
              </p>
            </section>

            {/* Main Actions */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Send Tip */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-7">
                <div className="mb-6">
                  <p className="text-indigo-400 text-sm font-semibold">
                    SUPPORT A CREATOR
                  </p>
                  <h2 className="text-2xl font-bold mt-2">
                    Send a Tip
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">
                    Add an ETH amount and a personal message.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300">
                      Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full border border-white/10 rounded-xl p-4 mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-300">
                      Your Message
                    </label>
                    <input
                      type="text"
                      placeholder="Write something nice..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full border border-white/10 rounded-xl p-4 mt-2"
                    />
                  </div>

                  <button
                    onClick={handleTip}
                    disabled={isPending || isConfirming}
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 p-4 font-bold"
                  >
                    {isPending
                      ? "Confirm in Wallet..."
                      : isConfirming
                      ? "Transaction Pending..."
                      : "Send ETH Tip"}
                  </button>

                  {isSuccess && (
                    <p className="text-green-400 text-sm">
                      Tip sent successfully!
                    </p>
                  )}

                  {hash && (
                    <p className="text-xs text-gray-400 break-all">
                      Transaction: {hash}
                    </p>
                  )}

                  {error && (
                    <p className="text-red-400 text-sm break-words">
                      {error.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Owner Dashboard */}
              <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-7">
                <p className="text-emerald-400 text-sm font-semibold">
                  ADMINISTRATION
                </p>

                <h2 className="text-2xl font-bold mt-2">
                  Owner Dashboard
                </h2>

                {isOwner ? (
                  <>
                    <p className="text-gray-400 mt-3">
                      You are the contract owner. You can withdraw
                      the ETH held by the contract.
                    </p>

                    <button
                      onClick={handleWithdraw}
                      disabled={
                        isWithdrawPending || isWithdrawConfirming
                      }
                      className="w-full mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 p-4 font-bold"
                    >
                      {isWithdrawPending
                        ? "Confirm in Wallet..."
                        : isWithdrawConfirming
                        ? "Withdrawal Pending..."
                        : "Withdraw ETH"}
                    </button>

                    {isWithdrawSuccess && (
                      <p className="text-green-400 mt-3 text-sm">
                        ETH withdrawn successfully!
                      </p>
                    )}

                    {withdrawHash && (
                      <p className="text-xs text-gray-400 break-all mt-3">
                        Withdrawal Transaction: {withdrawHash}
                      </p>
                    )}

                    {withdrawError && (
                      <p className="text-red-400 text-sm break-words mt-3">
                        {withdrawError.message}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 mt-4">
                    Owner access only. Connect the contract owner wallet
                    to use withdrawal.
                  </p>
                )}
              </div>

            </section>

            {/* Tip History */}
            <section className="space-y-5">
              <div>
                <p className="text-indigo-400 text-sm font-semibold">
                  BLOCKCHAIN ACTIVITY
                </p>
                <h2 className="text-3xl font-bold mt-2">
                  Tip History
                </h2>
                <p className="text-gray-400 mt-2">
                  All tips recorded on the Sepolia blockchain.
                </p>
              </div>

              {!tipCount || tipCount === BigInt(0) ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8 text-center text-gray-400">
                  No tips received yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tips?.map((tip, index) => {
                    if (tip.status !== "success") return null;

                    const record = tip.result;

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Tip #{index + 1}
                          </span>
                          <span className="text-xs text-emerald-400">
                            Confirmed
                          </span>
                        </div>

                        <p className="text-2xl font-bold text-indigo-300">
                          {formatEther(record.amount)} ETH
                        </p>

                        <div>
                          <p className="text-gray-500 text-xs">Sender</p>
                          <p className="text-sm break-all">
                            {record.from}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-xs">Message</p>
                          <p>{record.message}</p>
                        </div>

                        <p className="text-xs text-gray-500">
                          {new Date(
                            Number(record.timestamp) * 1000
                          ).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-10 text-center">
            <h2 className="text-2xl font-bold">
              Connect Your Wallet
            </h2>
            <p className="text-gray-400 mt-3">
              Connect MetaMask to send tips and explore TipJar.
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-white/10 pt-6 text-center text-gray-500 text-sm">
          TipJar DApp · Built on Ethereum Sepolia · Powered by Web3
        </footer>

      </div>
    </main>
  );
}
