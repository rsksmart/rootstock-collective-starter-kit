/**
 * useCollective: core SDK initialization for the Collective DAO Starter Kit.
 *
 * Architecture (3-layer):
 *   W3Layer (transport) -> Base (shared logic/errors) -> Module (Collective: proposals, staking)
 *
 * Uses the stub in src/lib/collectiveStub.ts until the Collective SDK NPM package is published.
 * Once @rsksmart/collective-sdk (and peers) is on NPM, install it and replace createCollectiveStub()
 * with createCollective({ chainId: 31, rpcUrl, contractAddresses }) from the SDK.
 */

import { useMemo } from "react";
import { useAccount, useWalletClient } from "wagmi";
import type { WalletClient } from "viem";
import { createCollectiveStub } from "@/lib/collectiveStub";
import type { CollectiveSDK } from "@/lib/collectiveStub";
import { ROOTSTOCK_TESTNET_CHAIN_ID } from "@/constants/contracts";

/** Chain ID for Rootstock Testnet — used to gate Collective flows. */
export const COLLECTIVE_CHAIN_ID = ROOTSTOCK_TESTNET_CHAIN_ID;

/** Result when SDK is not ready (wrong chain or no wallet). */
export interface UseCollectiveNotReady {
  isReady: false;
  sdk: null;
  walletClient: null;
  address: undefined;
  error: string | null;
}

/** Result when SDK is ready (stub until NPM package is used). */
export interface UseCollectiveReady {
  isReady: true;
  sdk: CollectiveSDK;
  walletClient: WalletClient | null;
  address: `0x${string}`;
  error: null;
}

export type UseCollectiveResult = UseCollectiveNotReady | UseCollectiveReady;

/**
 * Hook: returns Collective SDK (stub for now) with wallet client and address.
 * Use sdk.proposals (getProposals, castVote), sdk.staking (getStakingInfo, approveRIF, stakeRIF, unstakeRIF).
 */
export function useCollective(): UseCollectiveResult {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

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

    const sdk = createCollectiveStub();
    return {
      isReady: true,
      sdk,
      walletClient: (walletClient as WalletClient | undefined) ?? null,
      address,
      error: null,
    };
  }, [address, chain?.id, walletClient]);
}
