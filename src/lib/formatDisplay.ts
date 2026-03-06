/** Formatters for proposal IDs and vote/token amounts. */

const DEFAULT_DECIMALS = 18n;
const MAX_DECIMAL_PLACES = 2;

/** Truncate long proposal ID for display. */
export function formatProposalId(proposalId: string, maxVisible = 14): string {
  const s = String(proposalId).trim();
  if (s.length <= maxVisible) return s;
  return `${s.slice(0, 6)}\u2026${s.slice(-4)}`;
}

/** Format wei amount for display (18 decimals, up to 2 decimal places). */
export function formatVoteOrAmount(value: bigint, decimals: bigint = DEFAULT_DECIMALS): string {
  if (value === 0n) return "0";
  const divisor = 10n ** decimals;
  const whole = value / divisor;
  const frac = value % divisor;
  const wholeStr =
    whole >= 1000n ? whole.toLocaleString("en-US", { useGrouping: true }) : whole.toString();
  if (frac === 0n) return wholeStr;
  const fracPadded = frac.toString().padStart(Number(decimals), "0").slice(0, MAX_DECIMAL_PLACES);
  const fracTrimmed = fracPadded.replace(/0+$/, "") || "0";
  return `${wholeStr}.${fracTrimmed}`;
}
