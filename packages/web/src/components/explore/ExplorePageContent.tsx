"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { ExplorePoolCard } from "@/components/explore/ExplorePoolCard";
import { ExploreTrendCard } from "@/components/explore/ExploreTrendCard";
import { useExplorePools } from "@/hooks/useExplorePools";

type View = "pools" | "trends";

const VIEWS: { id: View; label: string }[] = [
  { id: "pools", label: "Pools" },
  { id: "trends", label: "Trends" },
];

export function ExplorePageContent() {
  const [view, setView] = useState<View>("pools");
  const { pools, summary, discoveryError } = useExplorePools();

  const visible = useMemo(() => {
    if (view === "trends") {
      return [...pools].sort((a, b) => {
        const aDelta = a.trend?.deltaPercent ?? -Infinity;
        const bDelta = b.trend?.deltaPercent ?? -Infinity;
        return bDelta - aDelta;
      });
    }
    return pools;
  }, [pools, view]);

  const heroCopy =
    view === "pools"
      ? {
          title: "Which pools are live?",
          body: "See where confidential salary data is already flowing — seeded demo pools plus any category with on-chain submissions.",
        }
      : {
          title: "How are averages moving?",
          body: "Each tier snapshot (5, 10, 15… participants) publishes once on-chain. Compare early vs later pools to spot market direction.",
        };

  return (
    <main className="w-full py-10 sm:py-14">
      <PageContainer>
        <section className="rounded-[2rem] border border-green/15 bg-gradient-to-br from-white/90 via-green/5 to-mint/10 px-6 py-10 sm:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-green-deep">Explore</p>
            <h1 className="mt-2 bg-gradient-to-r from-green-deep via-green to-leaf bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
              {heroCopy.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{heroCopy.body}</p>
          </div>
        </section>

        {discoveryError && (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-800">
            Could not load contract event logs for new pools. Seeded demo pools may still appear.
            Set <code className="font-mono text-xs">ETHERSCAN_API_KEY</code> on the server (Vercel env
            or <code className="font-mono text-xs">packages/web/.env.local</code>) and redeploy.
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(view === "pools"
            ? [
                { label: "All pools", value: summary.total },
                { label: "Live (k≥5)", value: summary.live },
                { label: "Published avg", value: summary.published },
                { label: "With tier data", value: summary.withTrend },
              ]
            : [
                { label: "With tier history", value: summary.withTrend },
                { label: "Trending up", value: summary.rising },
                { label: "Published avg", value: summary.published },
                { label: "All pools", value: summary.total },
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

        <div className="mt-8 flex flex-wrap gap-2">
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
          <p className="mt-10 text-center text-sm text-muted">No pools to show yet.</p>
        )}
      </PageContainer>
    </main>
  );
}
