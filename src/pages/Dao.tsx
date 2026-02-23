/**
 * Dao: main Collective DAO page (Connect, Stake, Proposals, Vote).
 * Rootstock Editor Mode: background #000000, text #FAF9F5, active #FF9100.
 */

import { useAccount } from "wagmi";
import { useCollective, COLLECTIVE_CHAIN_ID } from "@/hooks/useCollective";
import ConnectWallet from "@/components/dao/ConnectWallet";
import StakingCard from "@/components/dao/StakingCard";
import ProposalList from "@/components/dao/ProposalList";

export function Dao(): JSX.Element {
  const { address, chain } = useAccount();
  const collective = useCollective();

  const isCorrectChain = chain?.id === COLLECTIVE_CHAIN_ID;
  const notConnected = !address;
  const wrongChain = address && !isCorrectChain;

  return (
    <main
      className="min-h-screen bg-[#000000] text-[#FAF9F5] max-w-[1100px] mx-auto px-4 py-10"
      style={{ backgroundColor: "#000000", color: "#FAF9F5" }}
    >
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Rootstock Collective DAO
        </h1>
        <p className="text-[#FAF9F5]/80 text-lg">
          Stake RIF, view proposals, and vote on Rootstock Testnet.
        </p>
      </section>

      {notConnected && (
        <section className="mb-10">
          <ConnectWallet />
        </section>
      )}

      {wrongChain && (
        <section className="mb-10 p-4 border border-[#FF9100]/50 rounded-lg bg-black">
          <p className="text-[#FAF9F5]">
            Please switch to <strong>Rootstock Testnet</strong> (Chain ID: 31) to use the DAO.
          </p>
        </section>
      )}

      {collective.isReady && collective.sdk && (
        <>
          <section className="mb-10 max-w-md">
            <StakingCard
              sdk={collective.sdk}
              walletClient={collective.walletClient}
              address={collective.address}
            />
          </section>
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[#FAF9F5]">
              Active proposals
            </h2>
            <ProposalList
              sdk={collective.sdk}
              walletClient={collective.walletClient}
              address={collective.address}
            />
          </section>
        </>
      )}

      {address && isCorrectChain && !collective.isReady && collective.error && (
        <section className="p-4 border border-amber-500/50 rounded-lg">
          <p className="text-amber-200">{collective.error}</p>
        </section>
      )}
    </main>
  );
}
