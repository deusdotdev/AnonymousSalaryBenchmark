import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TierTrendVisual } from "@/components/explore/TierTrendVisual";
import type { ExplorePool } from "@/hooks/useExplorePools";

interface ExploreTrendCardProps {
  pool: ExplorePool;
}

export function ExploreTrendCard({ pool }: ExploreTrendCardProps) {
  const { entry, trend, tierSnapshots } = pool;

  return (
    <Card glow="cyan">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Tier trend</p>
            {pool.isCommunity && (
              <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800">
                Community
              </span>
            )}
          </div>
          <h3 className="mt-1 text-base font-bold text-ink">{entry.label}</h3>
        </div>
        {trend && (
          <p className="text-right text-xs text-muted">
            Latest
            <span className="block text-lg font-black text-green-deep">
              ${trend.to.averageUsd.toLocaleString()}
            </span>
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-green/10 bg-green/[0.03] p-4">
        <TierTrendVisual snapshots={tierSnapshots} trend={trend} />
      </div>

      {trend ? (
        <p className="mt-3 text-sm text-muted">
          Published average moved from{" "}
          <span className="font-semibold text-ink">${trend.from.averageUsd.toLocaleString()}</span> at{" "}
          {trend.from.tier} participants to{" "}
          <span className="font-semibold text-ink">${trend.to.averageUsd.toLocaleString()}</span> at{" "}
          {trend.to.tier}.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Need at least two published tiers (e.g. 5 and 10 participants) to show a trend line.
        </p>
      )}

      <Link
        href={pool.appHref}
        className="mt-4 inline-flex text-sm font-semibold text-green-deep hover:underline"
      >
        View pool details →
      </Link>
    </Card>
  );
}
