/**
 * Simulate stake, withdraw, and vote before sending. All simulateContract calls are wrapped in try/catch.
 */

import type { PublicClient, Address } from "viem";
import { stRIFSimulationAbi, governorCastVoteAbi } from "@/lib/collectiveAbis";
import { abi as erc20Abi } from "@/assets/abis/ERC20abi";

export interface CollectiveAddresses {
  RIF: Address;
  stRIF: Address;
  governor: Address;
}

/** Format simulation failure for display. */
function simulationErrorMessage(context: string, cause: unknown): string {
  const msg = cause instanceof Error ? cause.message : String(cause);
  if (/insufficient|balance|allowance/i.test(msg)) {
    return `Simulation failed: insufficient balance or allowance. ${context}`;
  }
  if (/revert|execution reverted/i.test(msg)) {
    return `Simulation failed: transaction would revert. ${context}`;
  }
  return `Simulation failed: ${msg}. ${context}`;
}

/** Simulate RIF approve before approveRIF. */
export async function simulateApproveRIF(
  publicClient: PublicClient,
  account: Address,
  addresses: CollectiveAddresses,
  amount: bigint
): Promise<void> {
  try {
    await publicClient.simulateContract({
      address: addresses.RIF,
      abi: erc20Abi,
      functionName: "approve",
      args: [addresses.stRIF, amount],
      account,
    });
  } catch (e) {
    throw new Error(simulationErrorMessage("Check RIF balance and stRIF allowance.", e));
  }
}

/** Simulate stake before stakeRIF. */
export async function simulateStakeRIF(
  publicClient: PublicClient,
  account: Address,
  addresses: CollectiveAddresses,
  amount: bigint,
  delegatee: Address
): Promise<void> {
  try {
    await publicClient.simulateContract({
      address: addresses.stRIF,
      abi: stRIFSimulationAbi,
      functionName: "depositAndDelegate",
      args: [delegatee, amount],
      account,
    });
  } catch (e) {
    throw new Error(simulationErrorMessage("Check RIF balance and allowance.", e));
  }
}

/** Simulate withdraw before unstakeRIF. */
export async function simulateUnstakeRIF(
  publicClient: PublicClient,
  account: Address,
  addresses: CollectiveAddresses,
  amount: bigint,
  recipient: Address
): Promise<void> {
  try {
    await publicClient.simulateContract({
      address: addresses.stRIF,
      abi: stRIFSimulationAbi,
      functionName: "withdrawTo",
      args: [recipient, amount],
      account,
    });
  } catch (e) {
    throw new Error(simulationErrorMessage("Check stRIF balance.", e));
  }
}

/** Valid uint256 string (digits only, max 78 digits). */
function parseUint256(id: string | bigint): bigint {
  if (typeof id === "bigint") {
    if (id < 0n) throw new Error("Invalid proposalId: negative");
    return id;
  }
  const s = String(id).trim();
  if (!/^\d+$/.test(s) || s.length > 78) throw new Error("Invalid proposalId");
  return BigInt(s);
}

/** Simulate vote before castVote. */
export async function simulateCastVote(
  publicClient: PublicClient,
  account: Address,
  addresses: CollectiveAddresses,
  proposalId: string | bigint,
  support: number
): Promise<void> {
  const id = parseUint256(proposalId);
  try {
    await publicClient.simulateContract({
      address: addresses.governor,
      abi: governorCastVoteAbi,
      functionName: "castVote",
      args: [id, support],
      account,
    });
  } catch (e) {
    throw new Error(simulationErrorMessage("Check voting power and proposal state.", e));
  }
}
