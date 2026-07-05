import Link from "next/link";

export function DocGuideCta() {
  return (
    <section
      id="ready-to-try"
      className="mt-8 max-w-3xl scroll-mt-32 border-t-2 border-green/25 pt-5"
    >
      <h2 className="text-lg font-semibold text-ink">Ready to try it?</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Connect your wallet on Sepolia and submit your first encrypted salary, or browse demo pools
        on Explore.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/app"
          className="inline-flex items-center justify-center rounded-lg bg-green-deep px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green"
        >
          Get started
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-lg border border-green/20 px-5 py-2.5 text-sm font-semibold text-green-deep transition-colors hover:bg-green/5"
        >
          Explore pools
        </Link>
      </div>
    </section>
  );
}
