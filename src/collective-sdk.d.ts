/** Types for @rsksmart/collective-sdk when package is not installed. Build uses stub. */
import type { WalletClient } from "viem";
import type { Address } from "viem";

declare module "@rsksmart/collective-sdk" {
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

  export interface ProposalsListResult {
    totalCount: number;
    proposals: ProposalSummary[];
  }

  export interface StakingInfo {
    rifBalance: { raw: bigint; formatted: string; decimals: number; symbol: string };
    stRifBalance: { raw: bigint; formatted: string; decimals: number; symbol: string };
    allowance: { raw: bigint; formatted: string; decimals: number; symbol: string };
    hasAllowance: (amount: bigint) => boolean;
  }

  export class CollectiveSDK {
    constructor(config: {
      chainId: 30 | 31;
      rpcUrl?: string;
      contractAddresses?: Record<string, `0x${string}`>;
    });
    readonly proposals: {
      getProposals: (options?: { offset?: number; limit?: number }) => Promise<ProposalsListResult>;
      castVote: (
        walletClient: WalletClient,
        proposalId: string | bigint,
        support: number,
        options?: { reason?: string; skipValidation?: boolean }
      ) => Promise<{ hash: `0x${string}`; wait: (confirmations?: number) => Promise<unknown> }>;
    };
    readonly staking: {
      getStakingInfo: (userAddress: Address) => Promise<StakingInfo>;
      approveRIF: (walletClient: WalletClient, amount: bigint) => Promise<{ hash: `0x${string}`; wait: (confirmations?: number) => Promise<unknown> }>;
      stakeRIF: (walletClient: WalletClient, amount: bigint, delegatee: Address) => Promise<{ hash: `0x${string}`; wait: (confirmations?: number) => Promise<unknown> }>;
      unstakeRIF: (walletClient: WalletClient, amount: bigint, recipient: Address) => Promise<{ hash: `0x${string}`; wait: (confirmations?: number) => Promise<unknown> }>;
    };
  }
}
