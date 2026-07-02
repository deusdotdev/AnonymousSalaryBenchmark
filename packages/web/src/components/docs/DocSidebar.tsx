"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_SECTIONS } from "@/lib/how-it-works-content";

export function DocSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="rounded-2xl border border-green/15 bg-white/75 p-4 backdrop-blur">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted">
          Documentation
        </p>
        <nav className="space-y-1.5">
          {DOC_SECTIONS.map((item) => {
            const href = `/how-it-works/${item.slug}`;
            const active = pathname === href;

            return (
              <Link
                key={item.slug}
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-green/10 text-green-deep"
                    : "text-muted hover:bg-green/5 hover:text-green-deep"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
