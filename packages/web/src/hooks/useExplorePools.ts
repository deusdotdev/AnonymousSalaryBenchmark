"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import { resolveCategory } from "@/lib/category-registry";
import {
  SEED_MANIFEST,
  type SeedCategoryEntry,
  entryFromCategoryRef,
  fillPercent,
  poolHeat,
  poolStatusMessage,
  appCategoryHref,
  buildTierTrend,
  tierSnapshotsFromEntry,
  type PoolHeat,
  type TierSnapshot,
  type TierTrend,
} from "@/lib/seed-manifest";
import { CONTRACT_ADDRESS, salaryFheAbi } from "@/lib/contract";
import { useDiscoveredCategoryIds } from "@/hooks/useDiscoveredCategoryIds";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface ExplorePool {
  entry: SeedCategoryEntry;
  participants: number;
  tier5Average: number | null;
  tier10Average: number | null;
  latestPublishedAverage: number | null;
  tierSnapshots: TierSnapshot[];
  trend: TierTrend | null;
  heat: PoolHeat;
  fillPercent: number;
  statusMessage: string;
  appHref: string;
  liveSynced: boolean;
  isCommunity: boolean;
}

function parseTierAverage(
  finalized: boolean | undefined,
  raw: bigint | undefined
): number | null {
  if (!finalized || raw === undefined) return null;
  return Number(raw);
}

function buildExploreEntries(
  manifestEntries: SeedCategoryEntry[],
  discoveredIds: string[]
): SeedCategoryEntry[] {
  const manifestIds = new Set(manifestEntries.map((e) => e.categoryId));
  const merged = [...manifestEntries];

  for (const categoryId of discoveredIds) {
    if (manifestIds.has(categoryId)) continue;
    const ref = resolveCategory(categoryId);
    if (!ref) continue;
    merged.push(entryFromCategoryRef(ref));
  }

  return merged;
}

export function useExplorePools() {
  const contractConfigured = CONTRACT_ADDRESS !== ZERO_ADDRESS;
  const { categoryIds: discoveredIds, isLoading: discoveryLoading } =
    useDiscoveredCategoryIds(contractConfigured);

  const catalogEntries = useMemo(
    () => buildExploreEntries(SEED_MANIFEST.categories, discoveredIds),
    [discoveredIds]
  );

  const manifestIdSet = useMemo(
    () => new Set(SEED_MANIFEST.categories.map((c) => c.categoryId)),
    []
  );

  const countContracts = useMemo(
    () =>
      catalogEntries.map((cat) => ({
        address: CONTRACT_ADDRESS,
        abi: salaryFheAbi,
        functionName: "getBucketCount" as const,
        args: [BigInt(cat.categoryId)] as const,
      })),
    [catalogEntries]
  );

  const tierContracts = useMemo(
    () =>
      catalogEntries.flatMap((cat) => {
        const id = BigInt(cat.categoryId);
        return [
          {
            address: CONTRACT_ADDRESS,
            abi: salaryFheAbi,
            functionName: "isTierFinalized" as const,
            args: [id, 5n] as const,
          },
          {
            address: CONTRACT_ADDRESS,
            abi: salaryFheAbi,
            functionName: "getClearAverage" as const,
            args: [id, 5n] as const,
          },
          {
            address: CONTRACT_ADDRESS,
            abi: salaryFheAbi,
            functionName: "isTierFinalized" as const,
            args: [id, 10n] as const,
          },
          {
            address: CONTRACT_ADDRESS,
            abi: salaryFheAbi,
            functionName: "getClearAverage" as const,
            args: [id, 10n] as const,
          },
        ];
      }),
    [catalogEntries]
  );

  const { data: countResults, isLoading: countsLoading } = useReadContracts({
    contracts: countContracts,
    query: { enabled: contractConfigured && catalogEntries.length > 0 },
  });

  const { data: tierResults, isLoading: tiersLoading } = useReadContracts({
    contracts: tierContracts,
    query: { enabled: contractConfigured && catalogEntries.length > 0 },
  });

  const pools: ExplorePool[] = useMemo(() => {
    return catalogEntries
      .map((entry, index) => {
        const isCommunity = !manifestIdSet.has(entry.categoryId);
        const onChainCount = countResults?.[index]?.result;
        const participants =
          onChainCount !== undefined ? Number(onChainCount) : entry.participantCount;

        const tierBase = index * 4;
        const liveTier5 = parseTierAverage(
          tierResults?.[tierBase]?.result as boolean | undefined,
          tierResults?.[tierBase + 1]?.result as bigint | undefined
        );
        const liveTier10 = parseTierAverage(
          tierResults?.[tierBase + 2]?.result as boolean | undefined,
          tierResults?.[tierBase + 3]?.result as bigint | undefined
        );

        const tier5Average = liveTier5 ?? entry.tier5AverageUsd;
        const tier10Average = liveTier10 ?? entry.tier10AverageUsd;
        const latestPublishedAverage = tier10Average ?? tier5Average;
        const tierSnapshots = tierSnapshotsFromEntry(entry, {
          tier5: tier5Average,
          tier10: tier10Average,
        });
        const trend = buildTierTrend(tierSnapshots);
        const heat = poolHeat(participants);

        return {
          entry,
          participants,
          tier5Average,
          tier10Average,
          latestPublishedAverage,
          tierSnapshots,
          trend,
          heat,
          fillPercent: fillPercent(participants),
          statusMessage: poolStatusMessage(participants, tier10Average, tier5Average),
          appHref: appCategoryHref(entry.positionId, entry.cityId, entry.seniorityId),
          liveSynced: onChainCount !== undefined,
          isCommunity,
        };
      })
      .filter((pool) => !pool.isCommunity || pool.participants > 0);
  }, [catalogEntries, countResults, tierResults, manifestIdSet]);

  const summary = useMemo(() => {
    const live = pools.filter((p) => p.heat === "live").length;
    const warming = pools.filter((p) => p.heat === "warming").length;
    const published = pools.filter((p) => p.latestPublishedAverage != null).length;
    const withTrend = pools.filter((p) => p.trend != null).length;
    const rising = pools.filter((p) => p.trend?.direction === "up").length;
    const community = pools.filter((p) => p.isCommunity).length;
    const demo = pools.filter((p) => !p.isCommunity).length;
    return { total: pools.length, live, warming, published, withTrend, rising, community, demo };
  }, [pools]);

  return {
    pools,
    summary,
    seededAt: SEED_MANIFEST.seededAt,
    network: SEED_MANIFEST.network,
    contractAddress: SEED_MANIFEST.contractAddress,
    contractConfigured,
    isLoading:
      contractConfigured && (discoveryLoading || countsLoading || tiersLoading),
  };
}
