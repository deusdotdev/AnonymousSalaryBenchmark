import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TierTrendVisual } from "@/components/explore/TierTrendVisual";
import { CITIES, POSITIONS, SENIORITY_LEVELS } from "@/lib/categories";
import { poolHeatLabel } from "@/lib/seed-manifest";
import type { ExplorePool } from "@/hooks/useExplorePools";

const HEAT_STYLES = {
  live: {
    badge: "border-green/30 bg-green/10 text-green-deep",
    bar: "bg-gradient-to-r from-green to-green-deep",
    ring: "ring-green/20",
  },
  warming: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-700",
    bar: "bg-gradient-to-r from-amber-400 to-amber-600",
    ring: "ring-amber-500/20",
  },
  empty: {
    badge: "border-slate-200 bg-slate-50 text-slate-500",
    bar: "bg-slate-200",
    ring: "ring-slate-200",
  },
} as const;

interface ExplorePoolCardProps {
  pool: ExplorePool;
}

export function ExplorePoolCard({ pool }: ExplorePoolCardProps) {
  const styles = HEAT_STYLES[pool.heat];
  const { entry } = pool;

  return (
    <Card glow={pool.heat === "live" ? "emerald" : pool.heat === "warming" ? "cyan" : "violet"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}
            >
              {poolHeatLabel(pool.heat)}
            </span>
            {pool.isCommunity && (
              <span className="inline-flex rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-800">
                Community
              </span>
            )}
          </div>
          <h3 className="mt-2 text-base font-bold leading-snug text-ink">{entry.label}</h3>
        </div>
        {pool.latestPublishedAverage != null && (
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Published</p>
            <p className="bg-gradient-to-r from-green to-green-deep bg-clip-text text-xl font-black text-transparent">
              ${pool.latestPublishedAverage.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[POSITIONS[entry.positionId], CITIES[entry.cityId], SENIORITY_LEVELS[entry.seniorityId]].map(
          (tag) => (
            <span
              key={tag}
              className="rounded-full border border-green/10 bg-green/[0.04] px-2 py-0.5 text-[11px] font-medium text-muted"
            >
              {tag}
            </span>
          )
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{pool.statusMessage}</p>

      <div className={`mt-4 rounded-2xl p-3 ring-1 ${styles.ring}`}>
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-muted">
          <span>Pool fill</span>
          <span>
            {pool.isCommunity
              ? `${pool.participants} participants`
              : `${pool.participants}/10 demo slots`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-green/10">
          <div
            className={`h-full rounded-full transition-all ${styles.bar}`}
            style={{ width: `${pool.fillPercent}%` }}
          />
        </div>
      </div>

      {(pool.tier5Average != null || pool.tier10Average != null) && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
          {pool.tier5Average != null && (
            <div className="rounded-xl border border-green/10 bg-white/60 px-2 py-2">
              <p className="text-muted">Tier 5</p>
              <p className="font-bold text-green-deep">${pool.tier5Average.toLocaleString()}</p>
            </div>
          )}
          {pool.tier10Average != null && (
            <div className="rounded-xl border border-green/10 bg-white/60 px-2 py-2">
              <p className="text-muted">Tier 10</p>
              <p className="font-bold text-green-deep">${pool.tier10Average.toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {pool.tierSnapshots.length > 0 && (
        <div className="mt-4 rounded-2xl border border-green/10 bg-white/50 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted">Tier trend</p>
          <TierTrendVisual snapshots={pool.tierSnapshots} trend={pool.trend} compact />
        </div>
      )}

      <Link
        href={pool.appHref}
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-green/20 bg-green/5 px-4 py-2.5 text-sm font-semibold text-green-deep transition-colors hover:bg-green/10"
      >
        Open in benchmark app
      </Link>
    </Card>
  );
}
