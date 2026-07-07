"use client";

import { useQuery } from "@tanstack/react-query";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import type { DiscoveredCategory } from "@/lib/explore-discovery";

async function fetchDiscoveredCategories(): Promise<DiscoveredCategory[]> {
  const response = await fetch("/api/explore/discover");
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Discovery failed (${response.status})`);
  }

  const body = (await response.json()) as { categories: DiscoveredCategory[] };
  return body.categories;
}

export function useDiscoveredCategoryIds(contractConfigured: boolean) {
  const query = useQuery({
    queryKey: ["explore-discovered-categories", CONTRACT_ADDRESS],
    enabled: contractConfigured,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    queryFn: fetchDiscoveredCategories,
  });

  return {
    discovered: query.data ?? [],
    categoryIds: (query.data ?? []).map((item) => item.categoryId),
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export type { DiscoveredCategory };
