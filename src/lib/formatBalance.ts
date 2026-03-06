/** Format native balance for account modal; small values get more decimals. */

const MIN_DECIMALS_SMALL = 6;
const MAX_DECIMALS = 4;

/** Balance string for modal. */
export function formatNativeBalanceDisplay(
  formatted: string | undefined,
  symbol: string
): string {
  if (formatted === undefined || formatted === "") return `0 ${symbol}`;
  const n = Number.parseFloat(formatted);
  if (Number.isNaN(n)) return `0 ${symbol}`;
  if (n === 0) return `0 ${symbol}`;
  if (n < 0.0001) return `${n.toExponential(2)} ${symbol}`;
  if (n < 0.01) {
    const fixed = n.toFixed(MIN_DECIMALS_SMALL).replace(/0+$/, "").replace(/\.$/, "");
    return `${fixed} ${symbol}`;
  }
  if (n < 1) {
    const fixed = n.toFixed(MAX_DECIMALS).replace(/0+$/, "").replace(/\.$/, "");
    return `${fixed} ${symbol}`;
  }
  if (n < 1000) return `${n.toFixed(2)} ${symbol}`;
  if (n < 1_000_000) return `${(n / 1_000).toFixed(2)}k ${symbol}`;
  if (n < 1_000_000_000) return `${(n / 1_000_000).toFixed(2)}m ${symbol}`;
  return `${(n / 1_000_000_000).toFixed(2)}b ${symbol}`;
}
