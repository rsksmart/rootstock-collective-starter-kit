/** Account modal with correct small tRBTC display. Rendered via portal. */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBalance, useDisconnect } from "wagmi";
import { ROOTSTOCK_TESTNET_CHAIN_ID } from "@/constants/contracts";
import { formatNativeBalanceDisplay } from "@/lib/formatBalance";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Simple deterministic color from address for avatar background */
function avatarColor(address: string): string {
  const n = parseInt(address.slice(2, 10), 16) % 360;
  return `hsl(${n}, 60%, 45%)`;
}

interface CustomAccountModalProps {
  address: string;
  onClose: () => void;
}

export default function CustomAccountModal({
  address,
  onClose,
}: CustomAccountModalProps): JSX.Element {
  const { disconnect } = useDisconnect();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: ROOTSTOCK_TESTNET_CHAIN_ID,
  });
  const [copied, setCopied] = useState(false);

  const displayBalance = isBalanceLoading
    ? "Loading…"
    : formatNativeBalanceDisplay(
        balance?.formatted,
        balance?.symbol ?? "tRBTC"
      );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [address]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    onClose();
  }, [disconnect, onClose]);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => !el.hasAttribute("disabled"));
    const first = focusables[0];
    if (first) first.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (focusables.length === 0) return;
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, []);

  const modalContent = (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          zIndex: 2147483647,
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      >
        <div
          ref={dialogRef}
          className="w-full max-w-[380px] overflow-y-auto overflow-x-hidden shadow-2xl"
          style={{
            maxHeight: "calc(100vh - 2rem)",
            background: "var(--rk-colors-profileForeground)",
            borderRadius: "var(--rk-radii-modal)",
            border: "1px solid var(--rk-colors-modalBorder)",
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-account-title"
          onClick={(e) => e.stopPropagation()}
        >
        <div
          className="relative flex flex-col items-center text-center"
          style={{ padding: 16, margin: 8 }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:opacity-80"
            style={{
              color: "var(--rk-colors-closeButton)",
              background: "var(--rk-colors-closeButtonBackground)",
            }}
            onClick={onClose}
            aria-label="Close"
          >
            <span className="text-lg leading-none">×</span>
          </button>

          <div className="mt-6 flex justify-center">
            <div
              className="flex h-[74px] w-[74px] items-center justify-center rounded-full text-xl font-bold"
              style={{
                background: avatarColor(address),
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {address.slice(2, 4).toUpperCase()}
            </div>
          </div>

          <div
            className="mt-3 flex flex-col gap-1"
            style={{ gap: 4 }}
          >
            <h1
              id="custom-account-title"
              className="text-center font-extrabold"
              style={{
                color: "var(--rk-colors-modalText)",
                fontSize: 18,
              }}
            >
              {formatAddress(address)}
            </h1>
            <p
              className="text-center font-semibold"
              style={{
                color: "var(--rk-colors-modalTextSecondary)",
                fontSize: 14,
              }}
            >
              {displayBalance}
            </p>
          </div>

          <div
            className="mt-4 flex w-full flex-row gap-2"
            style={{ marginTop: 16, gap: 8 }}
          >
            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-colors hover:opacity-90"
              style={{
                background: "var(--rk-colors-actionButtonSecondaryBackground)",
                color: "var(--rk-colors-modalText)",
                border: "1px solid var(--rk-colors-actionButtonBorder)",
                fontSize: 13,
              }}
            >
              {copied ? "Copied!" : "Copy Address"}
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-colors hover:opacity-90"
              style={{
                background: "var(--rk-colors-accentColor)",
                color: "var(--rk-colors-accentColorForeground)",
                fontSize: 13,
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );

  if (typeof document === "undefined") return <></>;
  return createPortal(modalContent, document.body);
}
