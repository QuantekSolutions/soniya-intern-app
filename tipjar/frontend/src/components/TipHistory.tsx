
"use client";

import { useEffect, useState } from "react";
import { formatEther, type Address, type Hash } from "viem";
import { useChainId, usePublicClient } from "wagmi";

import {
  TIPJAR_ABI,
  TIPJAR_ADDRESS,
} from "@/lib/contracts";

const SEPOLIA_CHAIN_ID = 11155111;
const CHUNK_SIZE = 2_000n;
const MAX_TIPS = 10n;
const MAX_RETRIES = 3;

interface TipHistoryItem {
  from: Address;
  amount: bigint;
  message: string;
  blockNumber: bigint;
  transactionHash: Hash;
}

interface TipHistoryProps {
  deploymentBlock: bigint;
  refreshKey?: number;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRpcRetry<T>(
  request: () => Promise<T>
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES - 1) {
        await delay(1000 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

export default function TipHistory({
  deploymentBlock,
  refreshKey,
}: TipHistoryProps) {
  const publicClient = usePublicClient({
    chainId: SEPOLIA_CHAIN_ID,
  });

  const chainId = useChainId();

  const [tips, setTips] = useState<TipHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Refresh history using its own button.
  const handleRefresh = () => {
    if (!loading) {
      setRetryCount((count) => count + 1);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchTipHistory() {
      if (!publicClient || chainId !== SEPOLIA_CHAIN_ID) {
        setTips([]);
        setError("Please switch your wallet to Ethereum Sepolia.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        // 1. Read total tips from the smart contract.
        const totalTips = await withRpcRetry(() =>
          publicClient.readContract({
            address: TIPJAR_ADDRESS,
            abi: TIPJAR_ABI,
            functionName: "getTipCount",
          })
        );

        if (cancelled) return;

        const expectedTips =
          totalTips > MAX_TIPS ? MAX_TIPS : totalTips;

        if (expectedTips === 0n) {
          setTips([]);
          return;
        }

        // 2. Get latest Sepolia block.
        const latestBlock = await withRpcRetry(() =>
          publicClient.getBlockNumber()
        );

        if (cancelled) return;

        if (latestBlock < deploymentBlock) {
          setTips([]);
          return;
        }

        // 3. Scan recent blocks backwards.
        let currentToBlock = latestBlock;
        const allTips: TipHistoryItem[] = [];

        while (
          currentToBlock >= deploymentBlock &&
          BigInt(allTips.length) < expectedTips
        ) {
          const currentFromBlock =
            currentToBlock - deploymentBlock + 1n > CHUNK_SIZE
              ? currentToBlock - CHUNK_SIZE + 1n
              : deploymentBlock;

          const events = await withRpcRetry(() =>
            publicClient.getContractEvents({
              address: TIPJAR_ADDRESS,
              abi: TIPJAR_ABI,
              eventName: "TipSent",
              fromBlock: currentFromBlock,
              toBlock: currentToBlock,
            })
          );

          if (cancelled) return;

          // 4. Extract tip details.
          for (const event of events) {
            if (
              event.args.from !== undefined &&
              event.args.amount !== undefined &&
              event.args.message !== undefined &&
              event.blockNumber !== undefined &&
              event.transactionHash !== undefined
            ) {
              allTips.push({
                from: event.args.from,
                amount: event.args.amount,
                message: event.args.message,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
              });
            }
          }

          currentToBlock = currentFromBlock - 1n;
        }

        // 5. Show newest tips first.
        allTips.sort((a, b) =>
          a.blockNumber > b.blockNumber
            ? -1
            : a.blockNumber < b.blockNumber
              ? 1
              : 0
        );

        if (!cancelled) {
          setTips(allTips.slice(0, Number(MAX_TIPS)));
        }
      } catch (err) {
        console.error("Tip history error:", err);

        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : String(err);

          const lowerMessage = message.toLowerCase();

          if (
            message.includes("429") ||
            lowerMessage.includes("too many requests") ||
            lowerMessage.includes("rate limit")
          ) {
            setError(
              "The Sepolia RPC is receiving too many requests. Please wait a moment and try again."
            );
          } else if (
            lowerMessage.includes("failed to fetch") ||
            lowerMessage.includes("network") ||
            lowerMessage.includes("timeout")
          ) {
            setError(
              "Could not connect to the Sepolia RPC. Check your internet connection or RPC API key, then try again."
            );
          } else {
            setError(
              "Unable to load tip history from the blockchain. Please try again."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchTipHistory();

    return () => {
      cancelled = true;
    };
  }, [
    publicClient,
    chainId,
    deploymentBlock,
    retryCount,
    refreshKey,
  ]);

  return (
    <section className="mt-8 rounded-xl border border-gray-700 bg-gray-900 p-6">
      {/* Header and Refresh Button */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Tip History
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Your latest 10 blockchain tips
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "↻ Refreshing..." : "↻ Refresh History"}
        </button>
      </div>

      {loading && (
        <p className="text-gray-400">
          Loading tip history...
        </p>
      )}

      {!loading && error && (
        <div className="space-y-3">
          <p className="break-words rounded-lg border border-red-500/20 bg-red-900/30 p-3 text-sm text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-indigo-500/50 hover:bg-indigo-500/10"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && tips.length === 0 && (
        <p className="text-gray-400">
          No tips found yet.
        </p>
      )}

      {!loading && !error && tips.length > 0 && (
        <div className="space-y-4">
          {tips.map((tip) => (
            <div
              key={tip.transactionHash}
              className="rounded-lg border border-gray-700 bg-gray-800 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-gray-400">
                  From:{" "}
                  <span className="text-white">
                    {tip.from.slice(0, 6)}...
                    {tip.from.slice(-4)}
                  </span>
                </span>

                <span className="font-semibold text-green-400">
                  {formatEther(tip.amount)} ETH
                </span>
              </div>

              <p className="mt-3 break-words text-white">
                {tip.message || "No message"}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                <span>
                  Block: {tip.blockNumber.toString()}
                </span>

                <a
                  href={`https://sepolia.etherscan.io/tx/${tip.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View Transaction ↗
                </a>
              </div>
            </div>
          ))}

          <a
            href={`https://sepolia.etherscan.io/address/${TIPJAR_ADDRESS}#events`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block pt-2 text-sm text-blue-400 hover:underline"
          >
            View More on Etherscan ↗
          </a>
        </div>
      )}
    </section>
  );
}
