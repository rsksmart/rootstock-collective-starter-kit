/**
 * Minimal ABIs for Collective SDK simulation (Phase 5).
 * Used by lib/simulation.ts to simulate stake, withdraw, and vote before sending TX.
 * Minimal ABIs for simulation; matches Collective Governor/stRIF contract interfaces.
 */

/** stRIF: depositAndDelegate(to, value) and withdrawTo(account, value) */
export const stRIFSimulationAbi = [
  {
    type: "function" as const,
    name: "depositAndDelegate",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable" as const,
  },
  {
    type: "function" as const,
    name: "withdrawTo",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable" as const,
  },
] as const;

/** Governor: castVote(proposalId, support) */
export const governorCastVoteAbi = [
  {
    type: "function" as const,
    name: "castVote",
    inputs: [
      { internalType: "uint256", name: "proposalId", type: "uint256" },
      { internalType: "uint8", name: "support", type: "uint8" },
    ],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable" as const,
  },
] as const;
