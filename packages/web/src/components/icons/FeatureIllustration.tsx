export type FeatureIllustrationVariant = "encrypted" | "anonymity" | "comparison";

interface FeatureIllustrationProps {
  variant: FeatureIllustrationVariant;
  className?: string;
}

export function FeatureIllustration({ variant, className = "" }: FeatureIllustrationProps) {
  return (
    <div
      className={`relative flex h-36 w-full items-center justify-center overflow-hidden rounded-2xl border border-green/10 bg-gradient-to-br from-green/[0.06] via-white to-mint/20 ${className}`}
      aria-hidden
    >
      {variant === "encrypted" && <EncryptedArt />}
      {variant === "anonymity" && <AnonymityArt />}
      {variant === "comparison" && <ComparisonArt />}
    </div>
  );
}

function EncryptedArt() {
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full max-w-[220px]" fill="none">
      <circle cx="120" cy="70" r="52" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
      <rect x="98" y="58" width="44" height="36" rx="6" fill="#10b981" opacity="0.15" />
      <rect x="102" y="62" width="36" height="28" rx="4" stroke="#047857" strokeWidth="2.5" />
      <path d="M110 62v-8a10 10 0 0 1 20 0v8" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="88" cy="48" r="4" fill="#34d399" />
      <circle cx="152" cy="44" r="3" fill="#6ee7b7" />
      <circle cx="164" cy="88" r="3.5" fill="#22c55e" />
      <path d="M72 92h24M144 52h20" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <text x="120" y="78" textAnchor="middle" fontSize="11" fontWeight="700" fill="#047857">
        euint64
      </text>
    </svg>
  );
}

function AnonymityArt() {
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full max-w-[220px]" fill="none">
      {[48, 78, 108, 138, 168, 198].map((x, i) => (
        <g key={x} opacity={0.35 + i * 0.1}>
          <circle cx={x} cy="58" r="10" fill={i < 5 ? "#10b981" : "#047857"} opacity="0.25" />
          <circle cx={x} cy="52" r="7" stroke="#047857" strokeWidth="2" />
          <path d={`M${x - 10} 88 Q${x} 72 ${x + 10} 88`} stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      <rect x="70" y="95" width="100" height="22" rx="11" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="1.5" />
      <text x="120" y="110" textAnchor="middle" fontSize="11" fontWeight="700" fill="#047857">
        k &ge; 5
      </text>
    </svg>
  );
}

function ComparisonArt() {
  return (
    <svg viewBox="0 0 240 140" className="h-full w-full max-w-[220px]" fill="none">
      <rect x="58" y="88" width="22" height="32" rx="4" fill="#6ee7b7" />
      <rect x="88" y="72" width="22" height="48" rx="4" fill="#34d399" />
      <rect x="118" y="56" width="22" height="64" rx="4" fill="#10b981" />
      <rect x="148" y="64" width="22" height="56" rx="4" fill="#22c55e" />
      <path d="M52 120h136" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
      <circle cx="120" cy="34" r="18" fill="#ecfdf5" stroke="#047857" strokeWidth="2" />
      <path d="M112 34l5 5 10-10" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M170 36h16M178 28v16" stroke="#34d399" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
