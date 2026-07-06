import Link from "next/link";
import { DOC_SECTIONS, type DocSectionSlug } from "@/lib/how-it-works-content";

interface DocPageNavProps {
  section: DocSectionSlug;
}

export function DocPageNav({ section }: DocPageNavProps) {
  const index = DOC_SECTIONS.findIndex((item) => item.slug === section);
  const prev = index > 0 ? DOC_SECTIONS[index - 1] : null;
  const next = index < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[index + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Documentation pages"
      className="mt-8 grid gap-3 border-t border-green/15 pt-6 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/how-it-works/${prev.slug}`}
          className="group flex flex-col rounded-xl border border-green/12 bg-white/50 px-4 py-3 transition-colors hover:border-green/25 hover:bg-white/80"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Previous</span>
          <span className="mt-1 text-sm font-semibold text-ink group-hover:text-green-deep">
            {prev.label}
          </span>
        </Link>
      ) : (
        <div aria-hidden className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/how-it-works/${next.slug}`}
          className="group flex flex-col rounded-xl border border-green/12 bg-white/50 px-4 py-3 text-left transition-colors hover:border-green/25 hover:bg-white/80 sm:text-right"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Next</span>
          <span className="mt-1 text-sm font-semibold text-ink group-hover:text-green-deep">
            {next.label}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
