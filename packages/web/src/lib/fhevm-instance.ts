import { CONTRACT_ADDRESS } from "@/lib/contract";

export type FhevmInstance = Awaited<
  ReturnType<typeof import("@zama-fhe/relayer-sdk/web").createInstance>
>;

let cached: FhevmInstance | null = null;
let inflight: Promise<FhevmInstance> | null = null;

const WARMUP_USER = "0x0000000000000000000000000000000000000001" as const;

/** Start downloading the relayer SDK chunk early (no WASM init yet). */
export function preloadFhevmSdkChunk(): void {
  if (typeof window === "undefined") return;
  void import("@zama-fhe/relayer-sdk/web");
}

async function warmUpEncrypt(instance: FhevmInstance): Promise<void> {
  try {
    const input = instance.createEncryptedInput(CONTRACT_ADDRESS, WARMUP_USER);
    input.add64(1n);
    await input.encrypt();
  } catch {
    /* best-effort: primes WASM crypto before the user's first submit */
  }
}

/**
 * Lazily create a singleton FHEVM instance. Safe to call from multiple components;
 * initSDK + createInstance run at most once per page load.
 */
export async function getFhevmInstance(): Promise<FhevmInstance> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Wallet extension not detected");
    }

    const { createInstance, initSDK, SepoliaConfig } = await import(
      "@zama-fhe/relayer-sdk/web"
    );
    await initSDK({ thread: 0 });
    const instance = await createInstance({
      ...SepoliaConfig,
      network: window.ethereum,
    });
    await warmUpEncrypt(instance);
    cached = instance;
    return instance;
  })();

  try {
    return await inflight;
  } catch (err) {
    inflight = null;
    throw err;
  }
}
