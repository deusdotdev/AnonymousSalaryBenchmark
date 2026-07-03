/**
 * @file seed-one-tier.ts
 * @description Publish a single tier average (SEED_CATEGORY_INDEX, SEED_TIER).
 */

import { ethers, network } from "hardhat";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import { SalaryFHE } from "../typechain-types";
import { SEED_CATEGORIES } from "./seed-data";

const DEPLOYMENT_PATH = resolve(__dirname, "..", "deployments", "sepolia.json");
const RPC_URL = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const TX_GAS_LIMIT = 1_200_000n;
const CATEGORY_INDEX = Number(process.env.SEED_CATEGORY_INDEX ?? "2");
const TIER = BigInt(process.env.SEED_TIER ?? "10");

function loadContractAddress(): string {
  if (process.env.SALARY_FHE_ADDRESS) {
    return process.env.SALARY_FHE_ADDRESS;
  }
  const deployment = JSON.parse(readFileSync(DEPLOYMENT_PATH, "utf8")) as { address: string };
  return deployment.address;
}

function computeCategoryId(cat: (typeof SEED_CATEGORIES)[number]): bigint {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint16", "uint16", "uint16"],
    [cat.positionId, cat.cityId, cat.seniorityId]
  );
  return BigInt(ethers.keccak256(encoded));
}

async function waitMined(tx: ethers.TransactionResponse) {
  await tx.wait();
}

async function main() {
  const cat = SEED_CATEGORIES[CATEGORY_INDEX];
  if (!cat) throw new Error(`Invalid SEED_CATEGORY_INDEX ${CATEGORY_INDEX}`);

  const [deployer] = await ethers.getSigners();
  const contractAddress = loadContractAddress();
  const contract = (await ethers.getContractAt("SalaryFHE", contractAddress)) as SalaryFHE;
  const categoryId = computeCategoryId(cat);

  console.log(`Network:  ${network.name}`);
  console.log(`Category: ${cat.label}`);
  console.log(`Tier:     ${TIER}`);

  if (await contract.isTierFinalized(categoryId, TIER)) {
    console.log(`Already finalized: $${(await contract.getClearAverage(categoryId, TIER)).toLocaleString()}`);
    return;
  }

  const fhe = await createInstance({ ...SepoliaConfig, network: RPC_URL });

  try {
    const reqTx = await contract.requestAverageRelease(categoryId, TIER, { gasLimit: TX_GAS_LIMIT });
    await waitMined(reqTx);
    console.log("requestAverageRelease ok");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes("TierAlreadyRequested")) throw error;
    console.log("requestAverageRelease already requested, continuing…");
  }

  const handle = await contract.getTierAverageHandle(categoryId, TIER);
  console.log(`handle: ${handle}`);
  const results = await fhe.publicDecrypt([handle]);
  const clearAverage = results.clearValues[handle as `0x${string}`] as bigint;
  console.log(`clear avg: $${Number(clearAverage).toLocaleString()}`);

  const finTx = await contract.finalizeAverage(
    categoryId,
    TIER,
    Number(clearAverage),
    results.decryptionProof,
    { gasLimit: TX_GAS_LIMIT }
  );
  await waitMined(finTx);
  console.log(`Done. tier ${TIER} avg $${Number(clearAverage).toLocaleString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
