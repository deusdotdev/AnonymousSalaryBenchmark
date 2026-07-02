import Link from "next/link";
import { ReactNode } from "react";
import {
  COMPANY_STEPS,
  CONCEPTS,
  FAQ,
  INDIVIDUAL_STEPS,
  PRIVACY_ITEMS,
  PUBLIC_RELEASE_STEPS,
  type DocSectionSlug,
} from "@/lib/how-it-works-content";

interface DocSectionContentProps {
  section: DocSectionSlug;
}

function DocArticle({ children }: { children: ReactNode }) {
  return (
    <article className="doc-prose max-w-3xl text-[15px] leading-7 text-muted [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-ink [&_h1]:sm:text-3xl [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_p+p]:mt-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </article>
  );
}

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-green-deep underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

export function DocSectionContent({ section }: DocSectionContentProps) {
  switch (section) {
    case "overview":
      return (
        <DocArticle>
          <h1>Overview</h1>
          <p>
            ASB is a confidential salary benchmark dApp. You submit salary data in encrypted form,
            the protocol computes statistics over ciphertexts, and both individuals and companies
            can benchmark without exposing raw payroll values.
          </p>

          <h2>Traditional salary surveys</h2>
          <p>
            Most salary tools collect clear values in a centralized database. Even when they
            publish only averages, the operator can still inspect raw submissions. ASB removes that
            trust assumption.
          </p>

          <h2>The ASB model</h2>
          <p>
            Inputs are encrypted in-browser, then processed with FHE operations. Public outputs are
            only released at tier boundaries, while private comparisons stay decryptable only by the
            requesting wallet.
          </p>
        </DocArticle>
      );

    case "concepts":
      return (
        <DocArticle>
          <h1>Core concepts</h1>
          <p>These concepts drive the security and usability of the protocol.</p>

          {CONCEPTS.map((c) => (
            <div key={c.title}>
              <h2>{c.title}</h2>
              <p>{c.body}</p>
            </div>
          ))}
        </DocArticle>
      );

    case "individual-flow":
      return (
        <DocArticle>
          <h1>Individual flow</h1>
          <p>
            Submit once, track your category, release public averages at tier milestones, and
            compare privately. <DocLink href="/app">Open the app</DocLink>.
          </p>

          <ol>
            {INDIVIDUAL_STEPS.map((s) => (
              <li key={s.n}>
                <strong className="text-ink">{s.title}</strong>
                <p className="mt-1">{s.body}</p>
              </li>
            ))}
          </ol>
        </DocArticle>
      );

    case "public-release":
      return (
        <DocArticle>
          <h1>Public average release</h1>
          <p>
            Tier averages follow a three-step public decryption flow required by FHEVM.
          </p>

          <ol>
            {PUBLIC_RELEASE_STEPS.map((item) => (
              <li key={item.step}>
                <strong className="text-ink">{item.title}</strong>
                <p className="mt-1">{item.body}</p>
              </li>
            ))}
          </ol>
        </DocArticle>
      );

    case "company-flow":
      return (
        <DocArticle>
          <h1>Company flow</h1>
          <p>
            Aggregate your team&apos;s encrypted salaries and compare your internal average to the
            live market without exposing payroll. <DocLink href="/company">Open company app</DocLink>
            .
          </p>

          <ol>
            {COMPANY_STEPS.map((s) => (
              <li key={s.n}>
                <strong className="text-ink">{s.title}</strong>
                <p className="mt-1">{s.body}</p>
              </li>
            ))}
          </ol>
        </DocArticle>
      );

    case "privacy":
      return (
        <DocArticle>
          <h1>Privacy model</h1>
          <p>What stays private when you use ASB:</p>

          <ul>
            {PRIVACY_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>What is public</h2>
          <p>
            Participant counts per category, finalized tier averages, and standard Ethereum
            transaction metadata (wallet address, gas, timestamps). Your wallet address is visible
            on-chain, but not linked to a clear salary by this protocol.
          </p>
        </DocArticle>
      );

    case "faq":
      return (
        <DocArticle>
          <h1>FAQ</h1>

          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h2>{item.q}</h2>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </DocArticle>
      );

    default:
      return null;
  }
}
