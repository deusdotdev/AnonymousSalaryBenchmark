import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LaunchMenu } from "@/components/LaunchMenu";
import { PageContainer } from "@/components/PageContainer";
import { FeatureIllustration } from "@/components/icons/FeatureIllustration";
import type { IconName } from "@/components/icons/Icon";
import { Icon } from "@/components/icons/Icon";
import { MIN_PARTICIPANTS } from "@/lib/categories";

const FEATURES: {
  illustration: "encrypted" | "anonymity" | "comparison";
  title: string;
  body: string;
}[] = [
  {
    illustration: "encrypted",
    title: "Encrypted submissions",
    body: "Your salary is encrypted in your browser as a euint64 and sent on-chain. No server, no database, no clear value anywhere.",
  },
  {
    illustration: "anonymity",
    title: "k-anonymity averages",
    body: `Category averages stay hidden until at least ${MIN_PARTICIPANTS} people join, so no single salary can ever be reverse-engineered.`,
  },
  {
    illustration: "comparison",
    title: "Private comparison",
    body: "Check whether you sit above or below the average with a signed, private decryption. Only you see your result.",
  },
];

export default function LandingPage() {
  return (
    <main className="w-full py-14 sm:py-20">
      <PageContainer>
      {/* Hero */}
      <section className="relative rounded-[2rem] border border-green/15 bg-gradient-to-br from-white/90 via-green/5 to-mint/10 px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-soft/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-mint/25 blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green/20 bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
          <span className="h-2 w-2 animate-pulse-glow rounded-full bg-green" />
          Confidential salary benchmarks &middot; Zama FHEVM
        </div>
        <h1 className="max-w-4xl bg-gradient-to-r from-green-deep via-green to-leaf bg-clip-text pb-1 text-5xl font-black leading-snug tracking-tight text-transparent sm:text-6xl sm:leading-snug lg:text-7xl">
          Know your worth, without revealing it.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted sm:text-xl">
          ASB lets you compare salaries by role, city, and experience using
          fully homomorphic encryption. Share your number encrypted, see the market
          average, and find out where you stand, all without exposing a single salary.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <LaunchMenu variant="primary" />
          <Link
            href="/how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-green/25 bg-green/5 px-7 py-3.5 text-sm font-semibold text-green-deep transition-colors hover:bg-green/10"
          >
            How it works
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted">
          {[
            "euint64 encrypted",
            `k-anonymity ≥ ${MIN_PARTICIPANTS}`,
            "private FHE.gt comparison",
            "live on Sepolia",
          ].map((label) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon name="check" size={14} className="text-green-deep" />
              {label}
            </span>
          ))}
        </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-16 grid gap-6 md:grid-cols-3 xl:gap-8">
        {FEATURES.map((f, i) => (
          <Card key={f.title}>
            <FeatureIllustration variant={f.illustration} className="mb-5" />
            <h3 className="text-lg font-bold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </Card>
        ))}
      </section>

      {/* How it works teaser */}
      <section className="mt-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-green/15 bg-gradient-to-br from-surface via-green-soft/10 to-mint/10 p-8 sm:flex-row sm:items-center md:p-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-black text-ink sm:text-3xl">How it works</h2>
            <p className="mt-2 text-muted">
              Learn how FHE encryption, k-anonymity, tier releases, and private comparisons
              keep your salary confidential while still showing you the market.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-green/25 bg-green/5 px-7 py-3.5 text-sm font-semibold text-green-deep transition-colors hover:bg-green/10"
          >
            Read the full guide &rarr;
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-24">
        <div className="relative rounded-3xl border border-green/20 bg-gradient-to-br from-green-soft/20 via-mint/10 to-surface p-10 text-center">
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            Ready to benchmark, privately?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Connect your wallet and submit your encrypted salary in under a minute.
          </p>
          <div className="mt-7 flex justify-center">
            <LaunchMenu variant="primary" />
          </div>
        </div>
      </section>

      </PageContainer>
    </main>
  );
}
