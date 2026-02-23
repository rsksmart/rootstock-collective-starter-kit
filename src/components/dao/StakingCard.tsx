/**
 * StakingCard: stake and withdraw RIF using collective-sdk staking (approveRIF, stakeRIF, unstakeRIF).
 * Rootstock Editor Mode: background #000000, text #FAF9F5, active borders #FF9100.
 * Simulation before write and Insufficient VP handling via lib/errors.
 *
 * RIF and stRIF balances are read on-chain (Rootstock Testnet) so they show real values
 * even when using the stub SDK.
 */

import { useState, useCallback, useMemo } from "react";
import { useReadContract, useBalance, usePublicClient } from "wagmi";
import type { CollectiveSDK } from "@/lib/collectiveStub";
import type { WalletClient } from "viem";
import type { Address } from "viem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getCollectiveErrorTitle, getCollectiveErrorDescription } from "@/lib/errors";
import {
  simulateApproveRIF,
  simulateStakeRIF,
  simulateUnstakeRIF,
} from "@/lib/simulation";
import { COLLECTIVE_CONTRACT_ADDRESSES, ROOTSTOCK_TESTNET_CHAIN_ID } from "@/constants/contracts";
import { abi as erc20Abi } from "@/assets/abis/ERC20abi";

const DECIMALS = 18n;

/** Max uint256 digits (2^256 - 1 has 78 digits). Amount is in wei (integer). */
const MAX_AMOUNT_DIGITS = 78;

/**
 * Parse user amount input for staking. Amount must be a non-negative integer (wei).
 * Returns null if invalid; use for validation before calling contract.
 */
function parseStakingAmount(input: string): bigint | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  if (trimmed.length > MAX_AMOUNT_DIGITS) return null;
  const value = BigInt(trimmed);
  return value > 0n ? value : null;
}

function formatTokenBalance(raw: bigint | undefined, decimals: bigint = DECIMALS): string {
  if (raw === undefined) return "—";
  const divisor = 10n ** decimals;
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(Number(decimals), "0").replace(/0+$/, "") || "0";
  return fracStr === "0" ? whole.toString() : `${whole}.${fracStr}`;
}

const CARD_BORDER = "border-[#FF9100]/50";
const CARD_ACTIVE = "focus-within:border-[#FF9100]";

interface StakingCardProps {
  sdk: CollectiveSDK;
  walletClient: WalletClient | null;
  address: Address;
}

export default function StakingCard({
  sdk,
  walletClient,
  address,
}: StakingCardProps): JSX.Element {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState<"stake" | "withdraw" | null>(null);
  const { toast } = useToast();
  const publicClient = usePublicClient({ chainId: ROOTSTOCK_TESTNET_CHAIN_ID });

  const addresses = useMemo(
    () => COLLECTIVE_CONTRACT_ADDRESSES[ROOTSTOCK_TESTNET_CHAIN_ID],
    []
  );

  const queryOpts = useMemo(
    () => ({ enabled: !!address, refetchOnWindowFocus: true }),
    [address]
  );

  const { data: nativeBalance } = useBalance({
    address,
    chainId: ROOTSTOCK_TESTNET_CHAIN_ID,
    query: queryOpts,
  });

  const { data: rifBalanceRaw } = useReadContract({
    address: addresses?.RIF,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: ROOTSTOCK_TESTNET_CHAIN_ID,
    query: queryOpts,
  });

  const { data: stRifBalanceRaw } = useReadContract({
    address: addresses?.stRIF,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: ROOTSTOCK_TESTNET_CHAIN_ID,
    query: queryOpts,
  });

  const tRbtcFormatted = formatTokenBalance(
    nativeBalance?.value,
    BigInt(nativeBalance?.decimals ?? 18)
  );
  const rifFormatted = formatTokenBalance(rifBalanceRaw as bigint | undefined);
  const stRifFormatted = formatTokenBalance(stRifBalanceRaw as bigint | undefined);

  const handleStake = useCallback(async () => {
    if (!walletClient || !addresses || !publicClient) return;
    const value = parseStakingAmount(amount);
    if (value === null) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive integer (amount in wei).",
        variant: "destructive",
      });
      return;
    }
    setLoading("stake");
    try {
      const info = await sdk.staking.getStakingInfo(address);
      if (!info.hasAllowance(value)) {
        await simulateApproveRIF(publicClient, address, addresses, value);
        const approveTx = await sdk.staking.approveRIF(walletClient, value);
        await approveTx.wait();
      }
      await simulateStakeRIF(publicClient, address, addresses, value, address);
      const result = await sdk.staking.stakeRIF(walletClient, value, address);
      await result.wait();
      toast({ title: "Stake submitted", description: `Tx: ${result.hash.slice(0, 10)}...` });
      setAmount("");
    } catch (e) {
      toast({
        title: getCollectiveErrorTitle(e, "Stake failed"),
        description: getCollectiveErrorDescription(e),
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }, [sdk, walletClient, address, amount, addresses, publicClient, toast]);

  const handleWithdraw = useCallback(async () => {
    if (!walletClient || !addresses || !publicClient) return;
    const value = parseStakingAmount(amount);
    if (value === null) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive integer (amount in wei).",
        variant: "destructive",
      });
      return;
    }
    setLoading("withdraw");
    try {
      await simulateUnstakeRIF(publicClient, address, addresses, value, address);
      const result = await sdk.staking.unstakeRIF(walletClient, value, address);
      await result.wait();
      toast({ title: "Withdraw submitted", description: `Tx: ${result.hash.slice(0, 10)}...` });
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
  }, [sdk, walletClient, address, amount, addresses, publicClient, toast]);

  const notReady = !walletClient || !publicClient;

  return (
    <Card
      className={`bg-[#000000] border ${CARD_BORDER} ${CARD_ACTIVE} text-[#FAF9F5]`}
    >
      <CardHeader>
        <CardTitle className="text-[#FAF9F5]">Stake RIF</CardTitle>
        <CardDescription className="text-[#FAF9F5]/80">
          Stake RIF to earn voting power. Withdraw when you no longer need to vote.
        </CardDescription>
        <p className="text-sm text-[#FAF9F5]/80">
          tRBTC: {tRbtcFormatted} · RIF: {rifFormatted} · stRIF: {stRifFormatted}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#FAF9F5]/90">Amount (wei, integer)</label>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-black border-[#FF9100]/50 text-[#FAF9F5] placeholder:text-[#FAF9F5]/50 focus-visible:ring-[#FF9100]"
            disabled={notReady}
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleStake}
            disabled={notReady || !amount || loading !== null}
            className="border-[#FF9100] text-[#FF9100] hover:bg-[#FF9100] hover:text-black"
          >
            {loading === "stake" ? "Staking…" : "Stake"}
          </Button>
          <Button
            onClick={handleWithdraw}
            disabled={notReady || !amount || loading !== null}
            className="border-[#FF9100] text-[#FF9100] hover:bg-[#FF9100] hover:text-black"
          >
            {loading === "withdraw" ? "Withdrawing…" : "Withdraw"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
