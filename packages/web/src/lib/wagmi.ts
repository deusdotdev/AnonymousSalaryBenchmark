"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { APP_FULL_NAME } from "@/lib/brand";

const PLACEHOLDER_PROJECT_ID = "00000000000000000000000000000000";
const envProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

/* Only enable WalletConnect when a real project id is configured. Without one,
   the reown relay rejects the origin ("not found on Allowlist") and floods the
   console. Injected (MetaMask) works with no project id. */
const hasRealProjectId =
  envProjectId.length > 0 && envProjectId !== PLACEHOLDER_PROJECT_ID;

/* Coinbase Wallet (Base Account SDK) is intentionally excluded: it requires
   Cross-Origin-Opener-Policy to NOT be 'same-origin', but FHEVM WASM needs
   COOP 'same-origin' for SharedArrayBuffer. The two cannot coexist. */
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: hasRealProjectId
        ? [metaMaskWallet, walletConnectWallet, injectedWallet]
        : [injectedWallet],
    },
  ],
  {
    appName: APP_FULL_NAME,
    projectId: hasRealProjectId ? envProjectId : PLACEHOLDER_PROJECT_ID,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
        "https://ethereum-sepolia-rpc.publicnode.com"
    ),
  },
  ssr: true,
});
