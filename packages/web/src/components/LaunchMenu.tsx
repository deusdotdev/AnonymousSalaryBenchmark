"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Variant = "nav" | "primary";

interface LaunchMenuProps {
  variant?: Variant;
  label?: string;
}

const OPTIONS = [
  {
    href: "/app",
    icon: "\u{1F464}",
    title: "For individuals",
    subtitle: "Submit your salary & compare privately",
  },
  {
    href: "/company",
    icon: "\u{1F3E2}",
    title: "For companies",
    subtitle: "Benchmark your team against the market",
  },
];

export function LaunchMenu({ variant = "nav", label = "Launch app" }: LaunchMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green via-leaf to-green-deep px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(16,185,129,0.7)] transition-all hover:brightness-105"
      : "inline-flex items-center gap-1.5 rounded-xl border border-green/25 bg-green/5 px-4 py-2 text-sm font-semibold text-green-deep transition-colors hover:bg-green/10";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
      >
        {label}
        <span
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          &#9662;
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-green/15 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(6,95,70,0.45)] ${
            variant === "primary" ? "left-1/2 -translate-x-1/2" : "right-0"
          }`}
        >
          {OPTIONS.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-green/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green to-green-deep text-lg">
                {opt.icon}
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{opt.title}</span>
                <span className="block text-xs text-muted">{opt.subtitle}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
