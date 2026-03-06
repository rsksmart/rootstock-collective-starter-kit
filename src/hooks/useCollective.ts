/**
 * Initializes Collective SDK (real from GitHub Packages if installed, else stub). Uses chainId 31 and constants/contracts.ts.
 */

import { useMemo, useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import type { WalletClient } from "viem";
import { createCollectiveStub } from "@/lib/collectiveStub";
import type { CollectiveSDK } from "@/lib/collectiveStub";
import {
  ROOTSTOCK_TESTNET_CHAIN_ID,
  COLLECTIVE_CONTRACT_ADDRESSES,
} from "@/constants/contracts";
import { getRootstockTestnetRpcUrl } from "@/lib/utils/RootstockTestnet";

/** Rootstock Testnet chain ID. */
export const COLLECTIVE_CHAIN_ID = ROOTSTOCK_TESTNET_CHAIN_ID;

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
}

export type UseCollectiveResult = UseCollectiveNotReady | UseCollectiveReady;

type RealSDKConstructor = new (config: {
  chainId: 30 | 31;
  rpcUrl?: string;
  contractAddresses?: Record<string, `0x${string}`>;
}) => CollectiveSDK;

/** Returns Collective SDK (real or stub), wallet client, and address. */
export function useCollective(): UseCollectiveResult {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [RealSDK, setRealSDK] = useState<RealSDKConstructor | null>(null);

  useEffect(() => {
    import("@rsksmart/collective-sdk")
      .then((m) => {
        const Ctor = m.CollectiveSDK;
        setRealSDK(Ctor ? (() => Ctor as unknown as RealSDKConstructor) : null);
      })
      .catch(() => setRealSDK(null));
  }, []);

  return useMemo((): UseCollectiveResult => {
    const isCorrectChain = chain?.id === COLLECTIVE_CHAIN_ID;
    if (!address || !isCorrectChain) {
      return {
        isReady: false,
        sdk: null,
        walletClient: null,
        address: undefined,
        error: !address ? "Connect your wallet." : "Switch to Rootstock Testnet (Chain ID: 31).",
      };
    }

    const rpcUrl = getRootstockTestnetRpcUrl();
    const contractAddresses = COLLECTIVE_CONTRACT_ADDRESSES[ROOTSTOCK_TESTNET_CHAIN_ID];

    const sdk: CollectiveSDK = RealSDK
      ? (new RealSDK({
          chainId: ROOTSTOCK_TESTNET_CHAIN_ID as 31,
          rpcUrl,
          contractAddresses,
        }) as CollectiveSDK)
      : createCollectiveStub();

    return {
      isReady: true,
      sdk,
      walletClient: (walletClient as WalletClient | undefined) ?? null,
      address,
      error: null,
      isRealSdk: !!RealSDK,
    };
  }, [address, chain?.id, walletClient, RealSDK]);
}
