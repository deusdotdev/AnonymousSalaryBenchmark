import type { TierSnapshot, TierTrend } from "@/lib/seed-manifest";

const DIRECTION_STYLES = {
  up: { text: "text-green-deep", badge: "bg-green/10 text-green-deep border-green/20", arrow: "↑" },
  down: { text: "text-amber-700", badge: "bg-amber-500/10 text-amber-700 border-amber-500/30", arrow: "↓" },
  flat: { text: "text-muted", badge: "bg-slate-100 text-muted border-slate-200", arrow: "→" },
} as const;

interface TierTrendVisualProps {
  snapshots: TierSnapshot[];
  trend: TierTrend | null;
  compact?: boolean;
}

export function TierTrendVisual({ snapshots, trend, compact = false }: TierTrendVisualProps) {
  if (snapshots.length === 0) {
    return (
      <p className="text-xs text-muted">No published tier snapshots yet.</p>
    );
  }

  if (snapshots.length === 1) {
    const only = snapshots[0];
    return (
      <p className="text-xs text-muted">
        Tier {only.tier} avg ${only.averageUsd.toLocaleString()} — waiting for next milestone.
      </p>
    );
  }

  const min = Math.min(...snapshots.map((s) => s.averageUsd));
  const max = Math.max(...snapshots.map((s) => s.averageUsd));
  const span = max - min || 1;
  const styles = trend ? DIRECTION_STYLES[trend.direction] : DIRECTION_STYLES.flat;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className={`flex items-end gap-2 ${compact ? "h-16" : "h-24"}`}>
        {snapshots.map((snap, index) => {
          const height = 28 + Math.round(((snap.averageUsd - min) / span) * (compact ? 40 : 56));
          const isLast = index === snapshots.length - 1;
          return (
            <div key={snap.tier} className="flex flex-1 flex-col items-center gap-1">
              <span className={`text-[10px] font-bold tabular-nums ${isLast ? "text-green-deep" : "text-muted"}`}>
                ${(snap.averageUsd / 1000).toFixed(0)}k
              </span>
              <div
                className={`w-full max-w-[3rem] rounded-t-lg transition-all ${
                  isLast
                    ? "bg-gradient-to-t from-green-deep to-green"
                    : "bg-gradient-to-t from-green/30 to-green/50"
                }`}
                style={{ height: `${height}px` }}
              />
              <span className="text-[10px] font-semibold text-muted">n={snap.tier}</span>
            </div>
          );
        })}
        {snapshots.length >= 2 && (
          <div className="hidden flex-1 items-center justify-center sm:flex">
            <div className="h-px flex-1 bg-gradient-to-r from-green/20 via-green/40 to-green" />
          </div>
        )}
      </div>

      {trend && (
        <div className={`flex flex-wrap items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
          <span className="text-muted">
            {trend.from.tier} people → {trend.to.tier} people
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${styles.badge}`}
          >
            <span aria-hidden>{styles.arrow}</span>
            {trend.deltaUsd >= 0 ? "+" : "-"}${Math.abs(trend.deltaUsd).toLocaleString()}
            <span className="font-semibold opacity-80">
              ({trend.deltaPercent >= 0 ? "+" : ""}
              {trend.deltaPercent}%)
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
