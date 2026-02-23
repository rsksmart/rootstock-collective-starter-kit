/**
 * Stub for the Collective SDK until @rsksmart/collective-sdk is published on NPM.
 * Read calls return empty/zero data; write calls (stake, vote) throw with an explanatory message.
 * Once the NPM package is published, the starter kit will refer to it and this stub can be removed.
 */

import type { WalletClient } from "viem";
import type { Address } from "viem";

const SDK_NOT_INSTALLED =
  "Collective SDK is not installed. When @rsksmart/collective-sdk is published on npm, add it and wire createCollective in useCollective.";

export interface TokenAmount {
  raw: bigint;
  formatted: string;
  decimals: number;
  symbol: string;
}

export interface ProposalsListResult {
  totalCount: number;
  proposals: ProposalSummary[];
}

export interface ProposalSummary {
  proposalId: string;
  index: number;
  state: number;
  stateLabel: string;
  proposer: Address;
  deadline: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
}

export enum VoteSupport {
  Against = 0,
  For = 1,
  Abstain = 2,
}

export interface StakingInfo {
  rifBalance: TokenAmount;
  stRifBalance: TokenAmount;
  allowance: TokenAmount;
  hasAllowance: (amount: bigint) => boolean;
}

export interface CollectiveSDK {
  readonly proposals: {
    getProposals: (options?: { offset?: number; limit?: number }) => Promise<ProposalsListResult>;
    castVote: (
      walletClient: WalletClient,
      proposalId: string | bigint,
      support: VoteSupport,
      options?: { reason?: string; skipValidation?: boolean }
    ) => Promise<{ hash: `0x${string}`; wait: (confirmations?: number) => Promise<unknown> }>;
  };
  readonly staking: {
    getStakingInfo: (userAddress: Address) => Promise<StakingInfo>;
    approveRIF: (walletClient: WalletClient, amount: bigint) => Promise<{ hash: `0x${string}`; wait: () => Promise<unknown> }>;
    stakeRIF: (walletClient: WalletClient, amount: bigint, delegatee: Address) => Promise<{ hash: `0x${string}`; wait: (c?: number) => Promise<unknown> }>;
    unstakeRIF: (walletClient: WalletClient, amount: bigint, recipient: Address) => Promise<{ hash: `0x${string}`; wait: (c?: number) => Promise<unknown> }>;
  };
}

function zeroAmount(symbol: string): TokenAmount {
  return { raw: 0n, formatted: "0", decimals: 18, symbol };
}

/**
 * Returns a stub CollectiveSDK for the starter kit until the real package is published.
 * Read calls return empty/zero data; write calls (stake, vote) throw with an explanatory message.
 */
export function createCollectiveStub(): CollectiveSDK {
  return {
    proposals: {
      getProposals: async () => ({ totalCount: 0, proposals: [] }),
      castVote: async () => {
        throw new Error(SDK_NOT_INSTALLED);
      },
    },
    staking: {
      getStakingInfo: async () => ({
        rifBalance: zeroAmount("RIF"),
        stRifBalance: zeroAmount("stRIF"),
        allowance: zeroAmount("RIF"),
        hasAllowance: () => false,
      }),
      approveRIF: async () => {
        throw new Error(SDK_NOT_INSTALLED);
      },
      stakeRIF: async () => {
        throw new Error(SDK_NOT_INSTALLED);
      },
      unstakeRIF: async () => {
        throw new Error(SDK_NOT_INSTALLED);
      },
    },
  };
}
