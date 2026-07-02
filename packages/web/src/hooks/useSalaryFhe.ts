"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { useFhevmInstance } from "@/hooks/useFhevmInstance";
import {
  MIN_PARTICIPANTS,
  computeCategoryId,
  nextPublishTier,
  nextTierTarget,
} from "@/lib/categories";
import { CONTRACT_ADDRESS, salaryFheAbi } from "@/lib/contract";
import { toHexHandle } from "@/lib/fhevm";

export type Phase = "idle" | "working" | "done" | "error";

export interface SalaryStatus {
  phase: Phase;
  message?: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Encapsulates all SalaryFHE contract interaction and decryption flows.
 */
export function useSalaryFhe(position: number, city: number, experience: number) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const { instance, error: fheError } = useFhevmInstance();

  const [status, setStatus] = useState<SalaryStatus>({ phase: "idle" });
  const [comparison, setComparison] = useState<boolean | undefined>();

  const categoryId = useMemo(
    () => BigInt(computeCategoryId(position, city, experience)),
    [position, city, experience]
  );

  const contractConfigured = CONTRACT_ADDRESS !== ZERO_ADDRESS;
  const sdkReady = !!instance;

  const { data: bucketCount, refetch: refetchBucket } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: salaryFheAbi,
    functionName: "getBucketCount",
    args: [categoryId],
    query: { enabled: contractConfigured },
  });

  const participants = bucketCount ? Number(bucketCount) : 0;

  const tiersToCheck = useMemo(() => {
    if (participants < MIN_PARTICIPANTS) return [];
    const maxTier = Math.floor(participants / MIN_PARTICIPANTS) * MIN_PARTICIPANTS;
    const tiers: number[] = [];
    for (let tier = MIN_PARTICIPANTS; tier <= maxTier; tier += MIN_PARTICIPANTS) {
      tiers.push(tier);
    }
    return tiers;
  }, [participants]);

  const { data: tierFinalizedResults, refetch: refetchTiers } = useReadContracts({
    contracts: tiersToCheck.map((tier) => ({
      address: CONTRACT_ADDRESS,
      abi: salaryFheAbi,
      functionName: "isTierFinalized" as const,
      args: [categoryId, BigInt(tier)] as const,
    })),
    query: { enabled: contractConfigured && tiersToCheck.length > 0 },
  });

  const isTierFinalized = useCallback(
    (tier: number) => {
      const idx = tiersToCheck.indexOf(tier);
      if (idx === -1) return false;
      return !!tierFinalizedResults?.[idx]?.result;
    },
    [tiersToCheck, tierFinalizedResults]
  );

  const pendingPublishTier = useMemo(
    () => nextPublishTier(participants, isTierFinalized),
    [participants, isTierFinalized]
  );

  const tierTarget = useMemo(() => nextTierTarget(participants), [participants]);

  const { data: latestFinalizedTier, refetch: refetchLatestTier } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: salaryFheAbi,
    functionName: "getLatestFinalizedTier",
    args: [categoryId],
    query: { enabled: contractConfigured },
  });

  const latestTier = latestFinalizedTier ? Number(latestFinalizedTier) : 0;

  const { data: clearAverage, refetch: refetchClearAverage } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: salaryFheAbi,
    functionName: "getClearAverage",
    args: latestTier > 0 ? [categoryId, BigInt(latestTier)] : undefined,
    query: { enabled: contractConfigured && latestTier > 0 },
  });

  const { data: hasSubmitted, refetch: refetchSubmitted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: salaryFheAbi,
    functionName: "hasSubmitted",
    args: address ? [address] : undefined,
    query: { enabled: contractConfigured && !!address },
  });

  const fail = useCallback((err: unknown, fallback: string) => {
    setStatus({
      phase: "error",
      message: err instanceof Error ? err.message : fallback,
    });
  }, []);

  const submitSalary = useCallback(
    async (salaryUsd: string) => {
      if (!instance || !address || !publicClient) {
        setStatus({ phase: "error", message: "Connect your wallet first." });
        return;
      }

      try {
        setStatus({ phase: "working", message: "Encrypting your salary locally..." });
        const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
        input.add64(BigInt(salaryUsd));
        const encrypted = await input.encrypt();

        setStatus({ phase: "working", message: "Submitting encrypted salary on-chain..." });
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: salaryFheAbi,
          functionName: "submitSalary",
          args: [
            position,
            city,
            experience,
            toHexHandle(encrypted.handles[0]),
            toHexHandle(encrypted.inputProof),
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        await Promise.all([refetchBucket(), refetchSubmitted(), refetchTiers(), refetchLatestTier()]);
        setStatus({
          phase: "done",
          message: "Done. Your salary is encrypted and never stored in clear.",
        });
      } catch (err) {
        fail(err, "Submission failed");
      }
    },
    [
      instance,
      address,
      publicClient,
      writeContractAsync,
      position,
      city,
      experience,
      refetchBucket,
      refetchSubmitted,
      refetchTiers,
      refetchLatestTier,
      fail,
    ]
  );

  const runComparison = useCallback(async () => {
    if (!instance || !address || !publicClient || !walletClient) return;

    try {
      setComparison(undefined);
      setStatus({ phase: "working", message: "Computing your encrypted comparison..." });
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: salaryFheAbi,
        functionName: "compareToAverage",
      });
      await publicClient.waitForTransactionReceipt({ hash });

      const handle = toHexHandle(
        (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: salaryFheAbi,
          functionName: "getAboveAverageHandle",
          args: [address],
        })) as string | Uint8Array
      );

      setStatus({ phase: "working", message: "Sign to decrypt your private result..." });
      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 1;
      const eip712 = instance.createEIP712(
        keypair.publicKey,
        [CONTRACT_ADDRESS],
        startTimestamp,
        durationDays
      );
      const { EIP712Domain: _omit, ...typesWithoutDomain } = eip712.types;
      const signature = await walletClient.signTypedData({
        account: address,
        domain: eip712.domain as Parameters<typeof walletClient.signTypedData>[0]["domain"],
        types: typesWithoutDomain as Parameters<typeof walletClient.signTypedData>[0]["types"],
        primaryType: eip712.primaryType as Parameters<
          typeof walletClient.signTypedData
        >[0]["primaryType"],
        message: eip712.message as Parameters<typeof walletClient.signTypedData>[0]["message"],
      });

      const userResults = await instance.userDecrypt(
        [{ handle, contractAddress: CONTRACT_ADDRESS }],
        keypair.privateKey,
        keypair.publicKey,
        signature,
        [CONTRACT_ADDRESS],
        address,
        startTimestamp,
        durationDays
      );

      setComparison(userResults[handle] as boolean);
      setStatus({ phase: "done" });
    } catch (err) {
      fail(err, "Comparison failed");
    }
  }, [instance, address, publicClient, walletClient, writeContractAsync, fail]);

  const releaseAverage = useCallback(async () => {
    if (!instance || !publicClient || pendingPublishTier === null) return;

    const tier = BigInt(pendingPublishTier);

    try {
      setStatus({
        phase: "working",
        message: `Requesting public average release (${pendingPublishTier} participants)...`,
      });
      let hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: salaryFheAbi,
        functionName: "requestAverageRelease",
        args: [categoryId, tier],
      });
      await publicClient.waitForTransactionReceipt({ hash });

      const averageHandle = toHexHandle(
        (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: salaryFheAbi,
          functionName: "getTierAverageHandle",
          args: [categoryId, tier],
        })) as string | Uint8Array
      );

      setStatus({ phase: "working", message: "Decrypting tier average off-chain..." });
      const results = await instance.publicDecrypt([averageHandle]);
      const clear = results.clearValues[averageHandle] as bigint;

      setStatus({ phase: "working", message: "Finalizing tier average on-chain..." });
      hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: salaryFheAbi,
        functionName: "finalizeAverage",
        args: [categoryId, tier, clear, results.decryptionProof],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await Promise.all([refetchTiers(), refetchLatestTier(), refetchClearAverage()]);
      setStatus({
        phase: "done",
        message: `Tier ${pendingPublishTier} average published: $${clear.toLocaleString()} / year`,
      });
    } catch (err) {
      fail(err, "Average release failed");
    }
  }, [
    instance,
    publicClient,
    writeContractAsync,
    categoryId,
    pendingPublishTier,
    refetchTiers,
    refetchLatestTier,
    refetchClearAverage,
    fail,
  ]);

  return {
    address,
    isConnected,
    contractConfigured,
    sdkReady,
    fheError,
    status,
    comparison,
    participants,
    tierTarget,
    pendingPublishTier,
    latestFinalizedTier: latestTier,
    clearAverage: clearAverage !== undefined ? Number(clearAverage) : undefined,
    hasSubmitted: !!hasSubmitted,
    submitSalary,
    runComparison,
    releaseAverage,
  };
}
