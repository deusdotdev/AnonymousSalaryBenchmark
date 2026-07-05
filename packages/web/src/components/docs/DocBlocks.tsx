import Link from "next/link";
import { ReactNode } from "react";
import type { DocBlock } from "@/lib/how-it-works-content";
import { slugifyHeading } from "@/lib/how-it-works-content";

const SCROLL_MT = "scroll-mt-32";
const SECTION_DIVIDER = "divide-y-2 divide-green/25 border-y-2 border-green/25";
const SECTION_PAD = "py-4";
const BLOCK_MY = "my-4";

const CALLOUT_STYLES = {
  info: "border-green/25 bg-green/[0.04]",
  warning: "border-amber-500/30 bg-amber-500/[0.06]",
  trust: "border-green/25 bg-green/[0.04]",
} as const;

function DocBulletList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`mt-2 space-y-1.5 text-sm leading-relaxed text-muted ${className}`}>
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
  return (
    <aside
      className={`${BLOCK_MY} rounded-lg border px-4 py-3 text-sm leading-relaxed text-muted ${CALLOUT_STYLES[variant]}`}
    >
      {title && <p className="mb-1 text-sm font-semibold text-ink">{title}</p>}
      {children}
    </aside>
  );
}

function DocCode({ code }: { code: string }) {
  return (
    <pre className={`${BLOCK_MY} overflow-x-auto rounded-lg border border-green/20 bg-ink/[0.03] p-4 text-[13px] leading-relaxed text-ink`}>
      <code>{code}</code>
    </pre>
  );
}

function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className={`${BLOCK_MY} overflow-x-auto rounded-lg border border-green/20`}>
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-green/20 bg-green/[0.04]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-green/15 text-muted">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top">
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
    <span className="mt-[2px] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-deep text-[11px] font-semibold tabular-nums leading-none text-white">
      {n}
    </span>
  );
}

function DocSteps({ items }: { items: Extract<DocBlock, { type: "steps" }>["items"] }) {
  return (
    <ol className={`${BLOCK_MY} ${SECTION_DIVIDER}`}>
      {items.map((step) => (
        <li
          key={step.n}
          id={slugifyHeading(step.title)}
          className={`flex items-start gap-3 ${SECTION_PAD} ${SCROLL_MT}`}
        >
          <StepNumber n={step.n} />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-ink">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
            {step.detail && (
              <p className="mt-2 border-l-2 border-green/30 pl-3 text-xs leading-relaxed text-muted">
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
    <div className={`${BLOCK_MY} ${SECTION_DIVIDER}`}>
      {items.map((c) => (
        <section
          key={c.title}
          id={slugifyHeading(c.title)}
          className={`${SECTION_PAD} ${SCROLL_MT}`}
        >
          <h3 className="text-base font-semibold leading-snug text-ink">{c.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.body}</p>
          {c.bullets && c.bullets.length > 0 && <DocBulletList items={c.bullets} />}
        </section>
      ))}
    </div>
  );
}

function DocFaq({ items }: { items: Extract<DocBlock, { type: "faq" }>["items"] }) {
  return (
    <div className={`${BLOCK_MY} ${SECTION_DIVIDER}`}>
      {items.map((item) => (
        <section key={item.q} id={slugifyHeading(item.q)} className={`${SECTION_PAD} ${SCROLL_MT}`}>
          <h3 className="text-base font-semibold leading-snug text-ink">{item.q}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.a}</p>
        </section>
      ))}
    </div>
  );
}

function DocTrustBadges({ badges }: { badges: string[] }) {
  return <DocBulletList items={badges} className={BLOCK_MY} />;
}

export function DocArticle({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <article className="max-w-3xl">
      <header className="mb-6 border-b-2 border-green/25 pb-4">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{intro}</p>
      </header>
      <div className="doc-prose text-[15px] leading-relaxed text-muted [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-green/25 [&_h2]:pb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mb-1.5 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink [&_p+p]:mt-3">
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
                  className="font-medium text-green-deep underline decoration-green/30 underline-offset-4 hover:decoration-green"
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
