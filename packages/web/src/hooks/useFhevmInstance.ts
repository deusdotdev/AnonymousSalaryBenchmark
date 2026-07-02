"use client";

import { useEffect, useState } from "react";

export type FhevmInstance = Awaited<
  ReturnType<typeof import("@zama-fhe/relayer-sdk/web").createInstance>
>;

export function useFhevmInstance() {
  const [instance, setInstance] = useState<FhevmInstance>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (typeof window === "undefined" || !window.ethereum) {
          return;
        }

        /*
         * Load only in the browser. Next.js webpack bundles workerHelpers.js for WASM
         * thread pools; in that worker chunk __webpack_require__.U is missing and
         * initSDK() throws "__webpack_require__.U is not a constructor". thread: 0
         * skips the worker pool (single-threaded WASM still works for encrypt/decrypt).
         */
        const { createInstance, initSDK, SepoliaConfig } = await import(
          "@zama-fhe/relayer-sdk/web"
        );
        await initSDK({ thread: 0 });

        const created = await createInstance({
          ...SepoliaConfig,
          network: window.ethereum,
        });
        if (!cancelled) {
          setInstance(created);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "FHEVM init failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { instance, error };
}
