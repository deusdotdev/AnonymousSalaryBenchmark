import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
}

const variantMap: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-green via-leaf to-green-deep text-white shadow-[0_12px_30px_-10px_rgba(16,185,129,0.7)] hover:brightness-105",
  secondary:
    "bg-gradient-to-r from-green-soft to-green text-white font-bold shadow-[0_12px_30px_-10px_rgba(52,211,153,0.7)] hover:brightness-105",
  ghost: "border border-green/25 bg-green/5 text-green-deep hover:bg-green/10",
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 ${variantMap[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
