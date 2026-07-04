import Link from "next/link";

type Variant = "nav" | "primary";

interface LaunchMenuProps {
  variant?: Variant;
  label?: string;
}

export function LaunchMenu({ variant = "nav", label = "Launch app" }: LaunchMenuProps) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green via-leaf to-green-deep px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgba(16,185,129,0.7)] transition-all hover:brightness-105"
      : "inline-flex items-center gap-1.5 rounded-xl border border-green/25 bg-green/5 px-4 py-2 text-sm font-semibold text-green-deep transition-colors hover:bg-green/10";

  return (
    <Link href="/app" className={className}>
      {label}
    </Link>
  );
}
