/**
 * @file check.ts
 * @description Reports the deployer address, network, and balance before deploying. Never prints the private key.
 */

import { ethers, network } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    console.log("No signer found. Set PRIVATE_KEY in the root .env file.");
    return;
  }

  const deployer = signers[0];
  const net = await ethers.provider.getNetwork();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Network:  ${network.name} (chainId ${net.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.log("Balance is 0. Fund this address with Sepolia test ETH before deploying.");
  } else {
    console.log("Ready to deploy.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
