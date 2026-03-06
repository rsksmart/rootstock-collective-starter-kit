/** Error handling for Collective SDK: Insufficient VP and SDK-not-installed. */

const INSUFFICIENT_VP_PATTERN = /insufficient|voting power|VP/i;
const SDK_NOT_INSTALLED_PATTERN = /collective sdk is not installed|sdk is not installed/i;

/** True if error is insufficient voting power. */
export function isInsufficientVPError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return INSUFFICIENT_VP_PATTERN.test(message);
}

/** True if error is SDK not installed (stub in use). */
export function isSdkNotInstalledError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return SDK_NOT_INSTALLED_PATTERN.test(message);
}

/** Message shown for Insufficient VP. */
export const INSUFFICIENT_VP_MESSAGE =
  "Stake more RIF or wait for the next epoch.";

const SDK_NOT_INSTALLED_MESSAGE =
  "Staking and voting require the real Collective SDK. Install it from GitHub Packages: create a personal access token with read:packages, set GITHUB_TOKEN, then run npm install. See the README for details.";

/** Toast title from error; fallback if not VP or SDK-not-installed. */
export function getCollectiveErrorTitle(
  error: unknown,
  fallback = "Transaction failed"
): string {
  if (isInsufficientVPError(error)) return "Insufficient voting power";
  if (isSdkNotInstalledError(error)) return "SDK not installed";
  return fallback;
}

/** Toast description from error. */
export function getCollectiveErrorDescription(error: unknown): string {
  if (isInsufficientVPError(error)) return INSUFFICIENT_VP_MESSAGE;
  if (isSdkNotInstalledError(error)) return SDK_NOT_INSTALLED_MESSAGE;
  return error instanceof Error ? error.message : String(error);
}

/** Error message for toasts: error.message or fallback. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
