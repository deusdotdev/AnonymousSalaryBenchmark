"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type Variant = "nav" | "primary";

interface LaunchMenuProps {
  variant?: Variant;
  label?: string;
}

const MENU_WIDTH = 288;

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

function clampMenuLeft(left: number): number {
  const margin = 12;
  const maxLeft = typeof window !== "undefined" ? window.innerWidth - MENU_WIDTH - margin : left;
  return Math.max(margin, Math.min(left, maxLeft));
}

export function LaunchMenu({ variant = "nav", label = "Launch app" }: LaunchMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuPos(null);
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const rawLeft =
        variant === "primary"
          ? rect.left + rect.width / 2 - MENU_WIDTH / 2
          : rect.right - MENU_WIDTH;
      setMenuPos({ top: rect.bottom + 8, left: clampMenuLeft(rawLeft) });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
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

  const menu =
    open && menuPos ? (
      <div
        ref={menuRef}
        role="menu"
        style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
        className="fixed z-[200] overflow-hidden rounded-2xl border border-green/15 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(6,95,70,0.45)]"
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
    ) : null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
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

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
