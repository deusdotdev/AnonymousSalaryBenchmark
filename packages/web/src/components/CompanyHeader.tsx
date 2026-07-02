export function CompanyHeader() {
  return (
    <header className="max-w-3xl">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green/20 bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
        <span className="h-2 w-2 animate-pulse-glow rounded-full bg-green" />
        For employers &middot; Confidential on Sepolia
      </div>
      <h1 className="bg-gradient-to-r from-green-deep via-green to-leaf bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent sm:text-4xl">
        Benchmark your company against the market.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Submit your team&apos;s salaries encrypted, by role, city, and experience. Once
        five employees are in a category, privately learn whether you pay above or
        below the live market average, without revealing a single number.
      </p>
    </header>
  );
}
