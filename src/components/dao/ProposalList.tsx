/**
 * ProposalList: fetches and displays proposals via collective-sdk proposals.getProposals().
 * Rootstock Editor Mode: cards with #FF9100 borders.
 */

import { useEffect, useState } from "react";
import type { CollectiveSDK, ProposalsListResult } from "@/lib/collectiveStub";
import type { WalletClient } from "viem";
import type { Address } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VoteButton from "./VoteButton";

const CARD_BORDER = "border-[#FF9100]/50";

interface ProposalListProps {
  sdk: CollectiveSDK;
  walletClient: WalletClient | null;
  address: Address; // passed from Dao for future use (e.g. hasVoted)
}

export default function ProposalList({
  sdk,
  walletClient,
  address: _address,
}: ProposalListProps): JSX.Element {
  const [result, setResult] = useState<ProposalsListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    sdk.proposals
      .getProposals({ limit: 20 })
      .then((r: ProposalsListResult) => {
        if (!cancelled) setResult(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sdk]);

  if (loading) {
    return <div className="text-[#FAF9F5] py-8">Loading proposals…</div>;
  }
  if (error) {
    return (
      <div className="text-red-400 py-4">Failed to load proposals: {error}</div>
    );
  }
  if (!result || result.proposals.length === 0) {
    return (
      <div className="text-[#FAF9F5]/80 py-8">
        No proposals yet. Check back later or create one on Testnet.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {result.proposals.map((proposal: ProposalsListResult["proposals"][number]) => (
        <li key={proposal.proposalId}>
          <Card
            className={`bg-[#000000] border ${CARD_BORDER} text-[#FAF9F5]`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-[#FAF9F5] text-lg">
                Proposal {proposal.proposalId}
              </CardTitle>
              <div className="flex flex-wrap gap-2 text-xs text-[#FAF9F5]/70">
                <span>State: {proposal.stateLabel}</span>
                <span>Deadline block: {proposal.deadline.toString()}</span>
                <span>For: {proposal.forVotes.toString()} · Against: {proposal.againstVotes.toString()}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <VoteButton
                proposalId={proposal.proposalId}
                sdk={sdk}
                walletClient={walletClient}
                address={_address}
              />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
