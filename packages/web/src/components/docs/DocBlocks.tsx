import Link from "next/link";
import { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import type { DocBlock } from "@/lib/how-it-works-content";
import { slugifyHeading } from "@/lib/how-it-works-content";

const SCROLL_MT = "scroll-mt-32";
const SECTION_PAD = "p-4 sm:p-5";
const BLOCK_MY = "my-5";

const DOC_SHELL =
  "relative overflow-hidden rounded-[1.75rem] border border-green/15 bg-gradient-to-br from-white/95 via-white/90 to-green/[0.04] shadow-[0_20px_50px_-30px_rgba(6,95,70,0.35)]";
const DOC_HEADER = "border-b border-green/15 bg-green/[0.03] px-6 py-6 sm:px-8 sm:py-7";
const DOC_BODY = "px-6 py-6 sm:px-8 sm:py-7";

const CALLOUT_STYLES = {
  info: {
    shell: "border-green/20 bg-green/[0.05]",
    accent: "border-l-green-deep",
    label: "Note",
  },
  warning: {
    shell: "border-amber-500/25 bg-amber-500/[0.06]",
    accent: "border-l-amber-500",
    label: "Important",
  },
  trust: {
    shell: "border-green/20 bg-green/[0.05]",
    accent: "border-l-green",
    label: "Trust",
  },
} as const;

function DocBulletList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`mt-2.5 space-y-2 text-sm leading-relaxed text-muted ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span
            className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-green-deep"
            aria-hidden
          />
          <span className="min-w-0 flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DocCallout({
  variant,
  title,
  children,
}: {
  variant: keyof typeof CALLOUT_STYLES;
  title?: string;
  children: ReactNode;
}) {
  const style = CALLOUT_STYLES[variant];

  return (
    <aside
      className={`${BLOCK_MY} rounded-xl border border-l-4 px-4 py-3.5 text-sm leading-relaxed text-muted ${style.shell} ${style.accent}`}
    >
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-green-deep/80">
        {title ?? style.label}
      </p>
      {children}
    </aside>
  );
}

function DocCode({ code }: { code: string }) {
  return (
    <div
      className={`${BLOCK_MY} overflow-hidden rounded-xl border border-green/20 bg-ink/[0.03] shadow-inner`}
    >
      <div className="flex items-center gap-1.5 border-b border-green/15 bg-ink/[0.04] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-green/35" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-mint/50" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-green-soft/40" aria-hidden />
        <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-muted">
          Solidity / TypeScript
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className={`${BLOCK_MY} overflow-x-auto rounded-xl border border-green/20 shadow-sm`}>
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-green/20 bg-green/[0.06]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-green/12 bg-white/50 text-muted">
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors hover:bg-green/[0.03]">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StepNumber({ n }: { n: string }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-deep text-[11px] font-bold tabular-nums leading-none text-white shadow-[0_4px_12px_-4px_rgba(4,120,87,0.55)] ring-2 ring-green/20">
      {n}
    </span>
  );
}

const STEP_BODY_INDENT = "pl-11";

function DocSteps({ items }: { items: Extract<DocBlock, { type: "steps" }>["items"] }) {
  return (
    <ol className={`${BLOCK_MY} space-y-3`}>
      {items.map((step) => (
        <li
          key={step.n}
          id={slugifyHeading(step.title)}
          className={`${SECTION_PAD} ${SCROLL_MT} rounded-xl border border-green/12 bg-white/55 transition-colors hover:border-green/22 hover:bg-white/80`}
        >
          <div className="flex items-center gap-3">
            <StepNumber n={step.n} />
            <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug text-ink">
              {step.title}
            </h3>
          </div>
          <div className={`mt-2 ${STEP_BODY_INDENT}`}>
            <p className="text-sm leading-relaxed text-muted">{step.body}</p>
            {step.detail && (
              <p className="mt-2.5 rounded-lg border border-green/15 bg-green/[0.04] px-3 py-2.5 text-xs leading-relaxed text-muted">
                {step.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function DocConcepts({ items }: { items: Extract<DocBlock, { type: "concepts" }>["items"] }) {
  return (
    <div className={`${BLOCK_MY} space-y-3`}>
      {items.map((c) => (
        <section
          key={c.title}
          id={slugifyHeading(c.title)}
          className={`${SECTION_PAD} ${SCROLL_MT} rounded-xl border border-green/12 bg-white/55 transition-colors hover:border-green/22 hover:bg-white/80`}
        >
          <div className="flex items-start gap-3.5">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-deep/10 text-green-deep ring-1 ring-green/15">
              <Icon name={c.icon} size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-snug text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.body}</p>
              {c.bullets && c.bullets.length > 0 && <DocBulletList items={c.bullets} />}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function DocFaq({ items }: { items: Extract<DocBlock, { type: "faq" }>["items"] }) {
  return (
    <div className={`${BLOCK_MY} space-y-3`}>
      {items.map((item) => (
        <section
          key={item.q}
          id={slugifyHeading(item.q)}
          className={`${SECTION_PAD} ${SCROLL_MT} rounded-xl border border-green/12 bg-white/55 transition-colors hover:border-green/22 hover:bg-white/80`}
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green/[0.1] text-xs font-bold text-green-deep">
              Q
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-snug text-ink">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function DocTrustBadges({ badges }: { badges: string[] }) {
  return (
    <ul className={`${BLOCK_MY} flex flex-wrap gap-2`}>
      {badges.map((badge) => (
        <li
          key={badge}
          className="inline-flex items-center gap-1.5 rounded-full border border-green/20 bg-white/70 px-3 py-1.5 text-xs font-medium text-ink shadow-sm"
        >
          <Icon name="check" size={12} className="shrink-0 text-green-deep" />
          {badge}
        </li>
      ))}
    </ul>
  );
}

export function DocArticle({
  title,
  intro,
  sectionIndex,
  children,
}: {
  title: string;
  intro: string;
  sectionIndex?: number;
  children: ReactNode;
}) {
  const stepLabel =
    sectionIndex !== undefined ? String(sectionIndex + 1).padStart(2, "0") : null;

  return (
    <article className={`${DOC_SHELL} max-w-3xl`}>
      <header className={DOC_HEADER}>
        {stepLabel && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-deep">
            Guide &middot; {stepLabel}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{intro}</p>
      </header>
      <div
        className={`${DOC_BODY} doc-prose text-[15px] leading-relaxed text-muted [&>h2:first-child]:mt-0 [&>h2]:mb-3 [&>h2]:mt-9 [&>h2]:flex [&>h2]:items-center [&>h2]:gap-2 [&>h2]:border-b [&>h2]:border-green/15 [&>h2]:pb-2.5 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-ink [&>h2]:before:h-1 [&>h2]:before:w-6 [&>h2]:before:shrink-0 [&>h2]:before:rounded-full [&>h2]:before:bg-green-deep [&>h2]:before:content-[''] [&>h3]:mb-1.5 [&>h3]:mt-5 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-ink [&>p+p]:mt-3`}
      >
        {children}
      </div>
    </article>
  );
}

export function DocBlockRenderer({ blocks }: { blocks: DocBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "p":
            return <p key={index}>{block.text}</p>;
          case "h2":
            return (
              <h2 key={index} id={slugifyHeading(block.text)} className={SCROLL_MT}>
                {block.text}
              </h2>
            );
          case "h3":
            return <h3 key={index}>{block.text}</h3>;
          case "ul":
            return <DocBulletList key={index} items={block.items} className="my-3" />;
          case "callout":
            return (
              <DocCallout key={index} variant={block.variant} title={block.title}>
                {block.body}
              </DocCallout>
            );
          case "code":
            return <DocCode key={index} code={block.code} />;
          case "table":
            return <DocTable key={index} headers={block.headers} rows={block.rows} />;
          case "link":
            return (
              <p key={index}>
                {block.before}{" "}
                <Link
                  href={block.href}
                  className="font-medium text-green-deep underline decoration-green/30 underline-offset-4 transition-colors hover:decoration-green"
                  {...(block.external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                >
                  {block.label}
                </Link>
                {block.after ? ` ${block.after}` : ""}
              </p>
            );
          case "steps":
            return <DocSteps key={index} items={block.items} />;
          case "concepts":
            return <DocConcepts key={index} items={block.items} />;
          case "faq":
            return <DocFaq key={index} items={block.items} />;
          case "trust-badges":
            return <DocTrustBadges key={index} badges={block.badges} />;
          default:
            return null;
        }
      })}
    </>
  );
}
