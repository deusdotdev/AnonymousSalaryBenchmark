import Link from "next/link";
import { ReactNode } from "react";
import type { DocBlock } from "@/lib/how-it-works-content";
import { slugifyHeading } from "@/lib/how-it-works-content";

const SCROLL_MT = "scroll-mt-32";

const CALLOUT_STYLES = {
  info: "border-green/20 bg-green/[0.04]",
  warning: "border-amber-500/25 bg-amber-500/[0.06]",
  trust: "border-green/20 bg-green/[0.04]",
} as const;

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
      className={`my-6 rounded-lg border px-4 py-3.5 text-sm leading-relaxed text-muted ${CALLOUT_STYLES[variant]}`}
    >
      {title && <p className="mb-1.5 text-sm font-semibold text-ink">{title}</p>}
      {children}
    </aside>
  );
}

function DocCode({ code }: { code: string }) {
  return (
    <pre className="my-5 overflow-x-auto rounded-lg border border-green/15 bg-ink/[0.03] p-4 text-[13px] leading-relaxed text-ink">
      <code>{code}</code>
    </pre>
  );
}

function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-green/15">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-green/15 bg-green/[0.04]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-green/10 text-muted">
          {rows.map((row, i) => (
            <tr key={i}>
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
    <span className="mt-[3px] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-deep text-[11px] font-semibold tabular-nums leading-none text-white">
      {n}
    </span>
  );
}

function DocSteps({ items }: { items: Extract<DocBlock, { type: "steps" }>["items"] }) {
  return (
    <ol className="my-6 divide-y divide-green/10 border-y border-green/10">
      {items.map((step) => (
        <li
          key={step.n}
          id={slugifyHeading(step.title)}
          className={`flex items-start gap-3 py-6 ${SCROLL_MT}`}
        >
          <StepNumber n={step.n} />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            {step.detail && (
              <p className="mt-3 border-l-2 border-green/20 pl-3 text-xs leading-relaxed text-muted">
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
    <div className="my-6 divide-y divide-green/10 border-y border-green/10">
      {items.map((c) => (
        <section
          key={c.title}
          id={slugifyHeading(c.title)}
          className={`py-6 ${SCROLL_MT}`}
        >
          <h3 className="text-base font-semibold text-ink">{c.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
          {c.bullets && c.bullets.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
              {c.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function DocFaq({ items }: { items: Extract<DocBlock, { type: "faq" }>["items"] }) {
  return (
    <div className="my-6 divide-y divide-green/10 border-y border-green/10">
      {items.map((item) => (
        <section key={item.q} id={slugifyHeading(item.q)} className={`py-6 ${SCROLL_MT}`}>
          <h3 className="text-base font-semibold leading-snug text-ink">{item.q}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
        </section>
      ))}
    </div>
  );
}

function DocTrustBadges({ badges }: { badges: string[] }) {
  return (
    <ul className="my-6 list-disc space-y-1 pl-5 text-sm text-muted">
      {badges.map((badge) => (
        <li key={badge}>{badge}</li>
      ))}
    </ul>
  );
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
      <header className="mb-8 border-b border-green/10 pb-6">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        <p className="mt-3 text-[15px] leading-7 text-muted">{intro}</p>
      </header>
      <div className="doc-prose text-[15px] leading-7 text-muted [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:border-b [&_h2]:border-green/10 [&_h2]:pb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink [&_p+p]:mt-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
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
            return (
              <ul key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
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
