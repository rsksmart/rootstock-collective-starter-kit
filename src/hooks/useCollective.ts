/**
 * Initializes Collective SDK for the connected Rootstock chain (Mainnet 30 or Testnet 31).
 * Uses chain from wallet; no hardcoded network.
 */

import { useMemo, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import type { WalletClient } from "viem";
import { createCollectiveStub } from "@/lib/collectiveStub";
import type { CollectiveSDK } from "@/lib/collectiveStub";
import {
  getRootstockRpcUrl,
  isRootstockChain,
  ROOTSTOCK_CHAIN_IDS,
  type RootstockChainId,
} from "@/lib/utils/RootstockChains";

/** Supported Collective chains (Mainnet and Testnet). */
export const COLLECTIVE_CHAIN_IDS = ROOTSTOCK_CHAIN_IDS;

/** Result when SDK is not ready (wrong chain or no wallet). */
export interface UseCollectiveNotReady {
  isReady: false;
  sdk: null;
  walletClient: null;
  address: undefined;
  error: string | null;
}

/** Result when SDK is ready (real SDK or stub). */
export interface UseCollectiveReady {
  isReady: true;
  sdk: CollectiveSDK;
  walletClient: WalletClient | null;
  address: `0x${string}`;
  error: null;
  isRealSdk: boolean;
  chainId: RootstockChainId;
}

export type UseCollectiveResult = UseCollectiveNotReady | UseCollectiveReady;

type RealSDKConstructor = new (config: {
  chainId: 30 | 31;
  rpcUrl?: string;
  contractAddresses?: Record<string, `0x${string}`>;
}) => CollectiveSDK;

// Cache SDK instances by chain to reduce duplicate constructor/init logs in React StrictMode.
const REAL_SDK_CACHE = new Map<RootstockChainId, CollectiveSDK>();
const SDK_INIT_LOGGED_CHAINS = new Set<number>();
let COLLECTIVE_LOG_FILTER_INSTALLED = false;

function installCollectiveLogFilterForDev(): void {
  if (!import.meta.env.DEV || COLLECTIVE_LOG_FILTER_INSTALLED) return;
  const originalInfo = console.info.bind(console);
  console.info = (...args: unknown[]) => {
    const first = args[0];
    const second = args[1];
    const third = args[2] as { chainId?: number } | undefined;
    const isCollectiveInit =
      typeof second === "string" &&
      second.includes("CollectiveSDK initialized") &&
      typeof first === "string" &&
      first.includes("[Collective] [INFO]");
    if (isCollectiveInit) {
      const chainId = third?.chainId;
      if (typeof chainId === "number") {
        if (SDK_INIT_LOGGED_CHAINS.has(chainId)) return;
        SDK_INIT_LOGGED_CHAINS.add(chainId);
      }
    }
    originalInfo(...args);
  };
  COLLECTIVE_LOG_FILTER_INSTALLED = true;
}

/**
 * For default Rootstock chains (30/31), rely on SDK built-in addresses.
 * Only custom deployments/forks should pass contractAddresses.
 */
function getSdkContractOverrides(_chainId: RootstockChainId):
  | Record<string, `0x${string}`>
  | undefined {
  return undefined;
}

function getOrCreateRealSdk(
  RealSDK: RealSDKConstructor,
  chainId: RootstockChainId,
  rpcUrl: string,
  contractAddresses?: Record<string, `0x${string}`>
): CollectiveSDK {
  const cached = REAL_SDK_CACHE.get(chainId);
  if (cached) return cached;
  const instance = new RealSDK({ chainId, rpcUrl, contractAddresses }) as CollectiveSDK;
  REAL_SDK_CACHE.set(chainId, instance);
  return instance;
}

/** Returns Collective SDK (real or stub), wallet client, and address. */
export function useCollective(): UseCollectiveResult {
  const { address, chain } = useAccount();
  const activeChainId =
    chain?.id !== undefined && isRootstockChain(chain.id) ? chain.id : undefined;
  const { data: walletClient } = useWalletClient(
    activeChainId ? { chainId: activeChainId } : undefined
  );
  const [RealSDK, setRealSDK] = useState<RealSDKConstructor | null>(null);

  useEffect(() => {
    installCollectiveLogFilterForDev();
  }, []);

  useEffect(() => {
    import("@rootstockcollective/collective-sdk")
      .then((m) => {
        const Ctor = m.CollectiveSDK;
        setRealSDK(Ctor ? (() => Ctor as unknown as RealSDKConstructor) : null);
      })
      .catch(() => setRealSDK(null));
  }, []);

  return useMemo((): UseCollectiveResult => {
    const chainId = chain?.id;
    const supported = chainId !== undefined && isRootstockChain(chainId);
    if (!address || !supported) {
      const errorMsg = !address
        ? "Connect your wallet."
        : "Switch to Rootstock (Mainnet or Testnet) to use the DAO.";
      return {
        isReady: false,
        sdk: null,
        walletClient: null,
        address: undefined,
        error: errorMsg,
      };
    }

    const rpcUrl = getRootstockRpcUrl(chainId);
    const contractAddresses = getSdkContractOverrides(chainId);

    const sdk: CollectiveSDK = RealSDK
      ? getOrCreateRealSdk(RealSDK, chainId, rpcUrl, contractAddresses)
      : createCollectiveStub();

    return {
      isReady: true,
      sdk,
      walletClient: (walletClient as WalletClient | undefined) ?? null,
      address,
      error: null,
      isRealSdk: !!RealSDK,
      chainId,
    };
  }, [address, chain?.id, walletClient, RealSDK]);
}
