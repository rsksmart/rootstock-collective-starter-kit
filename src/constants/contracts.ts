/**
 * Collective contract addresses for Rootstock Testnet (31). Pass to createCollective() as contractAddresses.
 * Addresses are EIP-55 checksummed for viem.
 */

import { getAddress } from "viem";

/** Rootstock Testnet chain ID; hardcoded for this starter kit. */
export const ROOTSTOCK_TESTNET_CHAIN_ID = 31 as const;

function addr(hex: string): `0x${string}` {
  return getAddress(hex) as `0x${string}`;
}

export type CollectiveContractAddressMap = {
  governor: `0x${string}`;
  treasury: `0x${string}`;
  backersManager: `0x${string}`;
  builderRegistry: `0x${string}`;
  RIF: `0x${string}`;
  stRIF: `0x${string}`;
  USDRIF: `0x${string}`;
};

/** Collective + token addresses for Testnet. Replace 0x0... placeholders if your deployment differs. */
export const COLLECTIVE_CONTRACT_ADDRESSES: Record<
  typeof ROOTSTOCK_TESTNET_CHAIN_ID,
  CollectiveContractAddressMap
> = {
  [ROOTSTOCK_TESTNET_CHAIN_ID]: {
    // Collective governance (Rootstock Collective DAO Testnet)
    governor: addr("0x25b7eb94f76cc682a402da980e6599478a596379"),
    treasury: addr("0xc4dacee263b0d1f2a09006dbc0170a4fda861b68"),
    backersManager: addr("0xd520cb42c46115762c02e4340646c2051ca3406d"),
    builderRegistry: addr("0x5fc1dd934ef2e6b5c4a433a3ec0a1326834b0f42"),
    // Token addresses (Rootstock Testnet; see Rootstock Contract Addresses table)
    RIF: addr("0x19f64674D8a5b4e652319F5e239EFd3bc969a1FE"),
    stRIF: addr("0xe7039717c51c44652fb47be1794884a82634f08f"),
    USDRIF: addr("0x8dbf326e12a9fF37ED6DDF75adA548C2640A6482"),
  },
};

/** Type for the override object passed to CollectiveSDK (chainId -> addresses). */
export type CollectiveContractAddressesOverride = Record<
  typeof ROOTSTOCK_TESTNET_CHAIN_ID,
  CollectiveContractAddressMap
>;
