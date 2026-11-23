
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

import {
  metaMaskWallet,
  rainbowWallet,
  base,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { createConfig } from "wagmi";
import { fallback, http } from "viem";
import { sepolia } from "wagmi/chains";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        base,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: "TipJar DApp",
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  }
);

const alchemyRpc = process.env.NEXT_PUBLIC_RPC_URL;

export const config = createConfig({
  chains: [sepolia],
  connectors,

  transports: {
    [sepolia.id]: fallback([
      ...(alchemyRpc ? [http(alchemyRpc, {
        retryCount: 1,
        timeout: 10000,
      })] : []),

      http("https://ethereum-sepolia-rpc.publicnode.com", {
        retryCount: 2,
        timeout: 15000,
      }),
    ]),
  },

  ssr: true,
});
