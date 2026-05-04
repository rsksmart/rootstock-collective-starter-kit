/**
 * Stub when @rootstockcollective/collective-sdk is not installed. Read calls return sample data; write calls throw.
 */

import type { WalletClient } from "viem";
import type { Address } from "viem";

const SDK_NOT_INSTALLED =
  "Collective SDK not installed. Run npm install. If the package is from GitHub Packages (e.g. pre-release), set GITHUB_TOKEN with read:packages, then run npm install. See the README.";

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
    approveRIF: (walletClient: WalletClient, amount: bigint) => Promise<{ hash: `0x${string}`; wait: (confirmations?: number) => Promise<unknown> }>;
    stakeRIF: (walletClient: WalletClient, amount: bigint, delegatee: Address) => Promise<{ hash: `0x${string}`; wait: (c?: number) => Promise<unknown> }>;
    unstakeRIF: (walletClient: WalletClient, amount: bigint, recipient: Address) => Promise<{ hash: `0x${string}`; wait: (c?: number) => Promise<unknown> }>;
  };
}

function zeroAmount(symbol: string): TokenAmount {
  return { raw: 0n, formatted: "0", decimals: 18, symbol };
}

/** Sample proposals with deadlines relative to now. */
function getSampleProposals(): ProposalSummary[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      proposalId: "1",
      index: 0,
      state: 1,
      stateLabel: "Active",
      proposer: "0x0000000000000000000000000000000000000001" as Address,
      deadline: BigInt(now + 7 * 24 * 3600),
      forVotes: 1_500_000_000_000_000_000n,
      againstVotes: 200_000_000_000_000_000n,
      abstainVotes: 0n,
    },
    {
      proposalId: "2",
      index: 1,
      state: 1,
      stateLabel: "Active",
      proposer: "0x0000000000000000000000000000000000000002" as Address,
      deadline: BigInt(now + 3 * 24 * 3600),
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 500_000_000_000_000_000n,
    },
  ];
}

/**
 * Returns a stub CollectiveSDK for the starter kit until the real package is published.
 * Read calls return sample/empty data; write calls (stake, vote) throw with an explanatory message.
 * When using the real SDK, getProposals() will return on-chain proposals instead of samples.
 */
export function createCollectiveStub(): CollectiveSDK {
  return {
    proposals: {
      getProposals: async () => {
        const proposals = getSampleProposals();
        return { totalCount: proposals.length, proposals };
      },
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
