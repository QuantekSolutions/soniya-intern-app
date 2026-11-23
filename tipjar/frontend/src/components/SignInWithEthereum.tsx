"use client";

import { useState } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { sepolia } from "wagmi/chains";

interface SignInWithEthereumProps {
  onAuthenticated: (address: string) => void;
}

export default function SignInWithEthereum({
  onAuthenticated,
}: SignInWithEthereumProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [verifiedAddress, setVerifiedAddress] = useState("");

  const isSepolia = chainId === sepolia.id;

  async function handleSignIn() {
    if (!address || !isConnected) {
      setStatus("Connect your wallet first.");
      return;
    }

    if (!isSepolia) {
      setStatus("Please switch to Sepolia network.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");
      setVerifiedAddress("");

      const nonceResponse = await fetch("/api/auth/nonce", {
        method: "GET",
        cache: "no-store",
      });

      if (!nonceResponse.ok) {
        throw new Error("Unable to get sign-in nonce. Please try again.");
      }

      const { nonce, domain } = await nonceResponse.json();

      const siweMessage = new SiweMessage({
        domain,
        address,
        statement:
          "Sign in to TipJar DApp. No transaction or gas fee is required.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });

      const message = siweMessage.prepareMessage();

      // MetaMask asks the user to approve this message signature.
      const signature = await signMessageAsync({ message });

      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature }),
      });

      const result = await verifyResponse.json();

      if (!verifyResponse.ok || !result.success || !result.address) {
        throw new Error(
          result.message || "Sign-in verification failed. Please try again."
        );
      }

      setVerifiedAddress(result.address);
      setStatus("Wallet verified successfully.");
      onAuthenticated(result.address);
    } catch (error) {
      console.error("SIWE sign-in error:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.toLowerCase().includes("user rejected") ||
        errorMessage.toLowerCase().includes("user denied")
      ) {
        setStatus(
          "You declined the signature. Please sign the message to unlock TipJar."
        );
      } else {
        setStatus(errorMessage || "Something went wrong during sign-in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-800/70 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-300">
          02
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">
            Sign in with Ethereum
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Sign a message to prove that you own this wallet.
          </p>
        </div>

        {verifiedAddress && (
          <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            Verified ✓
          </span>
        )}
      </div>

      <button
        onClick={handleSignIn}
        disabled={!isConnected || !isSepolia || loading}
        className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!isConnected
          ? "Connect wallet first"
          : !isSepolia
            ? "Switch to Sepolia first"
            : loading
              ? "Verifying..."
              : "Sign in with MetaMask"}
      </button>

      <p className="mt-3 text-xs text-gray-400">
        No blockchain transaction. No gas fee. Your private key is never shared.
      </p>

      {status && (
        <p
          className={`mt-3 break-words text-sm ${
            verifiedAddress ? "text-emerald-400" : "text-red-400"
          }`}
          role="status"
        >
          {status}
        </p>
      )}
    </div>
  );
}
