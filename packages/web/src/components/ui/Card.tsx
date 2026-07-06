import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-green/15 bg-surface p-6 shadow-[0_24px_60px_-30px_rgba(6,95,70,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-green/30 hover:shadow-[0_32px_70px_-28px_rgba(16,185,129,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}
