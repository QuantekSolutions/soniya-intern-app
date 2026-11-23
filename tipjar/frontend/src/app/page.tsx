
"use client";

import { useState } from "react";
import {
  formatEther,
  parseEther,
  type Hash,
} from "viem";

import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  usePublicClient,
  useChainId,
  useSwitchChain,
} from "wagmi";

import { sepolia } from "wagmi/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { TIPJAR_ABI, TIPJAR_ADDRESS } from "@/lib/contracts";

import TokenBalance from "@/components/TokenBalance";
import SendTokens from "@/components/SendTokens";
import TransferFrom from "@/components/TransferFrom";
import ApproveTokens from "@/components/ApproveTokens";
import TipHistory from "@/components/TipHistory";
import SignInWithEthereum from "@/components/SignInWithEthereum";

const EXPLORER_URL = "https://sepolia.etherscan.io";

const cardClass =
  "rounded-2xl border border-white/10 bg-[#101729] p-6 shadow-lg shadow-black/10";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#080f20] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const primaryButtonClass =
  "w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className={`${cardClass} min-w-0`}>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-3 break-all text-xl font-bold text-white md:text-2xl">
        {value}
      </p>
      {detail && (
        <p className="mt-2 text-xs text-slate-500">{detail}</p>
      )}
    </div>
  );
}

export default function Home() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [tipHash, setTipHash] = useState<Hash | undefined>();
  const [withdrawHash, setWithdrawHash] = useState<Hash | undefined>();

  const [isTipConfirming, setIsTipConfirming] = useState(false);
  const [isWithdrawConfirming, setIsWithdrawConfirming] = useState(false);

  const [tipSuccess, setTipSuccess] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [authorizedAddress, setAuthorizedAddress] = useState("");
  const [isDashboardRefreshing, setIsDashboardRefreshing] = useState(false);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isSepolia = chainId === sepolia.id;

  const isAuthorized =
    isConnected &&
    isSepolia &&
    !!address &&
    !!authorizedAddress &&
    address.toLowerCase() === authorizedAddress.toLowerCase();

  const publicClient = usePublicClient({
    chainId: sepolia.id,
  });

  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isFetching: isBalanceFetching,
    error: balanceError,
    refetch: refetchWalletBalance,
  } = useBalance({
    address,
    chainId: sepolia.id,
    query: {
      enabled: !!address && isAuthorized,
    },
  });

  const {
    data: contractBalance,
    isLoading: isContractBalanceLoading,
    isFetching: isContractBalanceFetching,
    error: contractBalanceError,
    refetch: refetchContractBalance,
  } = useBalance({
    address: TIPJAR_ADDRESS,
    chainId: sepolia.id,
    query: { enabled: isAuthorized },
  });

  const {
    data: tipCount,
    isLoading: isTipCountLoading,
    isFetching: isTipCountFetching,
    error: tipCountError,
    refetch: refetchTipCount,
  } = useReadContract({
    address: TIPJAR_ADDRESS,
    abi: TIPJAR_ABI,
    functionName: "getTipCount",
    chainId: sepolia.id,
    query: { enabled: isAuthorized },
  });

  const {
    data: owner,
    isLoading: isOwnerLoading,
    isFetching: isOwnerFetching,
    error: ownerReadError,
    refetch: refetchOwner,
  } = useReadContract({
    address: TIPJAR_ADDRESS,
    abi: TIPJAR_ABI,
    functionName: "owner",
    chainId: sepolia.id,
    query: { enabled: isAuthorized },
  });

  const isOwner =
    !!address &&
    !!owner &&
    address.toLowerCase() === owner.toLowerCase();

  const {
    writeContractAsync: writeTip,
    isPending,
    error,
    reset: resetTip,
  } = useWriteContract();

  const {
    writeContractAsync: withdrawContract,
    isPending: isWithdrawPending,
    error: withdrawError,
    reset: resetWithdraw,
  } = useWriteContract();

  // Refresh all dashboard blockchain reads without reloading the page.
  const refreshDashboard = async () => {
    if (!isAuthorized || isDashboardRefreshing) return;

    setIsDashboardRefreshing(true);

    try {
      const results = await Promise.allSettled([
        refetchWalletBalance(),
        refetchContractBalance(),
        refetchTipCount(),
        refetchOwner(),
      ]);

      setDashboardRefreshKey((previous) => previous + 1);

      setHistoryRefreshKey((previous) => previous + 1);

      const failed = results.filter(
        (result) => result.status === "rejected"
      );

      if (failed.length > 0) {
        console.error("Some dashboard data could not refresh:", failed);
      }
    } finally {
      setIsDashboardRefreshing(false);
    }
  };

  const handleTip = async () => {
    if (!isSepolia) {
      alert("Please switch to Ethereum Sepolia network first.");
      return;
    }

    if (!isConnected || !address) {
      alert("Please connect your wallet.");
      return;
    }

    if (!isAuthorized) {
      alert("Please sign in and authorize your wallet first.");
      return;
    }

    if (
      !amount.trim() ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      alert("Enter a valid ETH amount.");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    let tipAmount: bigint;

    try {
      tipAmount = parseEther(amount);
    } catch {
      alert("Invalid ETH amount.");
      return;
    }

    if (tipAmount <= 0n) {
      alert("ETH amount must be greater than zero.");
      return;
    }

    if (!publicClient) {
      alert("Blockchain connection is not ready.");
      return;
    }

    resetTip();
    setTipHash(undefined);
    setTipSuccess(false);
    setIsTipConfirming(true);

    try {
      const transactionHash = await writeTip({
        address: TIPJAR_ADDRESS,
        abi: TIPJAR_ABI,
        functionName: "tip",
        args: [message.trim()],
        value: tipAmount,
        chainId: sepolia.id,
      });

      setTipHash(transactionHash);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (receipt.status === "success") {
        setAmount("");
        setMessage("");
        setTipSuccess(true);
        await refreshDashboard();
      } else {
        alert("Tip transaction failed.");
      }
    } catch (transactionError) {
      console.error("Tip transaction failed:", transactionError);
    } finally {
      setIsTipConfirming(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isSepolia) {
      alert("Please switch to Ethereum Sepolia network first.");
      return;
    }

    if (!isConnected || !address) {
      alert("Please connect your wallet.");
      return;
    }

    if (!isAuthorized) {
      alert("Please sign in and authorize your wallet first.");
      return;
    }

    if (!isOwner) {
      alert("Only the contract owner can withdraw.");
      return;
    }

    if (!withdrawAmount.trim()) {
      alert("Please enter the ETH amount to withdraw.");
      return;
    }

    let amountInWei: bigint;

    try {
      amountInWei = parseEther(withdrawAmount);
    } catch {
      alert("Please enter a valid ETH amount.");
      return;
    }

    if (amountInWei <= 0n) {
      alert("Withdrawal amount must be greater than zero.");
      return;
    }

    if (!contractBalance || contractBalance.value <= 0n) {
      alert("No ETH available in the TipJar contract.");
      return;
    }

    if (amountInWei > contractBalance.value) {
      alert(
        `Insufficient contract balance. Available: ${formatEther(
          contractBalance.value
        )} ETH`
      );
      return;
    }

    if (!publicClient) {
      alert("Blockchain connection is not ready.");
      return;
    }

    resetWithdraw();
    setWithdrawHash(undefined);
    setWithdrawSuccess(false);
    setIsWithdrawConfirming(true);

    try {
      const transactionHash = await withdrawContract({
        address: TIPJAR_ADDRESS,
        abi: TIPJAR_ABI,
        functionName: "withdraw",
        args: [amountInWei],
        chainId: sepolia.id,
      });

      setWithdrawHash(transactionHash);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (receipt.status === "success") {
        setWithdrawSuccess(true);
        setWithdrawAmount("");
        await refreshDashboard();
      } else {
        alert("Withdrawal transaction failed.");
      }
    } catch (transactionError) {
      console.error("Withdrawal transaction failed:", transactionError);
    } finally {
      setIsWithdrawConfirming(false);
    }
  };

  const formattedWalletBalance =
    isBalanceLoading
      ? "Loading..."
      : balanceError
        ? "Unavailable"
        : balance
          ? `${Number(balance.formatted).toFixed(4)} ETH`
          : "0.0000 ETH";

  const formattedContractBalance =
    isContractBalanceLoading
      ? "Loading..."
      : contractBalanceError
        ? "Unavailable"
        : contractBalance
          ? `${formatEther(contractBalance.value)} ETH`
          : "0 ETH";

  const isAnyDashboardFetching =
    isBalanceFetching ||
    isContractBalanceFetching ||
    isTipCountFetching ||
    isOwnerFetching;

  return (
    <main className="min-h-screen bg-[#080d19] px-4 py-6 text-white md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-indigo-400">Tip</span>Jar
              <span className="text-indigo-400">.</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Decentralized creator support platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Ethereum Sepolia
            </span>
            <ConnectButton />
          </div>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-[#171d43] via-[#111a32] to-[#0d1425] p-7 md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
              Transparent. Decentralized. On-chain.
            </p>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Built for Creators.
              <span className="block text-indigo-400">
                Powered by Blockchain.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              A secure and seamless decentralized platform that enables users to support creators with ETH, manage QTK tokens, and transparently track blockchain transactions on the Ethereum Sepolia network.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {["ETH tipping", "ERC-20 token management", "On-chain history"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* DISCONNECTED STATE */}
        {!isConnected && (
          <section className={`${cardClass} flex flex-col items-center justify-center gap-3 py-10 text-center`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl text-indigo-300">
              ◈
            </div>
            <h2 className="text-xl font-bold">
              Your Web3 workspace is ready
            </h2>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Connect your wallet using the button in the top-right corner.
              Sign in with MetaMask to authorize your wallet and unlock your
              dashboard, token tools, ETH tipping, and transaction history.
            </p>
          </section>
        )}

        {/* CONNECTED WORKSPACE */}
        {isConnected && (
          <>
            {/* SIWE AUTHENTICATION */}
            {!isAuthorized ? (
              <section className={`${cardClass} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-400">
                    Wallet authentication
                  </p>
                  <h2 className="mt-2 text-lg font-bold">
                    Sign in to unlock TipJar
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Sign a message in MetaMask to prove that this wallet belongs to you.
                    Signing is not a transaction and does not require gas.
                  </p>
                  <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    ⚠ Please sign in to authorize your wallet. All dashboard features
                    will remain locked until you sign and your wallet is verified.
                  </p>
                </div>
                <div className="w-full md:max-w-sm">
                  <SignInWithEthereum
                    onAuthenticated={(verifiedAddress) =>
                      setAuthorizedAddress(verifiedAddress)
                    }
                  />
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="font-semibold text-emerald-300">
                  ✓ Wallet authorized successfully
                </p>
                <p className="mt-1 text-sm text-emerald-200/80">
                  You are signed in. Your TipJar dashboard is now unlocked.
                </p>
              </section>
            )}

            {/* NETWORK WARNING */}
            {!isSepolia && (
              <section className="flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-bold text-amber-300">
                    Switch to Ethereum Sepolia
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Your wallet is connected to a different network.
                    Switch networks to use TipJar and QTK features.
                  </p>
                </div>
                <button
                  onClick={() => switchChain({ chainId: sepolia.id })}
                  disabled={isSwitching}
                  className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {isSwitching ? "Switching..." : "Switch Network"}
                </button>
              </section>
            )}

            {isAuthorized && (
              <>
                {/* OVERVIEW */}
                <section>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading
                      eyebrow="Account overview"
                      title="DASHBOARD"
                      description="Monitor your wallet balance, TipJar activity, and smart contract interactions in one place."
                    />

                    <button
                      onClick={refreshDashboard}
                      disabled={isDashboardRefreshing}
                      className="mb-5 inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg
                        className={`h-4 w-4 ${isDashboardRefreshing ? "animate-spin" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 7v5h-5" />
                        <path d="M4 17v-5h5" />
                        <path d="M5.6 9A7 7 0 0 1 18.5 6L20 12" />
                        <path d="M18.4 15A7 7 0 0 1 5.5 18L4 12" />
                      </svg>
                      {isDashboardRefreshing
                        ? "Refreshing..."
                        : "Refresh Dashboard"}
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      label="Connected Wallet"
                      value={
                        address
                          ? `${address.slice(0, 6)}...${address.slice(-4)}`
                          : "Not connected"
                      }
                      detail="Active wallet address"
                    />
                    <StatCard
                      label="Wallet Balance"
                      value={formattedWalletBalance}
                      detail="Available Sepolia ETH"
                    />
                    <StatCard
                      label="Total Tips"
                      value={
                        isTipCountLoading
                          ? "Loading..."
                          : tipCountError
                            ? "Unavailable"
                            : tipCount?.toString() ?? "0"
                      }
                      detail="Recorded on the TipJar contract"
                    />
                    <StatCard
                      label="TipJar Contract Balance"
                      value={formattedContractBalance}
                      detail="ETH held by the contract"
                    />
                  </div>

                  {isAnyDashboardFetching && (
                    <p className="mt-3 text-xs text-indigo-300">
                      Updating blockchain data...
                    </p>
                  )}

                  {balanceError && (
                    <p className="mt-3 break-words text-xs text-red-400">
                      Wallet balance: {balanceError.message}
                    </p>
                  )}
                  {tipCountError && (
                    <p className="mt-2 break-words text-xs text-red-400">
                      Tip count: {tipCountError.message}
                    </p>
                  )}
                </section>

                {/* ETH ACTIONS */}
                <section>
                  <SectionHeading
                    eyebrow="Ethereum"
                    title="Manage ETH"
                    description="Make a direct ETH contribution and leave a message for the recipient."
                  />

                  <div className="grid items-start gap-5 lg:grid-cols-2">
                    {/* SEND TIP */}
                    <div className={cardClass}>
                      <div className="mb-6">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-xl text-indigo-300">
                          ↗
                        </div>
                        <h3 className="text-xl font-bold">Send a tip</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Make a direct ETH contribution and leave a message for the recipient.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-300">
                            Tip amount (ETH)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="e.g. 0.001"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-300">
                            Message to Recipient
                          </label>
                          <textarea
                            placeholder="Write a message for the creator..."
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            rows={3}
                            className={`${inputClass} resize-none`}
                          />
                        </div>

                        <button
                          onClick={handleTip}
                          disabled={!isSepolia || isPending || isTipConfirming}
                          className={primaryButtonClass}
                        >
                          {!isSepolia
                            ? "Switch to Sepolia"
                            : isPending
                              ? "Confirm in Wallet..."
                              : isTipConfirming
                                ? "Confirming Transaction..."
                                : "Send ETH Tip"}
                        </button>

                        {tipSuccess && (
                          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                            Your tip was confirmed successfully.
                          </p>
                        )}

                        {tipHash && (
                          <a
                            href={`${EXPLORER_URL}/tx/${tipHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-all text-sm text-indigo-300 hover:underline"
                          >
                            View transaction on Etherscan ↗
                          </a>
                        )}

                        {error && (
                          <p className="break-words text-sm text-red-400">
                            {error.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* OWNER WITHDRAWAL */}
                    <div className={cardClass}>
                      <div className="mb-6">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-xl text-emerald-300">
                          ↓
                        </div>
                        <h3 className="text-xl font-bold">Owner withdrawal</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          Manage contract funds and securely withdraw available ETH. Restricted to the authorized contract owner.
                        </p>
                      </div>

                      {isOwnerLoading ? (
                        <p className="text-sm text-slate-400">
                          Verifying contract ownership...
                        </p>
                      ) : ownerReadError ? (
                        <p className="break-words text-sm text-red-400">
                          Unable to verify ownership: {ownerReadError.message}
                        </p>
                      ) : isOwner ? (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-white/10 bg-[#080f20] p-4">
                            <p className="text-xs font-medium text-slate-400">
                              Available contract funds
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-300">
                              {formattedContractBalance}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-slate-300">
                              Withdrawal amount (ETH)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="Enter amount to withdraw"
                              value={withdrawAmount}
                              onChange={(event) => {
                                setWithdrawAmount(event.target.value);
                                setWithdrawSuccess(false);
                              }}
                              className={inputClass}
                            />
                            <p className="mt-2 text-xs text-slate-500">
                              The amount cannot exceed the available contract balance.
                            </p>
                          </div>

                          <button
                            onClick={handleWithdraw}
                            disabled={
                              !isSepolia ||
                              isWithdrawPending ||
                              isWithdrawConfirming ||
                              isContractBalanceLoading ||
                              !contractBalance ||
                              contractBalance.value <= 0n ||
                              !withdrawAmount.trim()
                            }
                            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {!isSepolia
                              ? "Switch to Sepolia"
                              : isWithdrawPending
                                ? "Confirm in Wallet..."
                                : isWithdrawConfirming
                                  ? "Confirming Withdrawal..."
                                  : "Withdraw ETH"}
                          </button>

                          {withdrawSuccess && (
                            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                              Withdrawal confirmed successfully.
                            </p>
                          )}

                          {withdrawHash && (
                            <a
                              href={`${EXPLORER_URL}/tx/${withdrawHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block break-all text-sm text-indigo-300 hover:underline"
                            >
                              View withdrawal on Etherscan ↗
                            </a>
                          )}

                          {withdrawError && (
                            <p className="break-words text-sm text-red-400">
                              {withdrawError.message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-[#080f20] p-4">
                          <p className="text-sm font-medium text-slate-300">
                            Restricted access
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            The connected wallet is not the contract owner.
                            Connect the owner wallet to access withdrawal controls.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* QTK TOKEN MANAGEMENT */}
                <section>
                  <SectionHeading
                    eyebrow="Quantek token"
                    title="QTK token management"
                    description="Track your QTK balance, transfer tokens, manage spending approvals, and execute allowance-based transfers."
                  />

                  {!isSepolia ? (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-amber-300">
                      Switch to Ethereum Sepolia to access QTK token features.
                    </div>
                  ) : (
                    <div className="grid items-stretch gap-5 md:grid-cols-2">
                      <div className={`${cardClass} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!p-0`}>
                        <TokenBalance refreshKey={dashboardRefreshKey} />
                      </div>

                      <div className={`${cardClass} [&_input]:!rounded-xl [&_input]:!border-white/10 [&_input]:!bg-[#080f20] [&_input]:!text-white [&_button]:!rounded-xl [&_button]:!bg-indigo-600 [&_button]:!font-semibold`}>
                        <SendTokens />
                      </div>

                      <div className={`${cardClass} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!p-0 [&_input]:!rounded-xl [&_input]:!border-white/10 [&_input]:!bg-[#080f20] [&_input]:!text-white [&_button]:!rounded-xl [&_button]:!bg-indigo-600 [&_button]:!font-semibold`}>
                        <ApproveTokens />
                      </div>

                      <div className={`${cardClass} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!p-0 [&_input]:!rounded-xl [&_input]:!border-white/10 [&_input]:!bg-[#080f20] [&_input]:!text-white [&_button]:!rounded-xl [&_button]:!bg-indigo-600 [&_button]:!font-semibold`}>
                        <TransferFrom />
                      </div>
                    </div>
                  )}
                </section>

                {/* CONTRACT INFORMATION */}
                <section>
                  <SectionHeading
                    eyebrow="Smart contract"
                    title="Contract information"
                    description="Review the deployed TipJar contract and its current on-chain status."
                  />

                  <div className={cardClass}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Contract address
                        </p>
                        <p className="mt-2 break-all text-sm font-medium text-indigo-300">
                          {TIPJAR_ADDRESS}
                        </p>
                        <a
                          href={`${EXPLORER_URL}/address/${TIPJAR_ADDRESS}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm text-indigo-400 hover:underline"
                        >
                          View on Etherscan ↗
                        </a>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Contract owner
                        </p>
                        <p className="mt-2 break-all text-sm text-slate-200">
                          {isOwnerLoading
                            ? "Loading owner..."
                            : ownerReadError
                              ? "Owner information unavailable"
                              : owner?.toString() ?? "Owner not found"}
                        </p>
                        {owner && (
                          <p className="mt-2 text-xs text-slate-500">
                            {isOwner
                              ? "Your connected wallet is the contract owner."
                              : "Your connected wallet does not have owner privileges."}
                          </p>
                        )}
                      </div>
                    </div>

                    {ownerReadError && (
                      <p className="mt-3 break-words text-xs text-red-400">
                        {ownerReadError.message}
                      </p>
                    )}

                    {contractBalanceError && (
                      <p className="mt-3 break-words text-xs text-red-400">
                        {contractBalanceError.message}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                      <div>
                        <p className="text-xs text-slate-500">
                          Current contract balance
                        </p>
                        <p className="mt-1 text-xl font-bold text-emerald-300">
                          {formattedContractBalance}
                        </p>
                      </div>

                      <button
                        onClick={refreshDashboard}
                        disabled={isDashboardRefreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white disabled:opacity-50"
                      >
                        <span className={isDashboardRefreshing ? "animate-spin" : ""}>
                          ↻
                        </span>
                        Refresh contract data
                      </button>
                    </div>
                  </div>
                </section>

                {/* TIP HISTORY */}
                <section>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading
                      eyebrow="Activity"
                      title="Transaction history"
                      description="Review tips recorded by the TipJar smart contract."
                    />


                  </div>

                  <div className={`${cardClass} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!p-0`}>
                    <TipHistory
                      deploymentBlock={12167589n}
                      refreshKey={historyRefreshKey}
                    />
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {/* FOOTER */}
        <footer className="border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-slate-500 md:flex-row md:text-left">
            <p>
              © 2026 TipJar. Decentralized creator support.
            </p>
            <p>
              Built on Ethereum Sepolia · Powered by Web3
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
