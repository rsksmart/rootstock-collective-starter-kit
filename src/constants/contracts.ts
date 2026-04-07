/**
 * Collective/token addresses used by app-side reads and simulation.
 * SDK initialization on default chains (Mainnet 30, Testnet 31) should rely on SDK built-ins.
 * Addresses here are EIP-55 checksummed for viem.
 */

import { getAddress } from "viem";
import {
  ROOTSTOCK_MAINNET_CHAIN_ID,
  ROOTSTOCK_TESTNET_CHAIN_ID,
  type RootstockChainId,
} from "@/lib/utils/RootstockChains";

export { ROOTSTOCK_MAINNET_CHAIN_ID, ROOTSTOCK_TESTNET_CHAIN_ID };
export type { RootstockChainId } from "@/lib/utils/RootstockChains";

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

const PLACEHOLDER_ADDRESS = "0x0000000000000000000000000000000000000001";

/**
 * Collective + token addresses per chain for app-side usage.
 * Replace Mainnet placeholders if you need app-side reads/simulation against custom deployments.
 */
export const COLLECTIVE_CONTRACT_ADDRESSES: Record<
  RootstockChainId,
  CollectiveContractAddressMap
> = {
  [ROOTSTOCK_TESTNET_CHAIN_ID]: {
    governor: addr("0x25b7eb94f76cc682a402da980e6599478a596379"),
    treasury: addr("0xc4dacee263b0d1f2a09006dbc0170a4fda861b68"),
    backersManager: addr("0xd520cb42c46115762c02e4340646c2051ca3406d"),
    builderRegistry: addr("0x5fc1dd934ef2e6b5c4a433a3ec0a1326834b0f42"),
    RIF: addr("0x19f64674D8a5b4e652319F5e239EFd3bc969a1FE"),
    stRIF: addr("0xe7039717c51c44652fb47be1794884a82634f08f"),
    USDRIF: addr("0x8dbf326e12a9fF37ED6DDF75adA548C2640A6482"),
  },
  [ROOTSTOCK_MAINNET_CHAIN_ID]: {
    // Mainnet: replace with actual Collective deployment addresses when available
    governor: addr("0x0000000000000000000000000000000000000001"),
    treasury: addr("0x0000000000000000000000000000000000000001"),
    backersManager: addr("0x0000000000000000000000000000000000000001"),
    builderRegistry: addr("0x0000000000000000000000000000000000000001"),
    RIF: addr("0x2acc95758f8b5f583470ba265eb685a8f45fc9d5"),
    stRIF: addr("0x0000000000000000000000000000000000000001"),
    USDRIF: addr("0x0000000000000000000000000000000000000001"),
  },
};

function isPlaceholderAddress(value: `0x${string}`): boolean {
  return value.toLowerCase() === PLACEHOLDER_ADDRESS;
}

/**
 * App-side addresses for reads/simulation. Returns null when placeholders are present
 * so callers can skip app-side simulation/read paths and rely on SDK defaults.
 */
export function getAppContractAddresses(
  chainId: RootstockChainId
): CollectiveContractAddressMap | null {
  const map = COLLECTIVE_CONTRACT_ADDRESSES[chainId];
  const hasPlaceholder = (Object.values(map) as `0x${string}`[]).some(isPlaceholderAddress);
  return hasPlaceholder ? null : map;
}

export type CollectiveContractAddressesOverride = Record<
  RootstockChainId,
  CollectiveContractAddressMap
>;
