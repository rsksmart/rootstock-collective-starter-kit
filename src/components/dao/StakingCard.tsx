/**
 * Stake/withdraw RIF via collective-sdk. Balances from chain; simulation and VP errors via lib/errors.
 */

import { useState, useCallback, useMemo } from "react";
import { useBalance, usePublicClient } from "wagmi";
import { getAddress } from "viem";
import type { CollectiveSDK } from "@/lib/collectiveStub";
import type { WalletClient } from "viem";
import type { Address } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";
import Loader from "@/components/ui/loader";
import { getCollectiveErrorTitle, getCollectiveErrorDescription } from "@/lib/errors";
import {
  simulateApproveRIF,
  simulateStakeRIF,
  simulateUnstakeRIF,
} from "@/lib/simulation";
import { getAppContractAddresses } from "@/constants/contracts";
import { getExplorerTxUrl, type RootstockChainId } from "@/lib/utils/RootstockChains";

const DECIMALS = 18n;
const RIF_DECIMALS = 18;

/** Max decimal places for RIF input (1 RIF = 10^18 wei). */
const MAX_RIF_DECIMAL_PLACES = 18;

/**
 * Parse RIF amount (e.g. "1", "10", "1.5", ".5") to wei. Returns null if invalid.
 * Avoids float precision by splitting on decimal and padding fractional part.
 */
function parseRifToWei(input: string): bigint | null {
  let trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith(".")) trimmed = "0" + trimmed;
  if (!/^\d+(\.\d*)?$/.test(trimmed)) return null;
  const parts = trimmed.split(".");
  const whole = parts[0] ?? "0";
  const fracRaw = (parts[1] ?? "").slice(0, MAX_RIF_DECIMAL_PLACES);
  const frac = fracRaw.padEnd(MAX_RIF_DECIMAL_PLACES, "0");
  const wholeWei = BigInt(whole) * 10n ** BigInt(RIF_DECIMALS);
  const fracWei = frac === "" ? 0n : BigInt(frac);
  const value = wholeWei + fracWei;
  return value > 0n ? value : null;
}

const BALANCE_DISPLAY_DECIMALS = 6;
const SMALL_BALANCE_LABEL = "< 0.000001";

function formatTokenBalance(raw: bigint | undefined, decimals: bigint = DECIMALS): string {
  if (raw === undefined) return "—";
  if (raw === 0n) return "0";
  const divisor = 10n ** decimals;
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(Number(decimals), "0").replace(/0+$/, "") || "0";
  const full = fracStr === "0" ? whole.toString() : `${whole}.${fracStr}`;
  if (full.includes(".")) {
    const [a, b] = full.split(".");
    const trimmed = b.slice(0, BALANCE_DISPLAY_DECIMALS).replace(/0+$/, "") || "0";
    const display = trimmed === "0" ? a : `${a}.${trimmed}`;
    if (display === "0") return SMALL_BALANCE_LABEL;
    return display;
  }
  return full;
}

const CARD_BORDER = "border-[#FF9100]/50";
const CARD_ACTIVE = "focus-within:border-[#FF9100]";

interface StakingCardProps {
  sdk: CollectiveSDK;
  walletClient: WalletClient | null;
  address: Address;
  isRealSdk?: boolean;
  chainId: RootstockChainId;
}

export default function StakingCard({
  sdk,
  walletClient,
  address,
  isRealSdk = true,
  chainId,
}: StakingCardProps): JSX.Element {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState<"stake" | "withdraw" | null>(null);
  const [stakeFlowStep, setStakeFlowStep] = useState<
    "approving" | "staking" | "confirming" | "success" | null
  >(null);
  const [stakeNeededApprove, setStakeNeededApprove] = useState(false);
  const [lastStakeTxHash, setLastStakeTxHash] = useState<string | null>(null);
  const { toast } = useToast();
  const publicClient = usePublicClient({ chainId });

  const addresses = useMemo(
    () => getAppContractAddresses(chainId),
    [chainId]
  );

  const queryOpts = useMemo(
    () => ({ enabled: !!address, refetchOnWindowFocus: true }),
    [address]
  );

  const { data: nativeBalance, refetch: refetchNative } = useBalance({
    address,
    chainId,
    query: queryOpts,
  });

  const rifBalanceQuery = useBalance({
    address,
    token: addresses?.RIF ? getAddress(addresses.RIF) : undefined,
    chainId,
    query: { ...queryOpts, enabled: !!address && !!addresses?.RIF },
  });

  const stRifBalanceQuery = useBalance({
    address,
    token: addresses?.stRIF ? getAddress(addresses.stRIF) : undefined,
    chainId,
    query: { ...queryOpts, enabled: !!address && !!addresses?.stRIF },
  });

  const refetchBalances = useCallback(() => {
    refetchNative();
    rifBalanceQuery.refetch();
    stRifBalanceQuery.refetch();
  }, [refetchNative, rifBalanceQuery, stRifBalanceQuery]);

  const tRbtcFormatted = formatTokenBalance(
    nativeBalance?.value,
    BigInt(nativeBalance?.decimals ?? 18)
  );
  const rifFormatted = formatTokenBalance(
    rifBalanceQuery.data?.value,
    BigInt(rifBalanceQuery.data?.decimals ?? 18)
  );
  const stRifFormatted = formatTokenBalance(
    stRifBalanceQuery.data?.value,
    BigInt(stRifBalanceQuery.data?.decimals ?? 18)
  );

  const handleStake = useCallback(async () => {
    if (!walletClient || !publicClient) return;
    const value = parseRifToWei(amount);
    if (value === null) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive RIF amount (e.g. 1 or 10.5).",
        variant: "destructive",
      });
      return;
    }
    setLoading("stake");
    try {
      const info = await sdk.staking.getStakingInfo(address);
      const needsApprove = !info.hasAllowance(value);
      setStakeNeededApprove(needsApprove);
      setStakeFlowStep(needsApprove ? "approving" : "staking");

      if (needsApprove) {
        if (addresses) {
          await simulateApproveRIF(publicClient, address, addresses, value);
        }
        const approveTx = await sdk.staking.approveRIF(walletClient, value);
        await approveTx.wait();
        setStakeFlowStep("staking");
      }
      if (addresses) {
        await simulateStakeRIF(publicClient, address, addresses, value, address);
      }
      const result = await sdk.staking.stakeRIF(walletClient, value, address);
      setStakeFlowStep("confirming");
      await result.wait();
      refetchBalances();
      setStakeFlowStep("success");
      setLastStakeTxHash(result.hash);
      const stakeExplorerUrl = getExplorerTxUrl(chainId, result.hash);
      toast({
        title: "Stake submitted",
        description: (
          <a
            href={stakeExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-[#FF9100] hover:text-[#FF9100]/80"
          >
            View transaction
          </a>
        ),
      });
      setAmount("");
    } catch (e) {
      setStakeFlowStep(null);
      toast({
        title: getCollectiveErrorTitle(e, "Stake failed"),
        description: getCollectiveErrorDescription(e),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }, [sdk, walletClient, address, amount, addresses, publicClient, toast, refetchBalances, chainId]);

  const handleWithdraw = useCallback(async () => {
    if (!walletClient || !publicClient) return;
    const value = parseRifToWei(amount);
    if (value === null) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive RIF amount (e.g. 1 or 10.5).",
        variant: "destructive",
      });
      return;
    }
    setLoading("withdraw");
    try {
      if (addresses) {
        await simulateUnstakeRIF(publicClient, address, addresses, value, address);
      }
      const result = await sdk.staking.unstakeRIF(walletClient, value, address);
      await result.wait();
      refetchBalances();
      const withdrawExplorerUrl = getExplorerTxUrl(chainId, result.hash);
      toast({
        title: "Withdraw submitted",
        description: (
          <a
            href={withdrawExplorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-[#FF9100] hover:text-[#FF9100]/80"
          >
            View transaction
          </a>
        ),
      });
      setAmount("");
    } catch (e) {
      toast({
        title: getCollectiveErrorTitle(e, "Withdraw failed"),
        description: getCollectiveErrorDescription(e),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }, [sdk, walletClient, address, amount, addresses, publicClient, toast, refetchBalances, chainId]);

  const notReady = !walletClient || !publicClient;

  const scrollToProposals = useCallback(() => {
    document.getElementById("proposals")?.scrollIntoView({ behavior: "smooth" });
    setStakeFlowStep(null);
  }, []);

  type StepKey = "approve" | "stake" | "confirm" | "success";
  const stepOrder: StepKey[] = stakeNeededApprove
    ? ["approve", "stake", "confirm", "success"]
    : ["stake", "confirm", "success"];
  const stepIndex = stakeFlowStep
    ? stepOrder.indexOf(
        stakeFlowStep === "approving"
          ? "approve"
          : stakeFlowStep === "staking"
            ? "stake"
            : stakeFlowStep === "confirming"
              ? "confirm"
              : "success"
      )
    : -1;

  const timelineSteps = stakeNeededApprove
    ? [
        { key: "approve" as const, label: "Approve RIF" },
        { key: "stake" as const, label: "Stake RIF" },
        { key: "confirm" as const, label: "Confirm transaction" },
        { key: "success" as const, label: "Complete" },
      ]
    : [
        { key: "stake" as const, label: "Stake RIF" },
        { key: "confirm" as const, label: "Confirm transaction" },
        { key: "success" as const, label: "Complete" },
      ];

  return (
    <Card
      className={`bg-[#000000] border ${CARD_BORDER} ${CARD_ACTIVE} text-[#FAF9F5]`}
      role="region"
      aria-labelledby="stake-rif-title"
    >
      <CardHeader>
        <CardTitle id="stake-rif-title" className="text-[#FAF9F5]">Stake RIF</CardTitle>
        <CardDescription className="text-[#FAF9F5]/80">
          Stake RIF to earn voting power. Withdraw when you no longer need to vote.
        </CardDescription>
        <p className="text-sm text-[#FAF9F5]/80">
          tRBTC: {tRbtcFormatted} · RIF: {rifFormatted} · stRIF: {stRifFormatted}
        </p>
      </CardHeader>
      {!isRealSdk && (
        <div className="mx-6 mb-2 p-3 rounded-lg border border-amber-500/60 bg-amber-950/30 text-amber-200 text-sm">
          Collective SDK not installed. Run <code className="bg-black/30 px-1 rounded">npm install</code>. If the package is from GitHub Packages, set <code className="bg-black/30 px-1 rounded">GITHUB_TOKEN</code> (read:packages) then run <code className="bg-black/30 px-1 rounded">npm install</code>. See README.
        </div>
      )}
      {!addresses && (
        <div className="mx-6 mb-2 p-3 rounded-lg border border-[#FF9100]/40 bg-[#2b1800]/30 text-[#FAF9F5] text-sm">
          Using SDK default addresses on this network. Token balance and simulation previews may be
          limited unless custom app-side addresses are configured.
        </div>
      )}
      <CardContent className="flex flex-col gap-4">
        {stakeFlowStep !== null && (
          <div
            className="rounded-lg border border-[#FF9100]/40 bg-[#0a0a0a] p-4"
            role="status"
            aria-live="polite"
            aria-label="Stake progress"
          >
            <p id="stake-progress-heading" className="mb-3 text-sm font-medium text-[#FAF9F5]">Stake progress</p>
            <ul className="space-y-2" aria-labelledby="stake-progress-heading">
              {timelineSteps.map((step, i) => {
                const done = i < stepIndex || stakeFlowStep === "success";
                const current = i === stepIndex && stakeFlowStep !== "success";
                return (
                  <li
                    key={step.key}
                    className="flex items-center gap-2 text-sm text-[#FAF9F5]/90"
                  >
                    {done ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    ) : current ? (
                      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                        <Loader color="#FF9100" height={16} width={16} />
                      </span>
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border border-[#FAF9F5]/40" aria-hidden />
                    )}
                    <span className={current ? "text-[#FAF9F5]" : "text-[#FAF9F5]/70"}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ul>
            {stakeFlowStep === "success" && (
              <div className="mt-4 flex flex-col gap-2 border-t border-[#FF9100]/30 pt-4">
                <p className="text-sm font-medium text-emerald-400">Stake complete!</p>
                <p className="text-sm text-[#FAF9F5]/80">
                  Your stRIF balance has been updated. Use your voting power below.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={scrollToProposals}
                    className="w-fit border-[#FF9100] text-[#FF9100] hover:bg-[#FF9100] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9100] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    aria-label="Scroll to proposals and vote"
                  >
                    Vote on proposals
                  </Button>
                  {lastStakeTxHash && (
                    <a
                      href={getExplorerTxUrl(chainId, lastStakeTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-[100px] items-center justify-center rounded-full border border-[#FF9100]/60 bg-black px-5 py-2 text-[18px] font-medium text-[#FAF9F5] hover:bg-[#FF9100]/10 hover:border-[#FF9100]/80 focus:outline-none focus:ring-2 focus:ring-[#FF9100] focus:ring-offset-2 focus:ring-offset-black"
                      aria-label="View stake transaction in block explorer"
                    >
                      View transaction
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="stake-amount-input" className="text-sm text-[#FAF9F5]/90">Amount (RIF)</label>
          <Input
            id="stake-amount-input"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 1 or 10.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-black border-[#FF9100]/50 text-[#FAF9F5] placeholder:text-[#FAF9F5]/50 focus-visible:ring-[#FF9100]"
            disabled={notReady}
            aria-describedby="stake-amount-hint"
            aria-invalid={amount.length > 0 && parseRifToWei(amount) === null}
          />
          <span id="stake-amount-hint" className="sr-only">Enter amount in RIF, e.g. 1 or 10.5</span>
        </div>
        <div className="flex gap-2" role="group" aria-label="Stake and withdraw actions">
          <Button
            onClick={handleStake}
            disabled={notReady || !amount || loading !== null}
            className="border-[#FF9100] text-[#FF9100] hover:bg-[#FF9100] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9100] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={loading === "stake" ? "Staking in progress" : "Stake RIF"}
          >
            {loading === "stake" ? "Staking…" : "Stake"}
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={notReady || !amount || loading !== null}
            className="border-[#FF9100] text-[#FF9100] hover:bg-[#FF9100] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9100] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={loading === "withdraw" ? "Withdrawing in progress" : "Withdraw RIF"}
          >
            {loading === "withdraw" ? "Withdrawing…" : "Withdraw"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
