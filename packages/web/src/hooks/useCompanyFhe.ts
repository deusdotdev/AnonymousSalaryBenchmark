"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { useFhevmInstance } from "@/hooks/useFhevmInstance";
import { computeCategoryId } from "@/lib/categories";
import { CONTRACT_ADDRESS, salaryFheAbi } from "@/lib/contract";
import { toHexHandle } from "@/lib/fhevm";
import type { Phase, SalaryStatus } from "@/hooks/useSalaryFhe";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Encapsulates the company benchmarking flow: submit employee salaries, aggregate a private
 * company bucket, and privately learn whether the company pays above the market average.
 */
export function useCompanyFhe(position: number, city: number, experience: number) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();
  const { instance, error: fheError } = useFhevmInstance();

  const [status, setStatus] = useState<SalaryStatus>({ phase: "idle" as Phase });
  const [benchmark, setBenchmark] = useState<boolean | undefined>();

  const categoryId = useMemo(
    () => BigInt(computeCategoryId(position, city, experience)),
    [position, city, experience]
  );

  const contractConfigured = CONTRACT_ADDRESS !== ZERO_ADDRESS;
  const sdkReady = !!instance;

  const { data: employeeCount, refetch: refetchCompany } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: salaryFheAbi,
    functionName: "getCompanyBucketCount",
    args: address ? [address, categoryId] : undefined,
    query: { enabled: contractConfigured && !!address },
  });

  const { data: marketReady } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: salaryFheAbi,
    functionName: "isAverageComputed",
    args: [categoryId],
    query: { enabled: contractConfigured },
  });

  const { data: marketParticipants } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: salaryFheAbi,
    functionName: "getBucketCount",
    args: [categoryId],
    query: { enabled: contractConfigured },
  });

  const fail = useCallback((err: unknown, fallback: string) => {
    setStatus({
      phase: "error",
      message: err instanceof Error ? err.message : fallback,
    });
  }, []);

  const submitEmployee = useCallback(
    async (salaryUsd: string) => {
      if (!instance || !address || !publicClient) {
        setStatus({ phase: "error", message: "Connect your company wallet first." });
        return;
      }

      try {
        setStatus({ phase: "working", message: "Encrypting employee salary locally..." });
        const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
        input.add64(BigInt(salaryUsd));
        const encrypted = await input.encrypt();

        setStatus({ phase: "working", message: "Submitting encrypted salary on-chain..." });
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: salaryFheAbi,
          functionName: "submitCompanySalary",
          args: [
            position,
            city,
            experience,
            toHexHandle(encrypted.handles[0]),
            toHexHandle(encrypted.inputProof),
          ],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        await refetchCompany();
        setBenchmark(undefined);
        setStatus({
          phase: "done",
          message: "Employee salary added to your encrypted company bucket.",
        });
      } catch (err) {
        fail(err, "Submission failed");
      }
    },
    [instance, address, publicClient, writeContractAsync, position, city, experience, refetchCompany, fail]
  );

  const runBenchmark = useCallback(async () => {
    if (!instance || !address || !publicClient || !walletClient) return;

    try {
      setBenchmark(undefined);
      setStatus({ phase: "working", message: "Computing your encrypted benchmark..." });
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: salaryFheAbi,
        functionName: "computeCompanyComparison",
        args: [position, city, experience],
      });
      await publicClient.waitForTransactionReceipt({ hash });

      const handle = toHexHandle(
        (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: salaryFheAbi,
          functionName: "getCompanyAboveMarketHandle",
          args: [address, categoryId],
        })) as string | Uint8Array
      );

      setStatus({ phase: "working", message: "Sign to decrypt your private benchmark..." });
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

      setBenchmark(userResults[handle] as boolean);
      setStatus({ phase: "done" });
    } catch (err) {
      fail(err, "Benchmark failed");
    }
  }, [instance, address, publicClient, walletClient, writeContractAsync, position, city, experience, categoryId, fail]);

  return {
    address,
    isConnected,
    contractConfigured,
    sdkReady,
    fheError,
    status,
    benchmark,
    employeeCount: employeeCount ? Number(employeeCount) : 0,
    marketReady: !!marketReady,
    marketParticipants: marketParticipants ? Number(marketParticipants) : 0,
    submitEmployee,
    runBenchmark,
  };
}
