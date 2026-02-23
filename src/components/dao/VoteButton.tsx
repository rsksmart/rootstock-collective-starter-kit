/**
 * VoteButton: casts vote via collective-sdk proposals.castVote.
 * Security: simulate vote TX first (Phase 5); then castVote; capture "Insufficient VP" via lib/errors.
 * Rootstock Editor Mode: active state #FF9100.
 */

import { useState, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { VoteSupport, type CollectiveSDK } from "@/lib/collectiveStub";
import type { WalletClient } from "viem";
import type { Address } from "viem";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getCollectiveErrorTitle, getCollectiveErrorDescription } from "@/lib/errors";
import { simulateCastVote } from "@/lib/simulation";
import {
  COLLECTIVE_CONTRACT_ADDRESSES,
  ROOTSTOCK_TESTNET_CHAIN_ID,
} from "@/constants/contracts";

const SUPPORT_OPTIONS: { value: VoteSupport; label: string }[] = [
  { value: VoteSupport.Against, label: "Against" },
  { value: VoteSupport.For, label: "For" },
  { value: VoteSupport.Abstain, label: "Abstain" },
];

interface VoteButtonProps {
  proposalId: string;
  sdk: CollectiveSDK;
  walletClient: WalletClient | null;
  address: Address;
}

export default function VoteButton({
  proposalId,
  sdk,
  walletClient,
  address,
}: VoteButtonProps): JSX.Element {
  const [support, setSupport] = useState<VoteSupport>(VoteSupport.For);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const publicClient = usePublicClient({ chainId: ROOTSTOCK_TESTNET_CHAIN_ID });
  const addresses = COLLECTIVE_CONTRACT_ADDRESSES[ROOTSTOCK_TESTNET_CHAIN_ID];

  const handleVote = useCallback(async () => {
    if (!walletClient) {
      toast({ title: "Connect your wallet to vote.", variant: "destructive" });
      return;
    }
    if (!publicClient || !addresses) {
      toast({ title: "Network not ready.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await simulateCastVote(publicClient, address, addresses, proposalId, support);
      const result = await sdk.proposals.castVote(
        walletClient,
        proposalId,
        support
      );
      await result.wait();
      toast({
        title: "Vote submitted",
        description: `Tx: ${result.hash.slice(0, 10)}...`,
      });
    } catch (e) {
      toast({
        title: getCollectiveErrorTitle(e, "Vote failed"),
        description: getCollectiveErrorDescription(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sdk, walletClient, address, addresses, publicClient, proposalId, support, toast]);

  const notReady = !walletClient || !publicClient;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={support}
        onChange={(e) => setSupport(Number(e.target.value) as VoteSupport)}
        className="h-10 rounded-md border border-[#FF9100]/50 bg-black text-[#FAF9F5] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9100]"
        disabled={notReady}
      >
        {SUPPORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Button
        onClick={handleVote}
        disabled={notReady || loading}
        className="border-[#FF9100] text-[#FF9100] hover:bg-[#FF9100] hover:text-black"
      >
        {loading ? "Voting…" : "Vote"}
      </Button>
    </div>
  );
}
