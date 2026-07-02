import Image from "next/image";
import Link from "next/link";
import { APP_FULL_NAME, APP_NAME } from "@/lib/brand";

interface BrandMarkProps {
  asLink?: boolean;
  size?: "md" | "lg";
}

export function BrandMark({ asLink = false, size = "md" }: BrandMarkProps) {
  const wrapperSize = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const imageSize = size === "lg" ? 48 : 40;
  const titleClass =
    size === "lg"
      ? "text-xl font-black tracking-tight"
      : "text-lg font-black tracking-tight";

  const content = (
    <>
      <span
        className={`flex ${wrapperSize} shrink-0 items-center justify-center overflow-hidden rounded-full border border-green/15 bg-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.7)] transition-transform group-hover:scale-105`}
      >
        <Image
          src="/gemini-svg.svg"
          alt={`${APP_NAME} logo`}
          width={imageSize}
          height={imageSize}
          priority
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`${titleClass} bg-gradient-to-r from-green via-leaf to-green-deep bg-clip-text text-transparent`}
        >
          {APP_NAME}
        </span>
        <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:block">
          {APP_FULL_NAME}
        </span>
      </span>
    </>
  );

  if (asLink) {
    return (
      <Link href="/" className="group inline-flex items-center gap-2.5">
        {content}
      </Link>
    );
  }

  return <span className="group inline-flex items-center gap-2.5">{content}</span>;
}
