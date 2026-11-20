
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

import {
  metaMaskWallet,
  rainbowWallet,
  base,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { createConfig } from "wagmi";
import { http } from "viem";
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

export const config = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
  ssr: true,
});
