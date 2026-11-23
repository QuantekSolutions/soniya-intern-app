
"use client";

import { useState } from "react";
import {
  isAddress,
  parseUnits,
  formatUnits,
  type Address,
  type Hash,
} from "viem";

import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";

import {
  QUANTEK_TOKEN_ABI,
  QUANTEK_TOKEN_ADDRESS,
} from "../lib/contracts";

const SEPOLIA_CHAIN_ID = 11155111;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const cardStyle =
  "space-y-4 rounded-xl border border-slate-700 bg-slate-900/80 p-5 shadow-lg";
const inputStyle =
  "h-11 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";
const primaryButton =
  "h-11 w-full rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-500 hover:bg-slate-700 disabled:opacity-50";
const labelStyle = "mb-1.5 block text-sm font-medium text-slate-300";

export default function TransferFrom() {
  const { address, isConnected, chainId } = useAccount();

  const publicClient = usePublicClient({
    chainId: SEPOLIA_CHAIN_ID,
  });

  const [owner, setOwner] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<Hash>();
  const [message, setMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [receiptError, setReceiptError] = useState(false);

  const validOwner = isAddress(owner);
  const isSepolia = chainId === SEPOLIA_CHAIN_ID;

  const {
    data: decimals,
    isLoading: decimalsLoading,
  } = useReadContract({
    address: QUANTEK_TOKEN_ADDRESS,
    abi: QUANTEK_TOKEN_ABI,
    functionName: "decimals",
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: isConnected && isSepolia,
    },
  });

  const {
    data: allowance,
    isLoading: allowanceLoading,
    error: allowanceError,
    refetch: refreshAllowance,
  } = useReadContract({
    address: QUANTEK_TOKEN_ADDRESS,
    abi: QUANTEK_TOKEN_ABI,
    functionName: "allowance",
    args: [
      validOwner ? (owner as Address) : ZERO_ADDRESS,
      address ?? ZERO_ADDRESS,
    ],
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: Boolean(address && validOwner && isSepolia),
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  async function handleTransferFrom() {
    setMessage("");
    setTxHash(undefined);
    setIsConfirmed(false);
    setReceiptError(false);

    if (!isConnected || !address) {
      setMessage("Please connect the spender wallet.");
      return;
    }

    if (!isSepolia) {
      setMessage("Please switch to Ethereum Sepolia.");
      return;
    }

    if (!publicClient) {
      setMessage("Unable to connect to Sepolia RPC.");
      return;
    }

    if (!validOwner) {
      setMessage("Please enter a valid owner wallet address.");
      return;
    }

    if (!isAddress(recipient)) {
      setMessage("Please enter a valid recipient wallet address.");
      return;
    }

    if (owner.toLowerCase() === recipient.toLowerCase()) {
      setMessage("Owner and recipient addresses must be different.");
      return;
    }

    if (!amount || !/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) {
      setMessage("Please enter a valid positive amount.");
      return;
    }

    if (decimals === undefined) {
      setMessage("Token decimals are still loading.");
      return;
    }

    try {
      const transferAmount = parseUnits(amount, decimals);
      const result = await refreshAllowance();
      const currentAllowance = result.data;

      if (currentAllowance === undefined) {
        setMessage("Unable to read allowance. Check the owner address and network.");
        return;
      }

      if (transferAmount > currentAllowance) {
        setMessage(
          `Insufficient allowance. Available: ${formatUnits(
            currentAllowance,
            decimals
          )} QTK`
        );
        return;
      }

      const hash = await writeContractAsync({
        address: QUANTEK_TOKEN_ADDRESS,
        abi: QUANTEK_TOKEN_ABI,
        functionName: "transferFrom",
        args: [owner as Address, recipient as Address, transferAmount],
        chainId: SEPOLIA_CHAIN_ID,
      });

      setTxHash(hash);
      setMessage("Transaction submitted. Waiting for confirmation...");
      setIsConfirming(true);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== "success") {
        setReceiptError(true);
        setMessage("Transfer transaction failed on blockchain.");
        return;
      }

      try {
        await refreshAllowance();
      } catch {
        // Transaction is confirmed even if allowance refresh fails.
      }

      setOwner("");
      setRecipient("");
      setAmount("");
      setIsConfirmed(true);
      setMessage("Transfer confirmed successfully!");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Transfer transaction failed."
      );
    } finally {
      setIsConfirming(false);
    }
  }

  const formattedAllowance =
    allowance !== undefined && decimals !== undefined
      ? formatUnits(allowance, decimals)
      : null;

  return (
    <div className={cardStyle}>
      <div>
        <h2 className="text-lg font-bold text-white">Transfer From (QTK)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Transfer tokens from an owner wallet using previously approved allowance.
        </p>
      </div>

      {!isConnected ? (
        <p className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-400">
          Connect your spender wallet to continue.
        </p>
      ) : !isSepolia ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          Please switch your wallet to Ethereum Sepolia.
        </p>
      ) : (
        <>
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
            <p className="text-xs font-semibold text-slate-400">
              Connected Spender Wallet
            </p>
            <p className="mt-1 break-all text-sm text-slate-200">{address}</p>
          </div>

          <div>
            <label className={labelStyle}>Owner Wallet Address</label>
            <input
              type="text"
              value={owner}
              onChange={(event) => {
                setOwner(event.target.value.trim());
                setMessage("");
                setIsConfirmed(false);
              }}
              placeholder="Enter wallet A address"
              className={inputStyle}
            />
          </div>

          {validOwner && (
            <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4">
              <p className="text-sm font-semibold text-slate-200">
                Available Allowance
              </p>

              {allowanceLoading || decimalsLoading ? (
                <p className="mt-2 text-sm text-slate-400">Loading allowance...</p>
              ) : formattedAllowance !== null ? (
                <p className="mt-2 text-2xl font-bold text-white">
                  {formattedAllowance} <span className="text-violet-400">QTK</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-red-400">
                  Unable to load allowance.
                </p>
              )}

              {allowanceError && (
                <p className="mt-1 break-words text-xs text-red-400">
                  {allowanceError.message}
                </p>
              )}

              <button
                type="button"
                onClick={() => refreshAllowance()}
                className={`mt-3 ${secondaryButton}`}
              >
                Refresh Allowance
              </button>
            </div>
          )}

          <div>
            <label className={labelStyle}>Recipient Wallet Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(event) => {
                setRecipient(event.target.value.trim());
                setMessage("");
                setIsConfirmed(false);
              }}
              placeholder="Enter recipient address"
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Amount (QTK)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setMessage("");
                setIsConfirmed(false);
              }}
              placeholder="Enter QTK amount"
              className={inputStyle}
            />
          </div>

          <button
            type="button"
            onClick={handleTransferFrom}
            disabled={isPending || isConfirming || decimalsLoading}
            className={primaryButton}
          >
            {isPending
              ? "Waiting for Wallet..."
              : isConfirming
                ? "Confirming Transaction..."
                : "Transfer From"}
          </button>

          {message && (
            <p
              className={`break-words rounded-lg border p-3 text-sm ${
                isConfirmed
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : receiptError || message.toLowerCase().includes("failed") ||
                      message.toLowerCase().includes("insufficient") ||
                      message.toLowerCase().includes("please") ||
                      message.toLowerCase().includes("unable")
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-300"
              }`}
            >
              {message}
            </p>
          )}

          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all text-sm text-violet-400 underline"
            >
              View Transaction on Etherscan
            </a>
          )}

          {isConfirmed && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <p className="font-semibold text-green-400">
                Transfer confirmed successfully!
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Tokens have been transferred to the recipient. All form inputs have been cleared.
              </p>
            </div>
          )}

          {receiptError && (
            <p className="text-sm text-red-400">
              Transaction confirmation failed. Check Etherscan.
            </p>
          )}
        </>
      )}
    </div>
  );
}
