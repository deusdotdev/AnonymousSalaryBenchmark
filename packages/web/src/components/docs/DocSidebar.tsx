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
      <nav className="rounded-lg border border-green/15 bg-white/80 p-3">
        <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Guide
        </p>
        <ul className="space-y-0.5">
          {DOC_SECTIONS.map((item) => {
            const href = `/how-it-works/${item.slug}`;
            const active = pathname === href;
            const anchors = active ? getPageAnchors(item.slug as DocSectionSlug) : [];

            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                    active
                      ? "font-semibold text-green-deep"
                      : "text-muted hover:text-green-deep"
                  }`}
                >
                  {item.label}
                </Link>

                {active && anchors.length > 0 && (
                  <ul className="mb-2 ml-2 border-l border-green/15 pl-2">
                    {anchors.map((anchor) => (
                      <li key={anchor.id}>
                        <a
                          href={`#${anchor.id}`}
                          className="block py-1 pl-2 text-xs leading-snug text-muted hover:text-green-deep"
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
