"use client";

import { useCallback, useState } from "react";
import Link from "next/link";

interface DocCopyAddressProps {
  address: string;
  etherscan: string;
  network: string;
  chainId: string;
}

export function DocCopyAddress({ address, etherscan, network, chainId }: DocCopyAddressProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [address]);

  return (
    <div
      id="contract-address"
      className="my-5 rounded-xl border border-green/20 bg-white/60 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-deep">
          SalaryFHE contract
        </p>
        <p className="text-xs text-muted">
          {network} &middot; chain {chainId}
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 break-all rounded-lg border border-green/15 bg-ink/[0.03] px-3 py-2.5 font-mono text-[13px] leading-snug text-ink">
          {address}
        </code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-green/20 bg-green/[0.06] px-4 py-2.5 text-sm font-semibold text-green-deep transition-colors hover:bg-green/[0.12]"
        >
          {copied ? "Copied" : "Copy address"}
        </button>
      </div>
      <p className="mt-3 text-xs text-muted">
        Verify on{" "}
        <Link
          href={etherscan}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-green-deep underline decoration-green/30 underline-offset-4 hover:decoration-green"
        >
          Sepolia Etherscan
        </Link>
        .
      </p>
    </div>
  );
}
