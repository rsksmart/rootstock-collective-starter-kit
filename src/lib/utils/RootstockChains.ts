/**
 * Rootstock Mainnet (30) and Testnet (31). Used so the app works on either chain
 * depending on the user's connected wallet; no hardcoded network.
 */
import { defineChain } from "viem";

export const ROOTSTOCK_MAINNET_CHAIN_ID = 30 as const;
export const ROOTSTOCK_TESTNET_CHAIN_ID = 31 as const;

export type RootstockChainId = typeof ROOTSTOCK_MAINNET_CHAIN_ID | typeof ROOTSTOCK_TESTNET_CHAIN_ID;

export const ROOTSTOCK_CHAIN_IDS: RootstockChainId[] = [
  ROOTSTOCK_MAINNET_CHAIN_ID,
  ROOTSTOCK_TESTNET_CHAIN_ID,
];

// Browser fallbacks.
const PUBLIC_MAINNET_RPC = "https://public-node.rsk.co";
const PUBLIC_TESTNET_RPC = "https://public-node.testnet.rsk.co";
const RPC_MAINNET_BASE = "https://rpc.rootstock.io";
const RPC_TESTNET_BASE = "https://rpc.testnet.rootstock.io";

function getRpcUrl(chainId: RootstockChainId): string {
  const apiKey = import.meta.env.VITE_ROOTSTOCK_RPC_API_KEY;
  if (typeof apiKey === "string" && apiKey.trim() !== "") {
    // Browser dApps can hit CORS issues on key-based RPC endpoints.
    // Keep browser behavior stable by preferring CORS-safe public gateways here.
    if (typeof window !== "undefined") {
      return chainId === ROOTSTOCK_MAINNET_CHAIN_ID ? PUBLIC_MAINNET_RPC : PUBLIC_TESTNET_RPC;
    }
    const base = chainId === ROOTSTOCK_MAINNET_CHAIN_ID ? RPC_MAINNET_BASE : RPC_TESTNET_BASE;
    return `${base}/${apiKey.trim()}`;
  }
  return chainId === ROOTSTOCK_MAINNET_CHAIN_ID ? PUBLIC_MAINNET_RPC : PUBLIC_TESTNET_RPC;
}

export function getRootstockRpcUrl(chainId: RootstockChainId): string {
  return getRpcUrl(chainId);
}

export const rootstockMainnet = defineChain({
  id: ROOTSTOCK_MAINNET_CHAIN_ID,
  name: "Rootstock",
  nativeCurrency: {
    decimals: 18,
    name: "Smart Bitcoin",
    symbol: "RBTC",
  },
  rpcUrls: {
    default: { http: [getRpcUrl(ROOTSTOCK_MAINNET_CHAIN_ID)] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.rsk.co" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862Be2a173976CA11",
      blockCreated: 4600000,
    },
  },
});

export const rootstockTestnet = defineChain({
  id: ROOTSTOCK_TESTNET_CHAIN_ID,
  name: "Rootstock Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Rootstock Smart Bitcoin",
    symbol: "tRBTC",
  },
  rpcUrls: {
    default: { http: [getRpcUrl(ROOTSTOCK_TESTNET_CHAIN_ID)] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.testnet.rsk.co" },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 2771150,
    },
  },
});

export function isRootstockChain(chainId: number | undefined): chainId is RootstockChainId {
  return chainId === ROOTSTOCK_MAINNET_CHAIN_ID || chainId === ROOTSTOCK_TESTNET_CHAIN_ID;
}

export function getChainDisplayName(chainId: RootstockChainId): string {
  return chainId === ROOTSTOCK_MAINNET_CHAIN_ID ? "Rootstock" : "Rootstock Testnet";
}

const EXPLORER_MAINNET = "https://explorer.rsk.co";
const EXPLORER_TESTNET = "https://explorer.testnet.rsk.co";

/** Block explorer URL for a transaction (mainnet or testnet). */
export function getExplorerTxUrl(chainId: RootstockChainId, txHash: string): string {
  const base =
    chainId === ROOTSTOCK_MAINNET_CHAIN_ID ? EXPLORER_MAINNET : EXPLORER_TESTNET;
  return `${base}/tx/${txHash}`;
}
