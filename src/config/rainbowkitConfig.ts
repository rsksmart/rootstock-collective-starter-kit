// Collective DAO Starter Kit: hardcoded to Rootstock Testnet (Chain ID: 31) only.
// VITE_WC_PROJECT_ID is required for wallet connection.
// All wagmi RPC (including RainbowKit account modal balance) uses the transport below.
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import {
  rsktestnet,
  getRootstockTestnetRpcUrl,
} from "@/lib/utils/RootstockTestnet";
import { createConfig, http } from "wagmi";

const rawProjectId = import.meta.env.VITE_WC_PROJECT_ID;
const projectId =
  typeof rawProjectId === "string" && rawProjectId.trim() !== ""
    ? rawProjectId.trim()
    : "";

if (projectId === "" && typeof window !== "undefined") {
  console.warn("[RainbowKit] VITE_WC_PROJECT_ID missing. Add to .env (see README).");
}

const rpcUrl = getRootstockTestnetRpcUrl();

const { connectors } = getDefaultWallets({
  appName: "Rootstock Collective DAO",
  projectId,
});

export const rainbowkitConfig = createConfig({
  chains: [rsktestnet],
  connectors,
  transports: {
    [rsktestnet.id]: http(rpcUrl),
  },
});
