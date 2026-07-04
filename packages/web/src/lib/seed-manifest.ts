import rawManifest from "@/data/seed-manifest.json";
import { MIN_PARTICIPANTS } from "@/lib/categories";

export interface SeedCategoryEntry {
  label: string;
  positionId: number;
  cityId: number;
  seniorityId: number;
  categoryId: string;
  salariesUsd: number[];
  expectedAverageUsd: number;
  participantCount: number;
  tier5AverageUsd: number | null;
  tier10AverageUsd: number | null;
}

export interface SeedManifest {
  seededAt: string | null;
  network: string;
  contractAddress: string;
  note?: string;
  categories: SeedCategoryEntry[];
}

export const SEED_MANIFEST = rawManifest as SeedManifest;

export function isPoolLive(participants: number): boolean {
  return participants >= MIN_PARTICIPANTS;
}

/** Human-readable pool status for Explore cards. */
export function poolStatusMessage(
  participants: number,
  tier10Average: number | null,
  tier5Average: number | null
): string {
  if (participants === 0) {
    return "No submissions yet — be the first.";
  }
  if (participants < MIN_PARTICIPANTS) {
    return `${participants}/${MIN_PARTICIPANTS} people — average unlocks soon.`;
  }
  if (tier10Average != null) {
    return `${participants} people · latest avg $${tier10Average.toLocaleString()}/yr`;
  }
  if (tier5Average != null) {
    return `${participants} people · tier-5 avg $${tier5Average.toLocaleString()}/yr`;
  }
  return `${participants} people · average ready to publish.`;
}

export function appCategoryHref(positionId: number, cityId: number, seniorityId: number): string {
  const params = new URLSearchParams({
    position: String(positionId),
    city: String(cityId),
    seniority: String(seniorityId),
  });
  return `/app?${params.toString()}`;
}

export function fillPercent(participants: number, target = 10): number {
  return Math.min(100, Math.round((participants / target) * 100));
}

export interface TierSnapshot {
  tier: number;
  averageUsd: number;
}

export interface TierTrend {
  snapshots: TierSnapshot[];
  from: TierSnapshot;
  to: TierSnapshot;
  deltaUsd: number;
  deltaPercent: number;
  direction: "up" | "down" | "flat";
}

/** Build ordered tier history from published snapshots (5, 10, 15, …). */
export function buildTierSnapshots(
  tiers: Array<{ tier: number; averageUsd: number | null }>
): TierSnapshot[] {
  return tiers
    .filter((t): t is { tier: number; averageUsd: number } => t.averageUsd != null)
    .sort((a, b) => a.tier - b.tier)
    .map(({ tier, averageUsd }) => ({ tier, averageUsd }));
}

export function buildTierTrend(snapshots: TierSnapshot[]): TierTrend | null {
  if (snapshots.length < 2) return null;
  const from = snapshots[0];
  const to = snapshots[snapshots.length - 1];
  const deltaUsd = to.averageUsd - from.averageUsd;
  const deltaPercent = from.averageUsd === 0 ? 0 : Math.round((deltaUsd / from.averageUsd) * 1000) / 10;
  const direction = deltaUsd > 0 ? "up" : deltaUsd < 0 ? "down" : "flat";
  return { snapshots, from, to, deltaUsd, deltaPercent, direction };
}

export function formatTrendDelta(trend: TierTrend): string {
  const sign = trend.deltaUsd >= 0 ? "+" : "";
  return `${sign}$${Math.abs(trend.deltaUsd).toLocaleString()} (${sign}${trend.deltaPercent}%)`;
}

export function tierSnapshotsFromEntry(
  entry: SeedCategoryEntry,
  live?: { tier5: number | null; tier10: number | null }
): TierSnapshot[] {
  const t5 = live?.tier5 ?? entry.tier5AverageUsd;
  const t10 = live?.tier10 ?? entry.tier10AverageUsd;
  return buildTierSnapshots([
    { tier: 5, averageUsd: t5 },
    { tier: 10, averageUsd: t10 },
  ]);
}

export function entryFromCategoryRef(ref: {
  label: string;
  positionId: number;
  cityId: number;
  seniorityId: number;
  categoryId: string;
}): SeedCategoryEntry {
  return {
    label: ref.label,
    positionId: ref.positionId,
    cityId: ref.cityId,
    seniorityId: ref.seniorityId,
    categoryId: ref.categoryId,
    salariesUsd: [],
    expectedAverageUsd: 0,
    participantCount: 0,
    tier5AverageUsd: null,
    tier10AverageUsd: null,
  };
}
