"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getFhevmInstance,
  preloadFhevmSdkChunk,
  type FhevmInstance,
} from "@/lib/fhevm-instance";

interface FhevmContextValue {
  instance?: FhevmInstance;
  loading: boolean;
  error?: string;
}

const FhevmContext = createContext<FhevmContextValue>({ loading: true });

export function FhevmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FhevmContextValue>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    let retryId: number | undefined;
    preloadFhevmSdkChunk();

    const stopRetry = () => {
      if (retryId !== undefined) {
        window.clearInterval(retryId);
        retryId = undefined;
      }
    };

    const load = async () => {
      if (typeof window === "undefined" || !window.ethereum) {
        if (!cancelled) {
          setState((prev) => (prev.instance ? prev : { loading: false, instance: undefined }));
        }
        return;
      }

      if (!cancelled) {
        setState((prev) => (prev.instance ? prev : { ...prev, loading: true, error: undefined }));
      }

      try {
        const instance = await getFhevmInstance();
        if (!cancelled) {
          setState({ instance, loading: false, error: undefined });
          stopRetry();
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) =>
            prev.instance
              ? prev
              : {
                  loading: false,
                  instance: undefined,
                  error: err instanceof Error ? err.message : "FHEVM init failed",
                }
          );
        }
      }
    };

    void load();
    window.addEventListener("ethereum#initialized", load);
    retryId = window.setInterval(load, 2000);

    return () => {
      cancelled = true;
      window.removeEventListener("ethereum#initialized", load);
      stopRetry();
    };
  }, []);

  return <FhevmContext.Provider value={state}>{children}</FhevmContext.Provider>;
}

export function useFhevmContext(): FhevmContextValue {
  return useContext(FhevmContext);
}
