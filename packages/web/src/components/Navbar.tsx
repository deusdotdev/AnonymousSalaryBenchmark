"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BrandMark } from "@/components/BrandMark";
import { LaunchMenu } from "@/components/LaunchMenu";
import { PageContainer } from "@/components/PageContainer";

const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works/overview" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-green/15 bg-white/75 shadow-[0_8px_32px_-20px_rgba(16,185,129,0.45)] backdrop-blur-xl">
      <PageContainer className="flex items-center justify-between py-3.5">
        <BrandMark asLink size="lg" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/how-it-works/overview"
                  ? pathname.startsWith("/how-it-works")
                  : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
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
          <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
        </div>
      </PageContainer>
    </nav>
  );
}
