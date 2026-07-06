import Link from "next/link";

export function DocGuideCta() {
  return (
    <section
      id="ready-to-try"
      className="mt-8 scroll-mt-32 rounded-[1.75rem] border border-green/20 bg-gradient-to-br from-green-soft/20 via-mint/10 to-surface p-6 sm:p-8"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-deep">Try it live</p>
        <h2 className="mt-1 text-xl font-bold text-ink sm:text-2xl">Ready to benchmark privately?</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Connect your wallet on Sepolia and submit your first encrypted salary, or browse demo pools
          on Explore.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-xl bg-green-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green"
          >
            Get started
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center rounded-xl border border-green/25 bg-white/60 px-5 py-2.5 text-sm font-semibold text-green-deep transition-colors hover:bg-white/90"
          >
            Explore pools
          </Link>
        </div>
      </div>
    </section>
  );
}
