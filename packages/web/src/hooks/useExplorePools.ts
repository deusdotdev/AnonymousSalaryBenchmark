"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";
import {
  SEED_MANIFEST,
  type SeedCategoryEntry,
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
}

function parseTierAverage(
  finalized: boolean | undefined,
  raw: bigint | undefined
): number | null {
  if (!finalized || raw === undefined) return null;
  return Number(raw);
}

export function useExplorePools() {
  const contractConfigured = CONTRACT_ADDRESS !== ZERO_ADDRESS;

  const countContracts = useMemo(
    () =>
      SEED_MANIFEST.categories.map((cat) => ({
        address: CONTRACT_ADDRESS,
        abi: salaryFheAbi,
        functionName: "getBucketCount" as const,
        args: [BigInt(cat.categoryId)] as const,
      })),
    []
  );

  const tierContracts = useMemo(
    () =>
      SEED_MANIFEST.categories.flatMap((cat) => {
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
    []
  );

  const { data: countResults, isLoading: countsLoading } = useReadContracts({
    contracts: countContracts,
    query: { enabled: contractConfigured },
  });

  const { data: tierResults, isLoading: tiersLoading } = useReadContracts({
    contracts: tierContracts,
    query: { enabled: contractConfigured },
  });

  const pools: ExplorePool[] = useMemo(() => {
    return SEED_MANIFEST.categories.map((entry, index) => {
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
      };
    });
  }, [countResults, tierResults]);

  const summary = useMemo(() => {
    const live = pools.filter((p) => p.heat === "live").length;
    const warming = pools.filter((p) => p.heat === "warming").length;
    const published = pools.filter((p) => p.latestPublishedAverage != null).length;
    const withTrend = pools.filter((p) => p.trend != null).length;
    const rising = pools.filter((p) => p.trend?.direction === "up").length;
    return { total: pools.length, live, warming, published, withTrend, rising };
  }, [pools]);

  return {
    pools,
    summary,
    seededAt: SEED_MANIFEST.seededAt,
    network: SEED_MANIFEST.network,
    contractAddress: SEED_MANIFEST.contractAddress,
    contractConfigured,
    isLoading: contractConfigured && (countsLoading || tiersLoading),
  };
}
