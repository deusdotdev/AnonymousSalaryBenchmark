"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const SALARY_SUBMITTED = parseAbiItem(
  "event SalarySubmitted(address indexed user, uint256 indexed categoryId, uint256 count)"
);

const COMPANY_SALARY_SUBMITTED = parseAbiItem(
  "event CompanySalarySubmitted(address indexed company, uint256 indexed categoryId, uint256 count)"
);

async function fetchDiscoveredCategoryIds(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>
): Promise<string[]> {
  const [salaryLogs, companyLogs] = await Promise.all([
    publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: SALARY_SUBMITTED,
      fromBlock: 0n,
      toBlock: "latest",
    }),
    publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: COMPANY_SALARY_SUBMITTED,
      fromBlock: 0n,
      toBlock: "latest",
    }),
  ]);

  const ids = new Set<string>();
  for (const log of salaryLogs) {
    if (log.args.categoryId !== undefined) {
      ids.add(log.args.categoryId.toString());
    }
  }
  for (const log of companyLogs) {
    if (log.args.categoryId !== undefined) {
      ids.add(log.args.categoryId.toString());
    }
  }

  return [...ids];
}

export function useDiscoveredCategoryIds(contractConfigured: boolean) {
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: ["explore-discovered-categories", CONTRACT_ADDRESS],
    enabled: contractConfigured && !!publicClient,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: () => fetchDiscoveredCategoryIds(publicClient!),
  });

  return {
    categoryIds: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
