"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { IconBadge } from "@/components/icons/IconBadge";
import { CITIES, MIN_PARTICIPANTS, POSITIONS, SENIORITY_LEVELS } from "@/lib/categories";

interface StatsCardProps {
  position: number;
  city: number;
  experience: number;
  participants: number;
  tierTarget: number;
  pendingPublishTier: number | null;
  latestFinalizedTier: number;
  clearAverage?: number;
  comparison?: boolean;
  hasSubmitted: boolean;
  isConnected: boolean;
  sdkReady: boolean;
  contractConfigured: boolean;
  working: boolean;
  onRelease: () => void;
  onCompare: () => void;
}

export function StatsCard({
  position,
  city,
  experience,
  participants,
  tierTarget,
  pendingPublishTier,
  latestFinalizedTier,
  clearAverage,
  comparison,
  hasSubmitted,
  isConnected,
  sdkReady,
  contractConfigured,
  working,
  onRelease,
  onCompare,
}: StatsCardProps) {
  const thresholdMet = participants >= MIN_PARTICIPANTS;
  const baseDisabled = !isConnected || !sdkReady || !contractConfigured || working;

  return (
    <Card glow="cyan">
      <div className="mb-5 flex items-center gap-3">
        <IconBadge name="chart" className="shrink-0" />
        <div>
          <h2 className="text-lg font-bold text-ink">Category insights</h2>
          <p className="text-xs text-muted">
            Public tiers at {MIN_PARTICIPANTS}, {MIN_PARTICIPANTS * 2}, {MIN_PARTICIPANTS * 3}...
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[POSITIONS[position], CITIES[city], SENIORITY_LEVELS[experience]].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-green/15 bg-green/5 px-3 py-1 text-xs font-semibold text-green-deep"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 rounded-3xl border border-green/10 bg-green/[0.03] p-5">
        <ProgressRing
          current={Math.min(participants, tierTarget)}
          total={tierTarget}
        />

        {latestFinalizedTier > 0 && clearAverage !== undefined ? (
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted">
              Latest published average ({latestFinalizedTier} participants)
            </p>
            <p className="bg-gradient-to-r from-green to-green-deep bg-clip-text text-3xl font-black text-transparent">
              ${clearAverage.toLocaleString()}
            </p>
            <p className="text-xs text-muted">USD / year &middot; public snapshot</p>
          </div>
        ) : (
          <p className="text-center text-sm text-muted">
            {!thresholdMet
              ? `${MIN_PARTICIPANTS - participants} more participant(s) until tier ${MIN_PARTICIPANTS}.`
              : pendingPublishTier !== null
                ? `Tier ${pendingPublishTier} ready to publish. Next tier at ${tierTarget} participants.`
                : `${tierTarget - participants} more until tier ${tierTarget}.`}
          </p>
        )}
      </div>

      {comparison !== undefined && (
        <div
          className={`mt-4 rounded-2xl border p-4 text-center text-sm font-semibold ${
            comparison
              ? "border-green/30 bg-green/10 text-green-deep"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700"
          }`}
        >
          {comparison
            ? "\u2191 You are above the live pool average."
            : "\u2193 You are at or below the live pool average."}
        </div>
      )}

      <div className="mt-5 grid gap-3">
        <Button
          variant="secondary"
          loading={working}
          disabled={baseDisabled || pendingPublishTier === null}
          onClick={onRelease}
        >
          {pendingPublishTier !== null
            ? `Publish tier ${pendingPublishTier} average`
            : latestFinalizedTier > 0
              ? "All eligible tiers published"
              : "Waiting for tier threshold"}
        </Button>
        <Button
          variant="ghost"
          disabled={baseDisabled || !thresholdMet || !hasSubmitted}
          onClick={onCompare}
        >
          Compare my salary privately
        </Button>
      </div>
    </Card>
  );
}
