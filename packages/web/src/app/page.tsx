import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LaunchMenu } from "@/components/LaunchMenu";
import { PageContainer } from "@/components/PageContainer";
import { MIN_PARTICIPANTS } from "@/lib/categories";

const FEATURES = [
  {
    icon: "\u{1F512}",
    title: "Encrypted submissions",
    body: "Your salary is encrypted in your browser as a euint64 and sent on-chain. No server, no database, no clear value anywhere.",
  },
  {
    icon: "\u{1F465}",
    title: "k-anonymity averages",
    body: `Category averages stay hidden until at least ${MIN_PARTICIPANTS} people join, so no single salary can ever be reverse-engineered.`,
  },
  {
    icon: "\u{1F4CA}",
    title: "Private comparison",
    body: "Check whether you sit above or below the average with a signed, private decryption. Only you see your result.",
  },
];

export default function LandingPage() {
  return (
    <main className="w-full py-14 sm:py-20">
      <PageContainer>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-green/15 bg-gradient-to-br from-white/90 via-green/5 to-mint/10 px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-soft/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-mint/25 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green/20 bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
          <span className="h-2 w-2 animate-pulse-glow rounded-full bg-green" />
          Confidential salary benchmarks &middot; Zama FHEVM
        </div>
        <h1 className="max-w-4xl bg-gradient-to-r from-green-deep via-green to-leaf bg-clip-text text-5xl font-black leading-[1.05] tracking-tight text-transparent sm:text-6xl lg:text-7xl">
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
          <span>&#10003; euint64 encrypted</span>
          <span>&#10003; k-anonymity &ge; {MIN_PARTICIPANTS}</span>
          <span>&#10003; private FHE.gt comparison</span>
          <span>&#10003; live on Sepolia</span>
        </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-16 grid gap-6 md:grid-cols-3 xl:gap-8">
        {FEATURES.map((f, i) => (
          <Card key={f.title} glow={(["violet", "cyan", "emerald"] as const)[i]}>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green to-green-deep text-xl">
              {f.icon}
            </span>
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

      {/* For companies */}
      <section className="mt-24">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-[2rem] border border-green/20 bg-gradient-to-br from-surface via-green-soft/10 to-mint/15 p-8 md:grid-cols-2 md:p-12 lg:p-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-green/20 bg-green/5 px-3 py-1 text-xs font-semibold text-green-deep">
              For employers
            </span>
            <h2 className="mt-4 text-3xl font-black text-ink sm:text-4xl">
              Are you paying above the market?
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              Companies submit their team&apos;s salaries encrypted, by role, city, and
              experience. Once five employees join a category, you privately learn whether
              you pay above or below the live market average, without exposing your payroll
              to anyone, including us.
            </p>
            <Link
              href="/company"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-green/25 bg-green/5 px-7 py-3.5 text-sm font-semibold text-green-deep transition-colors hover:bg-green/10"
            >
              Benchmark your company &rarr;
            </Link>
          </div>
          <div className="grid gap-4">
            {[
              { k: "Per-employee", v: "Encrypted euint64 salaries aggregated privately" },
              { k: "k-anonymity \u2265 5", v: "No benchmark until five employees are in a category" },
              { k: "1 private bit", v: "Above or below market, decryptable only by you" },
            ].map((row) => (
              <div
                key={row.k}
                className="flex items-center gap-4 rounded-2xl border border-green/10 bg-surface p-4"
              >
                <span className="rounded-xl bg-gradient-to-br from-green to-green-deep px-3 py-2 text-xs font-bold text-white">
                  {row.k}
                </span>
                <span className="text-sm text-muted">{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-24">
        <div className="relative overflow-hidden rounded-3xl border border-green/20 bg-gradient-to-br from-green-soft/20 via-mint/10 to-surface p-10 text-center">
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
