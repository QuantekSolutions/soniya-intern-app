
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

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isSepolia = chainId === sepolia.id;

  const publicClient = usePublicClient({
    chainId: sepolia.id,
  });

  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const {
    data: balance,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useBalance({
    address,
    chainId: sepolia.id,
    query: {
      enabled: !!address,
    },
  });

  const {
    data: contractBalance,
    isLoading: isContractBalanceLoading,
    error: contractBalanceError,
    refetch: refetchContractBalance,
  } = useBalance({
    address: TIPJAR_ADDRESS,
    chainId: sepolia.id,
  });

  const {
    data: tipCount,
    isLoading: isTipCountLoading,
    error: tipCountError,
    refetch: refetchTipCount,
  } = useReadContract({
    address: TIPJAR_ADDRESS,
    abi: TIPJAR_ABI,
    functionName: "getTipCount",
    chainId: sepolia.id,
  });

  const {
    data: owner,
    isLoading: isOwnerLoading,
    error: ownerReadError,
    refetch: refetchOwner,
  } = useReadContract({
    address: TIPJAR_ADDRESS,
    abi: TIPJAR_ABI,
    functionName: "owner",
    chainId: sepolia.id,
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

  const handleTip = async () => {
    if (!isSepolia) {
      alert("Please switch to Ethereum Sepolia network first.");
      return;
    }

    if (!isConnected || !address) {
      alert("Please connect your wallet.");
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

        await Promise.all([
          refetchTipCount(),
          refetchContractBalance(),
        ]);
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
        await refetchContractBalance();
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
              Appreciate the creators.
              <span className="block text-indigo-400">
                Reward them with Web3.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              A seamless Web3 experience to send ETH, manage QTK tokens, and track blockchain activity securely on Ethereum Sepolia.
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
              CConnect your wallet to unlock the TipJar experience, monitor your balances, manage QTK tokens, send ETH tips, and track on-chain transactions.onnect your wallet using the button in the top-right corner
              to view your balances, send tips, manage QTK tokens and
              access transaction history.
            </p>
          </section>
        )}

        {/* CONNECTED WORKSPACE */}
        {isConnected && (
          <>
            {/* SIWE AUTHENTICATION */}
            <section className={`${cardClass} flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-400">
                  Wallet authentication
                </p>
                <h2 className="mt-2 text-lg font-bold">
                  Verify your wallet ownership
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Verify wallet ownership securely through a cryptographic signature. No transaction or gas fee is required.
                </p>
              </div>
              <div className="w-full md:max-w-sm">
                <SignInWithEthereum />
              </div>
            </section>

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

            {/* OVERVIEW */}
            <section>
              <SectionHeading
                eyebrow="Account overview"
                title="DASHBOARD"
                description="Monitor your wallet balance, TipJar activity, and smart contract interactions in one place."
              />

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
                      Explore tipping features, manage your funds, and access owner-only withdrawal controls.
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

                  {/* TOKEN BALANCE */}
                  <div className={`${cardClass} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!p-0`}>
                    <TokenBalance />
                  </div>

                  {/* SEND TOKENS */}
                  <div
                    className={`${cardClass} [&_input]:!rounded-xl [&_input]:!border-white/10 [&_input]:!bg-[#080f20] [&_input]:!text-white [&_button]:!rounded-xl [&_button]:!bg-indigo-600 [&_button]:!font-semibold`}
                  >
                    <SendTokens />
                  </div>

                  {/* APPROVE TOKENS */}
                  <div
                    className={`${cardClass} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!p-0 [&_input]:!rounded-xl [&_input]:!border-white/10 [&_input]:!bg-[#080f20] [&_input]:!text-white [&_button]:!rounded-xl [&_button]:!bg-indigo-600 [&_button]:!font-semibold`}
                  >
                    <ApproveTokens />
                  </div>

                  {/* TRANSFER FROM */}
                  <div
                    className={`${cardClass} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!p-0 [&_input]:!rounded-xl [&_input]:!border-white/10 [&_input]:!bg-[#080f20] [&_input]:!text-white [&_button]:!rounded-xl [&_button]:!bg-indigo-600 [&_button]:!font-semibold`}
                  >
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
                    onClick={() => {
                      refetchOwner();
                      refetchContractBalance();
                      refetchTipCount();
                    }}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white"
                  >
                    Refresh contract data
                  </button>
                </div>
              </div>
            </section>

            {/* TIP HISTORY */}
            <section>
              <SectionHeading
                eyebrow="Activity"
                title="Transaction history"
                description="Review tips recorded by the TipJar smart contract."
              />
              <div
                className={`${cardClass} [&>div]:!rounded-none [&>div]:!border-0 [&>div]:!bg-transparent [&>div]:!p-0`}
              >
                <TipHistory deploymentBlock={12167589n} />
              </div>
            </section>
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
