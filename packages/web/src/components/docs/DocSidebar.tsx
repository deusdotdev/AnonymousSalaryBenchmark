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
      <nav className="rounded-2xl border border-green/10 bg-white/90 p-3 shadow-sm">
        <p className="px-1 pb-3 text-[10px] font-bold uppercase tracking-widest text-muted">
          Guide
        </p>
        <ul className="space-y-2">
          {DOC_SECTIONS.map((item) => {
            const href = `/how-it-works/${item.slug}`;
            const active = pathname === href;
            const anchors = active ? getPageAnchors(item.slug as DocSectionSlug) : [];

            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  className={`block rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-green/25 bg-green/[0.07] text-green-deep"
                      : "border-green/10 bg-surface text-muted hover:border-green/20 hover:bg-green/[0.03] hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>

                {active && anchors.length > 0 && (
                  <ul className="mt-1.5 space-y-1 rounded-xl border border-green/10 bg-green/[0.02] p-2">
                    {anchors.map((anchor) => (
                      <li key={anchor.id}>
                        <a
                          href={`#${anchor.id}`}
                          className="block rounded-lg px-2 py-1.5 text-xs leading-snug text-muted transition-colors hover:bg-white/80 hover:text-ink"
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
