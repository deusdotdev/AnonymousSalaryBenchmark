import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TierTrendVisual } from "@/components/explore/TierTrendVisual";
import { CITIES, POSITIONS, SENIORITY_LEVELS } from "@/lib/categories";
import type { ExplorePool } from "@/hooks/useExplorePools";

interface ExplorePoolCardProps {
  pool: ExplorePool;
}

export function ExplorePoolCard({ pool }: ExplorePoolCardProps) {
  const { entry } = pool;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          {pool.isLive && (
            <span className="inline-flex rounded-full border border-green/30 bg-green/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-deep">
              Live pool
            </span>
          )}
          <h3 className={`text-base font-bold leading-snug text-ink ${pool.isLive ? "mt-2" : ""}`}>
            {entry.label}
          </h3>
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
