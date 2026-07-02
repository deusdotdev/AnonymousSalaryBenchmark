export function AppHeader() {
  return (
    <header className="max-w-3xl">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green/20 bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
        <span className="h-2 w-2 animate-pulse-glow rounded-full bg-green" />
        Confidential on Sepolia &middot; Zama FHEVM
      </div>
      <h1 className="bg-gradient-to-r from-green-deep via-green to-leaf bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent sm:text-4xl">
        Submit, aggregate, compare.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Pick your category, submit your encrypted salary, and unlock the category
        average once five people join. Your number never leaves your browser in
        clear text.
      </p>
    </header>
  );
}
