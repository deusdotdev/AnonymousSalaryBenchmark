/**
 * @file deploy.ts
 * @description Deploy SalaryFHE to Sepolia and write ABI + address for the frontend.
 */

import { ethers, network, artifacts } from "hardhat";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const CONTRACT_NAME = "SalaryFHE";
const OUT_ROOT = resolve(__dirname, "..", "deployments");
const WEB_ABI_DIR = resolve(__dirname, "..", "..", "web", "src", "abi");
const WEB_ENV_LOCAL = resolve(__dirname, "..", "..", "web", ".env.local");
const ENV_KEY = "NEXT_PUBLIC_SALARY_FHE_ADDRESS";

function syncWebEnvLocal(address: string) {
  const line = `${ENV_KEY}=${address}`;
  if (!existsSync(WEB_ENV_LOCAL)) {
    writeFileSync(WEB_ENV_LOCAL, `${line}\n`, "utf8");
    return;
  }
  const contents = readFileSync(WEB_ENV_LOCAL, "utf8");
  const pattern = new RegExp(`^${ENV_KEY}=.*$`, "m");
  const updated = pattern.test(contents)
    ? contents.replace(pattern, line)
    : `${contents.trimEnd()}\n${line}\n`;
  writeFileSync(WEB_ENV_LOCAL, updated, "utf8");
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying ${CONTRACT_NAME} with ${deployer.address} on ${network.name}`);

  const Factory = await ethers.getContractFactory(CONTRACT_NAME);
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  const deployBlock = deployTx?.blockNumber ?? null;

  const artifact = await artifacts.readArtifact(CONTRACT_NAME);
  const deployment = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    address,
    deployedAt: new Date().toISOString(),
    ...(deployBlock != null ? { deployBlock } : {}),
  };

  mkdirSync(OUT_ROOT, { recursive: true });
  mkdirSync(WEB_ABI_DIR, { recursive: true });

  writeFileSync(join(OUT_ROOT, `${network.name}.json`), JSON.stringify(deployment, null, 2));
  writeFileSync(join(WEB_ABI_DIR, `${CONTRACT_NAME}.json`), JSON.stringify(artifact.abi, null, 2));
  writeFileSync(join(WEB_ABI_DIR, "deployment.json"), JSON.stringify(deployment, null, 2));
  syncWebEnvLocal(address);

  console.log(`${CONTRACT_NAME} deployed to ${address}`);
  console.log(`Updated ${WEB_ENV_LOCAL}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
