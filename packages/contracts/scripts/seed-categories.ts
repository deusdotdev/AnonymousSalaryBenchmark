/**
 * @file seed-categories.ts
 * @description Seed Sepolia with 10 categories x 10 encrypted salaries using derived wallets.
 */

import { ethers, network } from "hardhat";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInstance, SepoliaConfig, type FhevmInstance } from "@zama-fhe/relayer-sdk/node";
import { SalaryFHE } from "../typechain-types";
import {
  SEED_CATEGORIES,
  WALLETS_PER_CATEGORY,
  expectedAverage,
  type SeedCategory,
} from "./seed-data";

const DEPLOYMENT_PATH = resolve(__dirname, "..", "deployments", "sepolia.json");
const MANIFEST_PATH = resolve(__dirname, "..", "..", "web", "src", "data", "seed-manifest.json");
const LOCK_PATH = resolve(__dirname, "..", ".seed.lock");
const FUND_ETH = ethers.parseEther("0.018");
const DEPLOYER_RESERVE = ethers.parseEther("0.05");
const PUBLISH_TIERS = process.env.SEED_PUBLISH_TIERS !== "false";
const TIERS_ONLY = process.env.SEED_TIERS_ONLY === "true";
const SKIP_FUND = process.env.SEED_SKIP_FUND === "true" || TIERS_ONLY;
const CONCURRENCY = Math.max(1, Number(process.env.SEED_CONCURRENCY || "2"));
const FUND_BATCH = 1;
const RPC_DELAY_MS = Math.max(0, Number(process.env.SEED_RPC_DELAY_MS || "250"));
const RPC_URL = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const TX_GAS_LIMIT = 1_200_000n;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransactionReplaced(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "TRANSACTION_REPLACED"
  );
}

async function waitMined(tx: ethers.TransactionResponse): Promise<void> {
  try {
    await tx.wait();
  } catch (error) {
    if (isTransactionReplaced(error)) {
      const receipt = (error as { receipt?: { status?: number } }).receipt;
      if (receipt?.status === 1) {
        return;
      }
    }
    throw error;
  }
}

function isRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: number }).code
      : undefined;
  return code === -32005 || /too many requests|rate limit/i.test(msg);
}

function isAlreadySubmittedError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /AlreadySubmitted|already submitted/i.test(msg);
}

function isRelayerTransientError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    isRateLimitError(error) ||
    /RelayerV2FetchError|fetch failed|Connect Timeout|UND_ERR|ECONNRESET/i.test(msg)
  );
}

function isNonceOrGasError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /replacement transaction underpriced|nonce too low|already known/i.test(msg);
}

function acquireSeedLock(): void {
  if (existsSync(LOCK_PATH)) {
    const existing = readFileSync(LOCK_PATH, "utf8").trim();
    throw new Error(
      `Another seed may be running (lock: ${existing}). Stop it first — never run two seeds in parallel.`
    );
  }
  writeFileSync(LOCK_PATH, `${process.pid} @ ${new Date().toISOString()}\n`, "utf8");
}

function releaseSeedLock(): void {
  if (existsSync(LOCK_PATH)) {
    unlinkSync(LOCK_PATH);
  }
}

/** Retry RPC / relayer calls with backoff. */
async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 8,
  retryIf: (error: unknown) => boolean = isRelayerTransientError
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (isAlreadySubmittedError(error)) {
        throw error;
      }
      if (!retryIf(error) || i === attempts - 1) {
        throw error;
      }
      const waitMs = RPC_DELAY_MS * 2 ** i;
      console.warn(`  retry ${label} in ${waitMs}ms (${i + 1}/${attempts})`);
      await sleep(waitMs);
    }
  }
  throw lastError;
}

interface SeedJob {
  walletIndex: number;
  categoryIndex: number;
  cat: SeedCategory;
  salaryUsd: number;
}

function toHexHandle(value: string | Uint8Array): `0x${string}` {
  if (typeof value === "string") {
    return value as `0x${string}`;
  }
  return `0x${Buffer.from(value).toString("hex")}` as `0x${string}`;
}

function loadContractAddress(): string {
  if (process.env.SALARY_FHE_ADDRESS) {
    return process.env.SALARY_FHE_ADDRESS;
  }
  if (!existsSync(DEPLOYMENT_PATH)) {
    throw new Error(`Missing ${DEPLOYMENT_PATH}. Deploy first or set SALARY_FHE_ADDRESS.`);
  }
  const deployment = JSON.parse(readFileSync(DEPLOYMENT_PATH, "utf8")) as { address: string };
  return deployment.address;
}

/** Deterministic child wallet from deployer private key + index (0..99). */
function deriveSeedWallet(deployerPrivateKey: string, index: number, provider: ethers.Provider) {
  const material = ethers.keccak256(
    ethers.solidityPacked(["bytes32", "uint32"], [deployerPrivateKey, index])
  );
  return new ethers.Wallet(material, provider);
}

function computeCategoryId(cat: SeedCategory): bigint {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint16", "uint16", "uint16"],
    [cat.positionId, cat.cityId, cat.seniorityId]
  );
  return BigInt(ethers.keccak256(encoded));
}

function buildJobs(): SeedJob[] {
  const jobs: SeedJob[] = [];
  for (let c = 0; c < SEED_CATEGORIES.length; c++) {
    const cat = SEED_CATEGORIES[c];
    for (let w = 0; w < WALLETS_PER_CATEGORY; w++) {
      jobs.push({
        walletIndex: c * WALLETS_PER_CATEGORY + w,
        categoryIndex: c,
        cat,
        salaryUsd: cat.salariesUsd[w],
      });
    }
  }
  return jobs;
}

/** Run async tasks with a fixed concurrency limit. */
async function mapPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      await fn(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
}

/** Fund child wallets in small batches to avoid RPC rate limits. */
async function fundAllWallets(
  deployer: ethers.Wallet,
  jobs: SeedJob[],
  deployerPrivateKey: string,
  provider: ethers.Provider
) {
  const uniqueIndices = [...new Set(jobs.map((j) => j.walletIndex))];
  const topUps: Array<{ address: string; amount: bigint }> = [];

  for (let i = 0; i < uniqueIndices.length; i++) {
    const walletIndex = uniqueIndices[i];
    const wallet = deriveSeedWallet(deployerPrivateKey, walletIndex, provider);
    const balance = await withRetry(`balance #${walletIndex}`, () =>
      provider.getBalance(wallet.address)
    );
    if (balance < FUND_ETH) {
      topUps.push({ address: wallet.address, amount: FUND_ETH - balance });
    }
    if ((i + 1) % 20 === 0) {
      console.log(`  scanned ${i + 1}/${uniqueIndices.length} wallets (${topUps.length} need funding)`);
    }
    if (RPC_DELAY_MS > 0) {
      await sleep(RPC_DELAY_MS);
    }
  }

  if (topUps.length === 0) {
    console.log("All wallets already funded.");
    return;
  }

  for (let i = 0; i < topUps.length; i++) {
    const { address, amount } = topUps[i];
    await withRetry(`fund ${address.slice(0, 10)}`, async () => {
      const tx = await deployer.sendTransaction({ to: address, value: amount });
      await waitMined(tx);
    });
    if ((i + 1) % 10 === 0 || i === topUps.length - 1) {
      console.log(`  funded ${i + 1}/${topUps.length}`);
    }
    if (RPC_DELAY_MS > 0) {
      await sleep(RPC_DELAY_MS);
    }
  }

  console.log(`Funded ${topUps.length} wallets (${ethers.formatEther(FUND_ETH)} ETH target each).`);
}

async function submitEncrypted(
  contract: SalaryFHE,
  wallet: ethers.Wallet,
  cat: SeedCategory,
  salaryUsd: number,
  fhe: FhevmInstance,
  contractAddress: string,
  seenAddresses: Set<string>
): Promise<"ok" | "skip"> {
  const addressKey = wallet.address.toLowerCase();

  if (seenAddresses.has(addressKey)) {
    return "skip";
  }
  seenAddresses.add(addressKey);

  const already = await withRetry(`hasSubmitted ${wallet.address.slice(0, 10)}`, () =>
    contract.hasSubmitted(wallet.address)
  );
  if (already) {
    return "skip";
  }

  const encrypted = await withRetry(`encrypt ${wallet.address.slice(0, 10)}`, async () => {
    const input = fhe.createEncryptedInput(contractAddress, wallet.address);
    input.add64(BigInt(salaryUsd));
    return input.encrypt();
  });

  if (await contract.hasSubmitted(wallet.address)) {
    return "skip";
  }

  try {
    await withRetry(`submitSalary ${wallet.address.slice(0, 10)}`, async () => {
      const tx = await contract
        .connect(wallet)
        .submitSalary(
          cat.positionId,
          cat.cityId,
          cat.seniorityId,
          toHexHandle(encrypted.handles[0]),
          toHexHandle(encrypted.inputProof)
        );
      await waitMined(tx);
    });
  } catch (error) {
    if (isAlreadySubmittedError(error) || (await contract.hasSubmitted(wallet.address))) {
      return "skip";
    }
    throw error;
  }

  return "ok";
}

async function publishTier(
  contract: SalaryFHE,
  categoryId: bigint,
  tier: bigint,
  signer: ethers.Signer,
  fhe: FhevmInstance
) {
  const finalized = await contract.isTierFinalized(categoryId, tier);
  if (finalized) {
    return Number(await contract.getClearAverage(categoryId, tier));
  }

  const snapshotReady = await contract.isTierSnapshotReady(categoryId, tier);
  if (!snapshotReady) {
    return null;
  }

  try {
    await withRetry(
      `requestAverageRelease tier ${tier}`,
      async () => {
        const reqTx = await contract.connect(signer).requestAverageRelease(categoryId, tier, {
          gasLimit: TX_GAS_LIMIT,
        });
        await waitMined(reqTx);
      },
      8,
      (error) => isRelayerTransientError(error) || isNonceOrGasError(error)
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes("TierAlreadyRequested")) {
      throw error;
    }
  }

  const handle = await contract.getTierAverageHandle(categoryId, tier);
  const results = await withRetry(`publicDecrypt tier ${tier}`, () => fhe.publicDecrypt([handle]));
  const clearAverage = results.clearValues[handle as `0x${string}`] as bigint;

  await withRetry(
    `finalizeAverage tier ${tier}`,
    async () => {
      const finTx = await contract
        .connect(signer)
        .finalizeAverage(categoryId, tier, Number(clearAverage), results.decryptionProof, {
          gasLimit: TX_GAS_LIMIT,
        });
      await waitMined(finTx);
    },
    8,
    (error) => isRelayerTransientError(error) || isNonceOrGasError(error)
  );

  return Number(clearAverage);
}

async function main() {
  acquireSeedLock();
  try {
  if (network.name !== "sepolia") {
    console.warn(`Warning: seeding on network "${network.name}" (expected sepolia).`);
  }

  const [deployerSigner] = await ethers.getSigners();
  const deployerPrivateKey = process.env.PRIVATE_KEY;
  if (!deployerPrivateKey) {
    throw new Error("Set PRIVATE_KEY in root .env");
  }

  const provider = ethers.provider;
  const deployer = new ethers.Wallet(deployerPrivateKey, provider);
  if (deployer.address.toLowerCase() !== deployerSigner.address.toLowerCase()) {
    throw new Error("PRIVATE_KEY does not match Hardhat deployer signer.");
  }

  const jobs = buildJobs();
  const balance = await provider.getBalance(deployer.address);
  const required = TIERS_ONLY
    ? ethers.parseEther("0.15")
    : FUND_ETH * BigInt(jobs.length) + DEPLOYER_RESERVE;
  console.log(`Network:     ${network.name}`);
  console.log(`Deployer:    ${deployer.address}`);
  console.log(`Balance:     ${ethers.formatEther(balance)} ETH`);
  console.log(`Required:    ~${ethers.formatEther(required)} ETH`);
  console.log(`Mode:        ${TIERS_ONLY ? "tiers-only (skip fund + submit)" : SKIP_FUND ? "skip fund" : "full seed"}`);
  console.log(`Concurrency: ${CONCURRENCY} submit, ${FUND_BATCH} fund batch (SEED_* env)\n`);

  if (balance < required) {
    throw new Error(
      `Insufficient Sepolia ETH. Fund ${deployer.address} from a faucet, then re-run (already-submitted wallets are skipped).`
    );
  }

  const contractAddress = loadContractAddress();
  const contract = (await ethers.getContractAt("SalaryFHE", contractAddress)) as SalaryFHE;
  console.log(`Contract: ${contractAddress}`);
  console.log(`Jobs:     ${jobs.length} submissions across ${SEED_CATEGORIES.length} categories\n`);

  console.log("Initializing relayer SDK…");
  const fhe = await createInstance({
    ...SepoliaConfig,
    network: RPC_URL,
  });
  console.log("Relayer ready.\n");

  if (!SKIP_FUND) {
    console.log("Phase 1: funding child wallets…");
    await fundAllWallets(deployer, jobs, deployerPrivateKey, provider);
  } else {
    console.log("Phase 1: skipped (SEED_TIERS_ONLY or SEED_SKIP_FUND).\n");
  }

  let submitted = 0;
  let skipped = 0;
  if (!TIERS_ONLY) {
  const seenAddresses = new Set<string>();
  console.log(`Phase 2: parallel submit (${CONCURRENCY} at a time, one tx per wallet max)…`);

  await mapPool(jobs, CONCURRENCY, async (job) => {
    const wallet = deriveSeedWallet(deployerPrivateKey, job.walletIndex, provider);
    const result = await submitEncrypted(
      contract,
      wallet,
      job.cat,
      job.salaryUsd,
      fhe,
      contractAddress,
      seenAddresses
    );
    if (result === "skip") {
      skipped++;
      console.log(`  skip #${job.walletIndex} ${wallet.address.slice(0, 10)}…`);
    } else {
      submitted++;
      console.log(
        `  ok #${job.walletIndex} [${job.categoryIndex + 1}] ${wallet.address.slice(0, 10)}… $${job.salaryUsd.toLocaleString()}`
      );
    }
  });

  console.log(`\nPhase 2 done: ${submitted} submitted, ${skipped} skipped.\n`);
  } else {
    console.log("Phase 2: skipped (SEED_TIERS_ONLY).\n");
  }
  console.log("Phase 3: tier publish per category…");

  const manifest: {
    seededAt: string;
    network: string;
    contractAddress: string;
    categories: Array<{
      label: string;
      positionId: number;
      cityId: number;
      seniorityId: number;
      categoryId: string;
      salariesUsd: number[];
      expectedAverageUsd: number;
      participantCount: number;
      tier5AverageUsd: number | null;
      tier10AverageUsd: number | null;
    }>;
  } = {
    seededAt: new Date().toISOString(),
    network: network.name,
    contractAddress,
    categories: [],
  };

  const categoryResults: Array<{
    categoryIndex: number;
    entry: (typeof manifest.categories)[number];
  }> = [];

  for (let categoryIndex = 0; categoryIndex < SEED_CATEGORIES.length; categoryIndex++) {
    const cat = SEED_CATEGORIES[categoryIndex];
    const categoryId = computeCategoryId(cat);
    const count = Number(await contract.getBucketCount(categoryId));
    let tier5: number | null = null;
    let tier10: number | null = null;

    if (PUBLISH_TIERS && count >= 5) {
      try {
        tier5 = await publishTier(contract, categoryId, 5n, deployer, fhe);
      } catch (error) {
        console.warn(`  tier5 failed [${categoryIndex + 1}]:`, error instanceof Error ? error.message : error);
      }
    }
    if (PUBLISH_TIERS && count >= 10) {
      try {
        tier10 = await publishTier(contract, categoryId, 10n, deployer, fhe);
      } catch (error) {
        console.warn(`  tier10 failed [${categoryIndex + 1}]:`, error instanceof Error ? error.message : error);
      }
    }

    categoryResults.push({
      categoryIndex,
      entry: {
        label: cat.label,
        positionId: cat.positionId,
        cityId: cat.cityId,
        seniorityId: cat.seniorityId,
        categoryId: categoryId.toString(),
        salariesUsd: cat.salariesUsd,
        expectedAverageUsd: expectedAverage(cat.salariesUsd),
        participantCount: count,
        tier5AverageUsd: tier5,
        tier10AverageUsd: tier10,
      },
    });

    console.log(
      `  [${categoryIndex + 1}] ${cat.label} — count ${count}` +
        (tier5 != null ? `, tier5 $${tier5.toLocaleString()}` : "") +
        (tier10 != null ? `, tier10 $${tier10.toLocaleString()}` : "")
    );
  }

  manifest.categories = categoryResults
    .sort((a, b) => a.categoryIndex - b.categoryIndex)
    .map((r) => r.entry);

  mkdirSync(resolve(MANIFEST_PATH, ".."), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\nWrote ${MANIFEST_PATH}`);
  console.log("Done.");
  } finally {
    releaseSeedLock();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
