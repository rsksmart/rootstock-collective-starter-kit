/**
 * ConnectWallet: wallet connection for the Collective DAO using Wagmi + RainbowKit.
 * Rootstock Editor Mode: high-contrast; active state uses #FF9100 (orange).
 */

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ConnectWallet(): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[#FAF9F5] text-sm">
        Connect your wallet on Rootstock Testnet to stake RIF and vote.
      </p>
      <ConnectButton
        showBalance={false}
        chainStatus={{ smallScreen: "none", largeScreen: "icon" }}
      />
    </div>
  );
}
