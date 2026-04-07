/**
 * Dao: main Collective DAO page (Connect, Stake, Proposals, Vote).
 * Rootstock Editor Mode: background #000000, text #FAF9F5, active #FF9100.
 */

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useCollective } from "@/hooks/useCollective";
import { getChainDisplayName, isRootstockChain } from "@/lib/utils/RootstockChains";
import ConnectWallet from "@/components/dao/ConnectWallet";
import StakingCard from "@/components/dao/StakingCard";
import ProposalList from "@/components/dao/ProposalList";
import { useToast } from "@/components/ui/use-toast";

export function Dao(): JSX.Element {
  const { address, chain } = useAccount();
  const collective = useCollective();
  const { toast } = useToast();
  const prevRootstockChainRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!address) {
      prevRootstockChainRef.current = undefined;
      return;
    }
    const id = chain?.id;
    if (id === undefined || !isRootstockChain(id)) return;
    const prev = prevRootstockChainRef.current;
    if (prev !== undefined && prev !== id) {
      toast({
        title: `Switched to ${getChainDisplayName(id)}`,
        description: "Proposals and balances now load for this network.",
      });
    }
    prevRootstockChainRef.current = id;
  }, [address, chain?.id, toast]);

  const isCorrectChain = chain?.id !== undefined && isRootstockChain(chain.id);
  const notConnected = !address;
  const wrongChain = address && !isCorrectChain;

  return (
    <main
      className="min-h-screen bg-[#000000] text-[#FAF9F5] max-w-[1100px] mx-auto px-4 py-10"
      style={{ backgroundColor: "#000000", color: "#FAF9F5" }}
      aria-label="Rootstock Collective DAO: stake RIF and vote on proposals"
    >
      <section className="mb-10" aria-labelledby="dao-heading">
        <h1 id="dao-heading" className="text-3xl md:text-4xl font-bold mb-2">
          Rootstock Collective DAO
        </h1>
        <p className="text-[#FAF9F5]/80 text-lg">
          Stake RIF, view proposals, and vote on Rootstock (Mainnet or Testnet).
        </p>
      </section>

      {notConnected && (
        <section className="mb-10">
          <ConnectWallet />
        </section>
      )}

      {wrongChain && (
        <section className="mb-10 p-4 border border-[#FF9100]/50 rounded-lg bg-black" role="alert" aria-live="polite">
          <p className="text-[#FAF9F5]">
            {collective.error ?? "Please switch to Rootstock (Mainnet or Testnet) to use the DAO."}
          </p>
        </section>
      )}

      {collective.isReady && collective.sdk && (
        <>
          <section className="mb-10 max-w-md">
            <StakingCard
              key={`staking-${collective.chainId}`}
              sdk={collective.sdk}
              walletClient={collective.walletClient}
              address={collective.address}
              isRealSdk={collective.isRealSdk}
              chainId={collective.chainId}
            />
          </section>
          <section id="proposals" className="scroll-mt-6" aria-labelledby="proposals-heading">
            <h2 id="proposals-heading" className="text-2xl font-bold mb-4 text-[#FAF9F5]">
              Active proposals
            </h2>
            <ProposalList
              key={`proposals-${collective.chainId}`}
              sdk={collective.sdk}
              walletClient={collective.walletClient}
              address={collective.address}
              chainId={collective.chainId}
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
