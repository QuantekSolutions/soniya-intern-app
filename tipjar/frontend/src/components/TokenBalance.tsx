
"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";

import {
  QUANTEK_TOKEN_ABI,
  QUANTEK_TOKEN_ADDRESS,
} from "../lib/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function TokenBalance() {
  const { address, isConnected, chainId } = useAccount();

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      {
        address: QUANTEK_TOKEN_ADDRESS,
        abi: QUANTEK_TOKEN_ABI,
        functionName: "balanceOf",
        args: [address ?? ZERO_ADDRESS],
      },
      {
        address: QUANTEK_TOKEN_ADDRESS,
        abi: QUANTEK_TOKEN_ABI,
        functionName: "symbol",
      },
      {
        address: QUANTEK_TOKEN_ADDRESS,
        abi: QUANTEK_TOKEN_ABI,
        functionName: "decimals",
      },
    ],
    query: {
      enabled: Boolean(address && isConnected && chainId === 11155111),
    },
  });

  const cardStyle =
    "space-y-4 rounded-xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg";

  const secondaryButton =
    "rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-500 hover:bg-slate-700";

  if (!isConnected || !address) {
    return (
      <div className={cardStyle}>
        <h2 className="text-lg font-bold text-white">Quantek Token Balance</h2>
        <p className="text-sm text-slate-400">
          Connect your wallet to view token balance.
        </p>
      </div>
    );
  }

  if (chainId !== 11155111) {
    return (
      <div className={cardStyle}>
        <h2 className="text-lg font-bold text-white">Quantek Token Balance</h2>
        <p className="text-sm text-red-400">
          Please connect to Ethereum Sepolia.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cardStyle}>
        <h2 className="text-lg font-bold text-white">Quantek Token Balance</h2>
        <p className="text-sm text-slate-400">Loading token balance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cardStyle}>
        <h2 className="text-lg font-bold text-white">Quantek Token Balance</h2>
        <p className="break-words text-sm text-red-400">
          Error: {error.message}
        </p>
      </div>
    );
  }

  const balance = data?.[0];
  const symbol = data?.[1];
  const decimals = data?.[2];

  if (
    balance?.status !== "success" ||
    symbol?.status !== "success" ||
    decimals?.status !== "success"
  ) {
    return (
      <div className={cardStyle}>
        <h2 className="text-lg font-bold text-white">Quantek Token Balance</h2>
        <p className="text-sm text-slate-400">
          Token balance unavailable. Please try again.
        </p>
      </div>
    );
  }

  const formattedBalance = formatUnits(balance.result, decimals.result);

  return (
    <div className={cardStyle}>
      <div>
        <h2 className="text-lg font-bold text-white">Quantek Token Balance</h2>
        <p className="mt-1 text-sm text-slate-400">
          Your available QTK token balance.
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
        <p className="text-3xl font-bold text-white">
          {formattedBalance}{" "}
          <span className="text-violet-400">{symbol.result}</span>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Token Decimals: {decimals.result}
        </p>
      </div>

      <button
        type="button"
        onClick={() => refetch()}
        className={secondaryButton}
      >
        Refresh Balance
      </button>
    </div>
  );
}
