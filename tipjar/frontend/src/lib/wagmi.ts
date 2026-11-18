
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "TipJar DApp",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});
