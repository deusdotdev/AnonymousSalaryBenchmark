import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { APP_NAME } from "@/lib/brand";
import { PageContainer } from "@/components/PageContainer";

const X_PROFILE_URL = "https://x.com/ex_machinam";

const PRODUCT_LINKS = [
  { label: "Explore pools", href: "/explore" },
  { label: "Submit salary", href: "/app" },
  { label: "How it works", href: "/how-it-works/overview" },
];

const RESOURCE_LINKS = [
  { label: "Zama FHEVM", href: "https://docs.zama.ai/fhevm" },
  { label: "Zama Protocol", href: "https://docs.zama.org/protocol" },
  { label: "Sepolia faucet", href: "https://sepoliafaucet.com" },
];

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-green/15 bg-gradient-to-b from-white/80 to-green/5 backdrop-blur-xl">
      <PageContainer className="py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <BrandMark asLink />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Confidential salary benchmarks powered by fully homomorphic encryption.
              Share your number encrypted, see the market, never get exposed.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink">Product</h3>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-green-deep"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink">Resources</h3>
            <ul className="mt-4 space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-muted transition-colors hover:text-green-deep"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 border-t border-green/10 pt-6 sm:grid-cols-3 sm:items-center">
          <p className="text-center text-xs text-muted sm:text-left">
            &copy; {new Date().getFullYear()} {APP_NAME} &middot; Built with Zama FHEVM
          </p>
          <p className="text-center text-xs text-muted">
            built by{" "}
            <a
              href={X_PROFILE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-green-deep underline decoration-green/30 underline-offset-4 transition-colors hover:text-green hover:decoration-green"
            >
              ex_machinam
            </a>
          </p>
          <p className="flex items-center justify-center gap-2 text-xs text-muted sm:justify-end">
            <span className="h-2 w-2 animate-pulse-glow rounded-full bg-green" />
            Next.js &middot; wagmi &middot; Relayer SDK
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
