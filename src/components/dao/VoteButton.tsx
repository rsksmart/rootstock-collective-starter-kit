/**
 * VoteButton: casts vote via collective-sdk proposals.castVote.
 * Security: simulate vote TX first (Phase 5); then castVote; capture "Insufficient VP" via lib/errors.
 * Rootstock Editor Mode: active state #FF9100.
 */

import { useState, useCallback } from "react";
import { useBalance, usePublicClient } from "wagmi";
import { getAddress } from "viem";
import { VoteSupport, type CollectiveSDK } from "@/lib/collectiveStub";
import type { WalletClient } from "viem";
import type { Address } from "viem";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getCollectiveErrorTitle, getCollectiveErrorDescription } from "@/lib/errors";
import { simulateCastVote } from "@/lib/simulation";
import { formatVoteOrAmount } from "@/lib/formatDisplay";
import { getExplorerTxUrl } from "@/lib/utils/RootstockChains";
import { getAppContractAddresses } from "@/constants/contracts";
import type { RootstockChainId } from "@/lib/utils/RootstockChains";

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
  chainId: RootstockChainId;
}

export default function VoteButton({
  proposalId,
  sdk,
  walletClient,
  address,
  chainId,
}: VoteButtonProps): JSX.Element {
  const [support, setSupport] = useState<VoteSupport>(VoteSupport.For);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const publicClient = usePublicClient({ chainId });
  const addresses = getAppContractAddresses(chainId);

  const { data: stRifBalance } = useBalance({
    address,
    token: addresses?.stRIF ? getAddress(addresses.stRIF) : undefined,
    chainId,
    query: { enabled: !!address && !!addresses?.stRIF },
  });
  const votingPowerFormatted =
    stRifBalance?.value !== undefined ? formatVoteOrAmount(stRifBalance.value) : undefined;

  const handleVote = useCallback(async () => {
    if (!walletClient) {
      toast({ title: "Connect your wallet to vote.", variant: "destructive" });
      return;
    }
    if (!publicClient) {
      toast({ title: "Network not ready.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (addresses) {
        await simulateCastVote(publicClient, address, addresses, proposalId, support);
      }
      const result = await sdk.proposals.castVote(
        walletClient,
        proposalId,
        support
      );
      await result.wait();
      const voteExplorerUrl = getExplorerTxUrl(chainId, result.hash);
      toast({
        title: "Vote submitted",
        description: (
          <a
            href={voteExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-[#FF9100] hover:text-[#FF9100]/80"
          >
            View transaction
          </a>
        ),
      });
    } catch (e) {
      toast({
        title: getCollectiveErrorTitle(e, "Vote failed"),
        description: getCollectiveErrorDescription(e, { votingPowerFormatted }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sdk, walletClient, address, addresses, publicClient, proposalId, support, toast, votingPowerFormatted, chainId]);

  const notReady = !walletClient || !publicClient;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={`Vote on proposal ${proposalId}`}
    >
      <label htmlFor={`vote-support-${proposalId}`} className="sr-only">
        Vote choice
      </label>
      <select
        id={`vote-support-${proposalId}`}
        value={support}
        onChange={(e) => setSupport(Number(e.target.value) as VoteSupport)}
        className="h-10 rounded-md border border-[#FF9100]/50 bg-black text-[#FAF9F5] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9100] focus:ring-offset-2 focus:ring-offset-black"
        disabled={notReady}
        aria-label="Choose vote: For, Against, or Abstain"
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
        className="border-[#FF9100] text-[#FF9100] hover:bg-[#FF9100] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9100] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label={loading ? "Voting in progress" : "Submit vote"}
      >
        {loading ? "Voting…" : "Vote"}
      </Button>
    </div>
  );
}
