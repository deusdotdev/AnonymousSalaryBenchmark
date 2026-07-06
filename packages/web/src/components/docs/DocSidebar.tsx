"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DOC_SECTIONS,
  getPageAnchors,
  type DocSectionSlug,
} from "@/lib/how-it-works-content";

export function DocSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <nav className="rounded-[1.75rem] border border-green/15 bg-white/90 p-3 shadow-[0_16px_40px_-28px_rgba(6,95,70,0.4)] backdrop-blur-sm">
        <p className="px-2 pb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
          Documentation
        </p>
        <ul className="space-y-1">
          {DOC_SECTIONS.map((item, index) => {
            const href = `/how-it-works/${item.slug}`;
            const active = pathname === href;
            const anchors = active ? getPageAnchors(item.slug as DocSectionSlug) : [];
            const step = String(index + 1).padStart(2, "0");

            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-green/25 bg-green/[0.08] text-green-deep shadow-sm"
                      : "border-transparent text-muted hover:border-green/15 hover:bg-green/[0.04] hover:text-ink"
                  }`}
                >
                  <span
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold tabular-nums ${
                      active
                        ? "bg-green-deep text-white"
                        : "bg-green/[0.08] text-green-deep/70"
                    }`}
                  >
                    {step}
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
                </Link>

                {active && anchors.length > 0 && (
                  <ul className="ml-3 mt-1 space-y-0.5 border-l-2 border-green/15 pl-3">
                    {anchors.map((anchor) => (
                      <li key={anchor.id}>
                        <a
                          href={`#${anchor.id}`}
                          className="block rounded-lg py-1.5 pl-2 text-xs leading-snug text-muted transition-colors hover:bg-green/[0.04] hover:text-ink"
                        >
                          {anchor.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
