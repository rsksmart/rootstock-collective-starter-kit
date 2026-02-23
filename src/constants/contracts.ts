/**
 * Collective SDK contract-addresses-override pattern.
 * Single source of Collective contract addresses for Rootstock Testnet (Chain ID: 31).
 *
 * Token addresses follow the official Rootstock Contract Addresses table
 * (RIF, stRIF, USDRIF; see Rootstock docs).
 *
 * When the Collective SDK NPM package is used, pass this to target the correct contracts:
 *
 *   createCollective({
 *     chainId: 31,
 *     rpcUrl,
 *     contractAddresses: COLLECTIVE_CONTRACT_ADDRESSES[ROOTSTOCK_TESTNET_CHAIN_ID],
 *   })
 *
 * The SDK also has built-in testnet addresses; use this file to override or to keep
 * one place for your deployment addresses.
 */

/** Rootstock Testnet chain ID; hardcoded for this starter kit. */
export const ROOTSTOCK_TESTNET_CHAIN_ID = 31 as const;

/**
 * Collective contract addresses for Rootstock Testnet (Chain ID: 31).
 * Shape matches SDK ContractAddresses (Collective + token addresses).
 * Replace any placeholder (0x0...) with your deployment if different.
 */
export const COLLECTIVE_CONTRACT_ADDRESSES: Record<
  number,
  {
    governor: `0x${string}`;
    treasury: `0x${string}`;
    backersManager: `0x${string}`;
    builderRegistry: `0x${string}`;
    RIF: `0x${string}`;
    stRIF: `0x${string}`;
    USDRIF: `0x${string}`;
  }
> = {
  [ROOTSTOCK_TESTNET_CHAIN_ID]: {
    // Collective governance (Rootstock Collective DAO Testnet)
    governor: "0x25b7eb94f76cc682a402da980e6599478a596379" as `0x${string}`,
    treasury: "0xc4dacee263b0d1f2a09006dbc0170a4fda861b68" as `0x${string}`,
    backersManager: "0xd520cb42c46115762c02e4340646c2051ca3406d" as `0x${string}`,
    builderRegistry: "0x5fc1dd934ef2e6b5c4a433a3ec0a1326834b0f42" as `0x${string}`,
    // Token addresses (Rootstock Testnet; see Rootstock Contract Addresses table)
    RIF: "0x19f64674D8a5b4e652319F5e239EFd3bc969a1FE" as `0x${string}`,
    stRIF: "0xe7039717c51c44652fb47be1794884a82634f08f" as `0x${string}`,
    USDRIF: "0x8dbf326e12a9fF37ED6DDF75adA548C2640A6482" as `0x${string}`,
  },
};

/** Type for the override object passed to CollectiveSDK (chainId -> addresses). */
export type CollectiveContractAddressesOverride = typeof COLLECTIVE_CONTRACT_ADDRESSES;
