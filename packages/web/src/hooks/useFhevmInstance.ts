"use client";

import { useFhevmContext } from "@/context/FhevmProvider";

export type { FhevmInstance } from "@/lib/fhevm-instance";

export function useFhevmInstance() {
  const { instance, loading, error } = useFhevmContext();
  return { instance, loading, error };
}
