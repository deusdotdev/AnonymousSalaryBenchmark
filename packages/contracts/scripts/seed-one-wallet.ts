/**
 * @file seed-one-wallet.ts
 * @description Submit a single derived seed wallet (SEED_WALLET_INDEX, default 83).
 */

import { ethers, network } from "hardhat";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import { SalaryFHE } from "../typechain-types";
import { SEED_CATEGORIES, WALLETS_PER_CATEGORY } from "./seed-data";

const DEPLOYMENT_PATH = resolve(__dirname, "..", "deployments", "sepolia.json");
const FUND_ETH = ethers.parseEther("0.018");
const RPC_URL = process.env.RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const WALLET_INDEX = Number(process.env.SEED_WALLET_INDEX ?? "83");

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
  const deployment = JSON.parse(readFileSync(DEPLOYMENT_PATH, "utf8")) as { address: string };
  return deployment.address;
}

function deriveSeedWallet(deployerPrivateKey: string, index: number, provider: ethers.Provider) {
  const material = ethers.keccak256(
    ethers.solidityPacked(["bytes32", "uint32"], [deployerPrivateKey, index])
  );
  return new ethers.Wallet(material, provider);
}

async function main() {
  const deployerPrivateKey = process.env.PRIVATE_KEY;
  if (!deployerPrivateKey) {
    throw new Error("Set PRIVATE_KEY in root .env");
  }

  const categoryIndex = Math.floor(WALLET_INDEX / WALLETS_PER_CATEGORY);
  const slot = WALLET_INDEX % WALLETS_PER_CATEGORY;
  const cat = SEED_CATEGORIES[categoryIndex];
  if (!cat) {
    throw new Error(`Invalid SEED_WALLET_INDEX ${WALLET_INDEX}`);
  }
  const salaryUsd = cat.salariesUsd[slot];

  const provider = ethers.provider;
  const deployer = new ethers.Wallet(deployerPrivateKey, provider);
  const wallet = deriveSeedWallet(deployerPrivateKey, WALLET_INDEX, provider);
  const contractAddress = loadContractAddress();
  const contract = (await ethers.getContractAt("SalaryFHE", contractAddress)) as SalaryFHE;

  console.log(`Network:  ${network.name}`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Wallet #${WALLET_INDEX}: ${wallet.address}`);
  console.log(`Category: ${cat.label}`);
  console.log(`Salary:   $${salaryUsd.toLocaleString()}`);

  if (await contract.hasSubmitted(wallet.address)) {
    console.log("Already submitted — nothing to do.");
    return;
  }

  const balance = await provider.getBalance(wallet.address);
  if (balance < FUND_ETH) {
    const topUp = FUND_ETH - balance;
    console.log(`Funding ${ethers.formatEther(topUp)} ETH…`);
    const fundTx = await deployer.sendTransaction({ to: wallet.address, value: topUp });
    await fundTx.wait();
  }

  console.log("Initializing relayer SDK…");
  const fhe = await createInstance({ ...SepoliaConfig, network: RPC_URL });

  const input = fhe.createEncryptedInput(contractAddress, wallet.address);
  input.add64(BigInt(salaryUsd));
  const encrypted = await input.encrypt();

  console.log("Submitting…");
  const tx = await contract
    .connect(wallet)
    .submitSalary(
      cat.positionId,
      cat.cityId,
      cat.seniorityId,
      toHexHandle(encrypted.handles[0]),
      toHexHandle(encrypted.inputProof)
    );
  const receipt = await tx.wait();
  console.log(`Done. tx ${receipt?.hash}`);
  console.log(`hasSubmitted: ${await contract.hasSubmitted(wallet.address)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
