// Collective DAO Starter Kit: hardcoded to Rootstock Testnet (Chain ID: 31) only.
// VITE_WC_PROJECT_ID is required for wallet connection; empty string allows build but connection will fail.
import { rsktestnet } from "@/lib/utils/RootstockTestnet";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId = import.meta.env.VITE_WC_PROJECT_ID ?? "";

export const rainbowkitConfig = getDefaultConfig({
  appName: "Rootstock Collective DAO",
  projectId: typeof projectId === "string" ? projectId : "",
  chains: [rsktestnet],
});
