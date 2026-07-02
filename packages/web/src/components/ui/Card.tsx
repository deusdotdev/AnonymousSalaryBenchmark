import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: "violet" | "cyan" | "emerald";
}

const glowMap = {
  violet: "before:bg-green-soft/30",
  cyan: "before:bg-mint/40",
  emerald: "before:bg-leaf/30",
} as const;

export function Card({ children, className = "", glow = "violet" }: CardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-green/15 bg-surface p-6 shadow-[0_24px_60px_-30px_rgba(6,95,70,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-green/30 hover:shadow-[0_32px_70px_-28px_rgba(16,185,129,0.35)] before:absolute before:-right-16 before:-top-16 before:h-44 before:w-44 before:rounded-full before:blur-3xl before:content-[''] ${glowMap[glow]} ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
