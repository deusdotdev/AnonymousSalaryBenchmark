import { ethers } from "hardhat";
import { SEED_CATEGORIES } from "./seed-data";

function computeCategoryId(cat: (typeof SEED_CATEGORIES)[number]): bigint {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint16", "uint16", "uint16"],
    [cat.positionId, cat.cityId, cat.seniorityId]
  );
  return BigInt(ethers.keccak256(encoded));
}

async function main() {
  const addr = process.env.SALARY_FHE_ADDRESS || "0xb452901e6C5231e8c15Feda1294143d48574325B";
  const c = await ethers.getContractAt("SalaryFHE", addr);
  for (let i = 0; i < SEED_CATEGORIES.length; i++) {
    const cat = SEED_CATEGORIES[i];
    const id = computeCategoryId(cat);
    const count = await c.getBucketCount(id);
    const t5 = await c.isTierFinalized(id, 5n);
    const t10 = await c.isTierFinalized(id, 10n);
    const s5 = await c.isTierSnapshotReady(id, 5n);
    const s10 = await c.isTierSnapshotReady(id, 10n);
    console.log(
      `${i + 1}. ${cat.label} count=${count} snap5=${s5} snap10=${s10} tier5=${t5} tier10=${t10}`
    );
  }
}

main().catch(console.error);
