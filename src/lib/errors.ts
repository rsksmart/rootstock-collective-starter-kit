/**
 * Centralized error handling for Collective SDK / @rskSmart/sdk-base.
 * Captures "Insufficient VP" (Voting Power) and other known SDK errors for user-facing messages.
 */

const INSUFFICIENT_VP_PATTERN = /insufficient|voting power|VP/i;

/**
 * Returns true if the error message indicates insufficient voting power (from @rskSmart/sdk-base or contracts).
 */
export function isInsufficientVPError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return INSUFFICIENT_VP_PATTERN.test(message);
}

/**
 * User-facing message for Insufficient VP: stake more RIF or wait for the next epoch.
 */
export const INSUFFICIENT_VP_MESSAGE =
  "Stake more RIF or wait for the next epoch.";

/**
 * Maps a thrown error to a short title for toasts (e.g. "Insufficient voting power").
 * @param fallback - Used when the error is not an Insufficient VP error (e.g. "Stake failed").
 */
export function getCollectiveErrorTitle(
  error: unknown,
  fallback = "Transaction failed"
): string {
  return isInsufficientVPError(error) ? "Insufficient voting power" : fallback;
}

/**
 * Maps a thrown error to a description for toasts.
 */
export function getCollectiveErrorDescription(error: unknown): string {
  if (isInsufficientVPError(error)) return INSUFFICIENT_VP_MESSAGE;
  return error instanceof Error ? error.message : String(error);
}
