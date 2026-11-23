
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
  "rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-500 hover:bg-slate-700";
const labelStyle = "mb-1.5 block text-sm font-medium text-slate-300";

export default function ApproveTokens() {
  const { address, isConnected, chainId } = useAccount();

  const publicClient = usePublicClient({
    chainId: SEPOLIA_CHAIN_ID,
  });

  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<Hash>();
  const [message, setMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    data: decimals,
    isLoading: decimalsLoading,
  } = useReadContract({
    address: QUANTEK_TOKEN_ADDRESS,
    abi: QUANTEK_TOKEN_ABI,
    functionName: "decimals",
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: isConnected && chainId === SEPOLIA_CHAIN_ID,
    },
  });

  const validSpender = isAddress(spender);

  const {
    data: allowance,
    refetch: refreshAllowance,
  } = useReadContract({
    address: QUANTEK_TOKEN_ADDRESS,
    abi: QUANTEK_TOKEN_ABI,
    functionName: "allowance",
    args: [
      address ?? ZERO_ADDRESS,
      validSpender ? (spender as Address) : ZERO_ADDRESS,
    ],
    chainId: SEPOLIA_CHAIN_ID,
    query: {
      enabled: Boolean(
        address && validSpender && chainId === SEPOLIA_CHAIN_ID
      ),
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  async function handleApprove() {
    setMessage("");
    setTxHash(undefined);

    if (!isConnected || !address) {
      setMessage("Please connect your wallet.");
      return;
    }

    if (chainId !== SEPOLIA_CHAIN_ID) {
      setMessage("Please switch to Ethereum Sepolia.");
      return;
    }

    if (!publicClient) {
      setMessage("Unable to connect to Sepolia RPC.");
      return;
    }

    if (!isAddress(spender)) {
      setMessage("Please enter a valid spender address.");
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
      const approvalAmount = parseUnits(amount, decimals);

      const hash = await writeContractAsync({
        address: QUANTEK_TOKEN_ADDRESS,
        abi: QUANTEK_TOKEN_ABI,
        functionName: "approve",
        args: [spender as Address, approvalAmount],
        chainId: SEPOLIA_CHAIN_ID,
      });

      setTxHash(hash);
      setMessage("Transaction submitted. Waiting for confirmation...");
      setIsConfirming(true);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== "success") {
        setMessage("Approval transaction failed on blockchain.");
        return;
      }

      await refreshAllowance();

      setSpender("");
      setAmount("");
      setMessage("Approval confirmed successfully!");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Approval transaction failed."
      );
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className={cardStyle}>
      <div>
        <h2 className="text-lg font-bold text-white">Approve QTK Tokens</h2>
        <p className="mt-1 text-sm text-slate-400">
          Allow another wallet to spend your QTK tokens.
        </p>
      </div>

      {!isConnected ? (
        <p className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-400">
          Connect your wallet to approve tokens.
        </p>
      ) : chainId !== SEPOLIA_CHAIN_ID ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          Please connect to Ethereum Sepolia.
        </p>
      ) : (
        <>
          <div>
            <label className={labelStyle}>Spender Wallet Address</label>
            <input
              type="text"
              value={spender}
              onChange={(event) => {
                setSpender(event.target.value.trim());
                setMessage("");
              }}
              placeholder="Enter spender address"
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Approval Amount (QTK)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setMessage("");
              }}
              placeholder="Enter amount"
              className={inputStyle}
            />
          </div>

          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending || isConfirming || decimalsLoading}
            className={primaryButton}
          >
            {isPending
              ? "Waiting for Wallet..."
              : isConfirming
                ? "Confirming..."
                : "Approve Tokens"}
          </button>

          {allowance !== undefined &&
            validSpender &&
            decimals !== undefined && (
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <p className="text-sm text-slate-400">Current Allowance</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {formatUnits(allowance, decimals)}{" "}
                  <span className="text-violet-400">QTK</span>
                </p>
              </div>
            )}

          {message && (
            <p
              className={`break-words rounded-lg border p-3 text-sm ${
                message.includes("successfully")
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : message.includes("submitted")
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                    : "border-red-500/30 bg-red-500/10 text-red-400"
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
              View Approval Transaction on Etherscan
            </a>
          )}

          {message === "Approval confirmed successfully!" && (
            <button
              type="button"
              onClick={() => refreshAllowance()}
              className={secondaryButton}
            >
              Refresh Allowance
            </button>
          )}
        </>
      )}
    </div>
  );
}
