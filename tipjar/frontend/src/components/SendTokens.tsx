
"use client";

import { useState } from "react";
import { isAddress, parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";

import {
  QUANTEK_TOKEN_ABI,
  QUANTEK_TOKEN_ADDRESS,
} from "../lib/contracts";

export default function SendTokens() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();

  const cardStyle =
    "space-y-4 rounded-xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg";
  const inputStyle =
    "h-11 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
  const primaryButton =
    "h-11 w-full rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50";

  const {
    data: decimals,
  } = useReadContract({
    address: QUANTEK_TOKEN_ADDRESS,
    abi: QUANTEK_TOKEN_ABI,
    functionName: "decimals",
  });

  const { refetch: refreshBalance } = useReadContracts({
    contracts: [
      {
        address: QUANTEK_TOKEN_ADDRESS,
        abi: QUANTEK_TOKEN_ABI,
        functionName: "balanceOf",
        args: [address ?? "0x0000000000000000000000000000000000000000"],
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
      enabled: Boolean(address),
    },
  });

  const {
    writeContractAsync,
    isPending: isWalletPending,
    error: writeError,
  } = useWriteContract();

  function handleRecipientChange(value: string) {
    if (isConfirmed) {
      setIsConfirmed(false);
      setHash(undefined);
    }
    setRecipient(value);
  }

  function handleAmountChange(value: string) {
    if (isConfirmed) {
      setIsConfirmed(false);
      setHash(undefined);
    }
    setAmount(value);
  }

  async function handleSend() {
    setStatus("");

    if (!isConnected || !address) {
      setStatus("Please connect your wallet.");
      return;
    }

    if (chainId !== 11155111) {
      setStatus("Please switch to Ethereum Sepolia.");
      return;
    }

    if (!isAddress(recipient)) {
      setStatus("Enter a valid recipient address.");
      return;
    }

    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setStatus("Enter a valid token amount.");
      return;
    }

    if (decimals === undefined) {
      setStatus("Token decimals are still loading.");
      return;
    }

    if (!publicClient) {
      setStatus("Blockchain connection is not ready.");
      return;
    }

    let value: bigint;

    try {
      value = parseUnits(amount, decimals);
    } catch {
      setStatus("Invalid token amount.");
      return;
    }

    if (value <= 0n) {
      setStatus("Token amount must be greater than zero.");
      return;
    }

    setHash(undefined);
    setIsConfirmed(false);
    setIsConfirming(false);

    try {
      const transactionHash = await writeContractAsync({
        address: QUANTEK_TOKEN_ADDRESS,
        abi: QUANTEK_TOKEN_ABI,
        functionName: "transfer",
        args: [recipient, value],
      });

      setHash(transactionHash);
      setIsConfirming(true);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      setIsConfirming(false);

      if (receipt.status !== "success") {
        setStatus("Transaction failed. Tokens were not transferred.");
        return;
      }

      setRecipient("");
      setAmount("");
      setIsConfirmed(true);
      setStatus("Tokens transferred successfully!");

      await refreshBalance();
    } catch (error) {
      setIsConfirming(false);
      setStatus(
        error instanceof Error
          ? `Transaction failed: ${error.message}`
          : "Transaction failed."
      );
    }
  }

  return (
    <div className={cardStyle}>
      <div>
        <h2 className="text-lg font-bold text-white">Send Quantek Tokens</h2>
        <p className="mt-1 text-sm text-slate-400">
          Transfer QTK tokens to another wallet.
        </p>
      </div>

      {!isConnected ? (
        <p className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-400">
          Connect your wallet first.
        </p>
      ) : chainId !== 11155111 ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          Please switch to Ethereum Sepolia.
        </p>
      ) : (
        <>
          <input
            className={inputStyle}
            type="text"
            placeholder="Recipient wallet address"
            value={recipient}
            onChange={(e) => handleRecipientChange(e.target.value)}
          />

          <input
            className={inputStyle}
            type="number"
            min="0"
            step="any"
            placeholder="Token amount"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
          />

          <button
            className={primaryButton}
            onClick={handleSend}
            disabled={
              isWalletPending ||
              isConfirming ||
              decimals === undefined
            }
          >
            {isWalletPending
              ? "Waiting for wallet..."
              : isConfirming
                ? "Transaction pending..."
                : "Send Tokens"}
          </button>
        </>
      )}

      {status && (
        <p
          className={`break-words rounded-lg border p-3 text-sm ${
            isConfirmed
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {status}
        </p>
      )}

      {writeError && !hash && (
        <p className="break-words text-sm text-red-400">
          {writeError.message}
        </p>
      )}

      {hash && (
        <a
          className="text-sm text-violet-400 underline"
          href={`https://sepolia.etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
        >
          View transaction on Etherscan
        </a>
      )}
    </div>
  );
}
