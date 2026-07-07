"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import deployment from "@/abi/deployment.json";

const SALARY_SUBMITTED = parseAbiItem(
  "event SalarySubmitted(address indexed user, uint256 indexed categoryId, uint256 count)"
);

const COMPANY_SALARY_SUBMITTED = parseAbiItem(
  "event CompanySalarySubmitted(address indexed company, uint256 indexed categoryId, uint256 count)"
);

const AVERAGE_FINALIZED = parseAbiItem(
  "event AverageFinalized(uint256 indexed categoryId, uint256 indexed tier, uint64 clearAverage)"
);

/** Alchemy and most dedicated RPCs allow ~10k blocks per getLogs request. */
const LOG_CHUNK_SIZE = 10_000n;
const LOG_LOOKBACK = 600_000n;

export interface DiscoveredCategory {
  categoryId: string;
  /** Latest participant count from submit events, when available. */
  participantCount: number;
}

function mergeLogCounts(target: Map<string, number>, logs: readonly unknown[]) {
  for (const log of logs) {
    if (typeof log !== "object" || log === null || !("args" in log)) continue;
    const args = (log as { args?: { categoryId?: bigint; count?: bigint } }).args;
    if (!args || args.categoryId === undefined) continue;
    const id = args.categoryId.toString();
    const count = args.count !== undefined ? Number(args.count) : 0;
    target.set(id, Math.max(target.get(id) ?? 0, count));
  }
}

function mergeFinalizedCategoryIds(target: Map<string, number>, logs: readonly unknown[]) {
  for (const log of logs) {
    if (typeof log !== "object" || log === null || !("args" in log)) continue;
    const args = (log as { args?: { categoryId?: bigint } }).args;
    if (!args || args.categoryId === undefined) continue;
    const id = args.categoryId.toString();
    if (!target.has(id)) target.set(id, 0);
  }
}

function resolveScanStartBlock(latest: bigint): bigint {
  const deployBlock =
    "deployBlock" in deployment && deployment.deployBlock != null
      ? BigInt(deployment.deployBlock as number | string)
      : null;
  if (deployBlock != null) return deployBlock;
  return latest > LOG_LOOKBACK ? latest - LOG_LOOKBACK : 0n;
}

async function getLogsChunked(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  event:
    | typeof SALARY_SUBMITTED
    | typeof COMPANY_SALARY_SUBMITTED
    | typeof AVERAGE_FINALIZED
) {
  const latest = await publicClient.getBlockNumber();
  const start = resolveScanStartBlock(latest);
  const logs: Awaited<ReturnType<typeof publicClient.getLogs>> = [];

  for (let from = start; from <= latest; from += LOG_CHUNK_SIZE) {
    const to = from + LOG_CHUNK_SIZE - 1n > latest ? latest : from + LOG_CHUNK_SIZE - 1n;
    try {
      const chunk = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event,
        fromBlock: from,
        toBlock: to,
      });
      logs.push(...chunk);
    } catch {
      /* Skip failed chunks so a partial scan still surfaces recent pools. */
    }
  }

  return logs;
}

async function fetchDiscoveredCategories(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>
): Promise<DiscoveredCategory[]> {
  const [salaryLogs, companyLogs, finalizedLogs] = await Promise.all([
    getLogsChunked(publicClient, SALARY_SUBMITTED),
    getLogsChunked(publicClient, COMPANY_SALARY_SUBMITTED),
    getLogsChunked(publicClient, AVERAGE_FINALIZED),
  ]);

  const counts = new Map<string, number>();
  mergeLogCounts(counts, salaryLogs);
  mergeLogCounts(counts, companyLogs);
  mergeFinalizedCategoryIds(counts, finalizedLogs);

  return [...counts.entries()].map(([categoryId, participantCount]) => ({
    categoryId,
    participantCount,
  }));
}

export function useDiscoveredCategoryIds(contractConfigured: boolean) {
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: ["explore-discovered-categories", CONTRACT_ADDRESS],
    enabled: contractConfigured && !!publicClient,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: () => fetchDiscoveredCategories(publicClient!),
  });

  return {
    discovered: query.data ?? [],
    categoryIds: (query.data ?? []).map((item) => item.categoryId),
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
