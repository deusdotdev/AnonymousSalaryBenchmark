"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { ExplorePoolCard } from "@/components/explore/ExplorePoolCard";
import { ExploreTrendCard } from "@/components/explore/ExploreTrendCard";
import { useExplorePools } from "@/hooks/useExplorePools";
import type { PoolHeat } from "@/lib/seed-manifest";

type View = "pools" | "trends";
type Filter = "all" | PoolHeat;

const VIEWS: { id: View; label: string }[] = [
  { id: "pools", label: "Pools" },
  { id: "trends", label: "Trends" },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "warming", label: "Warming" },
  { id: "empty", label: "Empty" },
];

export function ExplorePageContent() {
  const [view, setView] = useState<View>("pools");
  const [filter, setFilter] = useState<Filter>("all");
  const { pools, summary, isLoading } = useExplorePools();

  const visible = useMemo(() => {
    const base = filter === "all" ? pools : pools.filter((p) => p.heat === filter);
    if (view === "trends") {
      return [...base].sort((a, b) => {
        const aDelta = a.trend?.deltaPercent ?? -Infinity;
        const bDelta = b.trend?.deltaPercent ?? -Infinity;
        return bDelta - aDelta;
      });
    }
    return base;
  }, [filter, pools, view]);

  const heroCopy =
    view === "pools"
      ? {
          title: "Which pools are live?",
          body: "See where confidential salary data is already flowing. Pick a category with enough participants before you submit.",
        }
      : {
          title: "How are averages moving?",
          body: "Each tier snapshot (5, 10, 15… participants) publishes once on-chain. Compare early vs later pools to spot market direction.",
        };

  return (
    <main className="w-full py-10 sm:py-14">
      <PageContainer>
        <section className="relative overflow-hidden rounded-[2rem] border border-green/15 bg-gradient-to-br from-white/90 via-green/5 to-mint/10 px-6 py-10 sm:px-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green-soft/30 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-green-deep">Explore</p>
            <h1 className="mt-2 bg-gradient-to-r from-green-deep via-green to-leaf bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
              {heroCopy.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{heroCopy.body}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(view === "pools"
            ? [
                { label: "Demo pools", value: summary.total },
                { label: "Live (k≥5)", value: summary.live },
                { label: "Published avg", value: summary.published },
                { label: "Warming", value: summary.warming },
              ]
            : [
                { label: "With tier history", value: summary.withTrend },
                { label: "Trending up", value: summary.rising },
                { label: "Published tiers", value: summary.published },
                { label: "Demo pools", value: summary.total },
              ]
          ).map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-green/10 bg-white/70 px-5 py-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
              <p className="mt-1 text-3xl font-black text-ink">{stat.value}</p>
            </div>
          ))}
        </section>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  view === v.id
                    ? "bg-gradient-to-r from-green to-green-deep text-white shadow-md"
                    : "border border-green/15 bg-white text-muted hover:text-green-deep"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {view === "pools" && (
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    filter === f.id
                      ? "bg-green/15 text-green-deep"
                      : "text-muted hover:bg-green/5 hover:text-green-deep"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <p className="text-xs font-medium text-muted">Syncing from Sepolia…</p>
          )}
        </div>

        {view === "trends" && (
          <p className="mt-4 text-sm text-muted">
            Sorted by largest tier-to-tier change. Example:{" "}
            <span className="font-semibold text-ink">5 people → 10 people</span> shows how the
            published average shifted as the pool grew.
          </p>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((pool) =>
            view === "pools" ? (
              <ExplorePoolCard key={pool.entry.categoryId} pool={pool} />
            ) : (
              <ExploreTrendCard key={pool.entry.categoryId} pool={pool} />
            )
          )}
        </div>

        {visible.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">No pools match this filter.</p>
        )}
      </PageContainer>
    </main>
  );
}
