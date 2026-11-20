
"use client";

import { useEffect, useState } from "react";
import { formatEther, type Address, type Hash } from "viem";
import { useChainId, usePublicClient } from "wagmi";
import {
  TIPJAR_ABI,
  TIPJAR_ADDRESS,
} from "@/lib/contracts";

const SEPOLIA_CHAIN_ID = 11155111;
const CHUNK_SIZE = 10n;
const MAX_TIPS = 10n;
const REQUEST_DELAY = 250;

interface TipHistoryItem {
  from: Address;
  amount: bigint;
  message: string;
  blockNumber: bigint;
  transactionHash: Hash;
}

interface TipHistoryProps {
  deploymentBlock: bigint;
}

// Prevent duplicate scanning during React Strict Mode
let activeHistoryRequest: Promise<TipHistoryItem[]> | null = null;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function TipHistory({
  deploymentBlock,
}: TipHistoryProps) {
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const [tips, setTips] = useState<TipHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchTipHistory() {
      if (!publicClient || chainId !== SEPOLIA_CHAIN_ID) {
        setTips([]);
        setError("Please connect your wallet to Sepolia.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Reuse an existing request if React runs the effect twice.
        const request =
          activeHistoryRequest ??
          (activeHistoryRequest = (async () => {
            // Step 1: Read total tips from the contract
            const totalTips = await publicClient.readContract({
              address: TIPJAR_ADDRESS,
              abi: TIPJAR_ABI,
              functionName: "getTipCount",
            });

            const expectedTips =
              totalTips > MAX_TIPS ? MAX_TIPS : totalTips;

            if (expectedTips === 0n) {
              return [];
            }

            // Step 2: Get the latest block
            const latestBlock = await publicClient.getBlockNumber();

            let currentToBlock = latestBlock;
            const allTips: TipHistoryItem[] = [];

            // Step 3: Scan backwards in 10-block chunks
            while (
              currentToBlock >= deploymentBlock &&
              BigInt(allTips.length) < expectedTips
            ) {
              const currentFromBlock =
                currentToBlock - deploymentBlock + 1n > CHUNK_SIZE
                  ? currentToBlock - CHUNK_SIZE + 1n
                  : deploymentBlock;

              let events;

              // Retry rate-limited requests up to 3 times
              for (let attempt = 0; attempt < 3; attempt++) {
                try {
                  events = await publicClient.getContractEvents({
                    address: TIPJAR_ADDRESS,
                    abi: TIPJAR_ABI,
                    eventName: "TipSent",
                    fromBlock: currentFromBlock,
                    toBlock: currentToBlock,
                  });

                  break;
                } catch (err) {
                  const message =
                    err instanceof Error ? err.message : String(err);

                  const isRateLimited =
                    message.includes("429") ||
                    message.toLowerCase().includes("too many requests") ||
                    message.toLowerCase().includes("rate limit");

                  if (!isRateLimited || attempt === 2) {
                    throw err;
                  }

                  await delay(1500 * (attempt + 1));
                }
              }

              // Step 4: Extract event details
              for (const event of events ?? []) {
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

              // Move to the previous block range
              currentToBlock = currentFromBlock - 1n;

              // Avoid sending requests too quickly
              if (
                currentToBlock >= deploymentBlock &&
                BigInt(allTips.length) < expectedTips
              ) {
                await delay(REQUEST_DELAY);
              }
            }

            // Step 5: Sort newest tips first
            allTips.sort((a, b) =>
              a.blockNumber > b.blockNumber
                ? -1
                : a.blockNumber < b.blockNumber
                  ? 1
                  : 0
            );

            return allTips.slice(0, Number(MAX_TIPS));
          })());

        const result = await request;

        if (!cancelled) {
          setTips(result);
        }
      } catch (err) {
        console.error("Tip history error:", err);

        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : String(err);

          if (
            message.includes("429") ||
            message.toLowerCase().includes("too many requests") ||
            message.toLowerCase().includes("rate limit")
          ) {
            setError(
              "Alchemy rate limit reached. Please wait a little and refresh."
            );
          } else {
            setError("Unable to load tip history. Please try again.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }

        // Clear the shared request after completion
        if (activeHistoryRequest) {
          activeHistoryRequest = null;
        }
      }
    }

    fetchTipHistory();

    return () => {
      cancelled = true;
    };
  }, [publicClient, chainId, deploymentBlock]);

  return (
    <section className="mt-8 rounded-xl border border-gray-700 bg-gray-900 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          Tip History
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Your latest 10 blockchain tips
        </p>
      </div>

      {loading && (
        <p className="text-gray-400">
          Loading tip history...
        </p>
      )}

      {!loading && error && (
        <p className="break-words rounded-lg bg-red-900/30 p-3 text-sm text-red-400">
          {error}
        </p>
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
