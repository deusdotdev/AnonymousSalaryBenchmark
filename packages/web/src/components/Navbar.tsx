"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BrandMark } from "@/components/BrandMark";
import { LaunchMenu } from "@/components/LaunchMenu";

const NAV_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "How it works", href: "/how-it-works/overview" },
];

export function Navbar() {
  const pathname = usePathname();
  const showWallet = pathname === "/app" || pathname.startsWith("/app/");

  return (
    <div className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-10 xl:px-14">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-green/20 bg-white/85 px-4 py-2.5 shadow-[0_12px_40px_-16px_rgba(6,95,70,0.35)] backdrop-blur-xl sm:px-6 sm:py-3">
        <BrandMark asLink size="lg" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/how-it-works/overview"
                  ? pathname.startsWith("/how-it-works")
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-green/10 text-green-deep"
                      : "text-muted hover:bg-green/5 hover:text-green-deep"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="hidden sm:block">
            <LaunchMenu variant="nav" />
          </div>
          {showWallet && (
            <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
          )}
        </div>
      </nav>
    </div>
  );
}
