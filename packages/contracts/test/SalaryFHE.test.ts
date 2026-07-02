/**
 * @file SalaryFHE.test.ts
 * @description Hardhat tests for SalaryFHE: submit, k-anonymity, average, comparison, public decrypt.
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SalaryFHE, SalaryFHE__factory } from "../typechain-types";

const POSITION_BACKEND = 1;
const CITY_ISTANBUL = 0;
const EXP_3_5 = 2;

const SALARIES = [80_000n, 90_000n, 100_000n, 110_000n, 120_000n];
const EXPECTED_AVG = 100_000n;

/**
 * Encrypt and submit one salary for the default test category.
 */
async function submitSalary(
  contract: SalaryFHE,
  signer: HardhatEthersSigner,
  salaryUsd: bigint,
  positionId = POSITION_BACKEND,
  cityId = CITY_ISTANBUL,
  experienceBandId = EXP_3_5
) {
  const contractAddress = await contract.getAddress();
  const input = fhevm.createEncryptedInput(contractAddress, signer.address);
  input.add64(salaryUsd);
  const encrypted = await input.encrypt();
  const tx = await contract
    .connect(signer)
    .submitSalary(
      positionId,
      cityId,
      experienceBandId,
      encrypted.handles[0],
      encrypted.inputProof
    );
  await tx.wait();
}

/**
 * Encrypt and submit one employee salary as a company for the default test category.
 */
async function submitCompanySalary(
  contract: SalaryFHE,
  company: HardhatEthersSigner,
  salaryUsd: bigint,
  positionId = POSITION_BACKEND,
  cityId = CITY_ISTANBUL,
  experienceBandId = EXP_3_5
) {
  const contractAddress = await contract.getAddress();
  const input = fhevm.createEncryptedInput(contractAddress, company.address);
  input.add64(salaryUsd);
  const encrypted = await input.encrypt();
  const tx = await contract
    .connect(company)
    .submitCompanySalary(
      positionId,
      cityId,
      experienceBandId,
      encrypted.handles[0],
      encrypted.inputProof
    );
  await tx.wait();
}

/**
 * Resolve category id for the default test tuple.
 */
async function defaultCategoryId(contract: SalaryFHE): Promise<bigint> {
  return contract.computeCategoryId(POSITION_BACKEND, CITY_ISTANBUL, EXP_3_5);
}

/**
 * Off-chain category id, mirroring the frontend viem implementation
 * (uint256(keccak256(abi.encode(uint16, uint16, uint16)))).
 */
function offChainCategoryId(position: number, city: number, seniority: number): bigint {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint16", "uint16", "uint16"],
    [position, city, seniority]
  );
  return BigInt(ethers.keccak256(encoded));
}

describe("SalaryFHE", function () {
  let contract: SalaryFHE;
  let signers: HardhatEthersSigner[];
  let categoryId: bigint;

  beforeEach(async function () {
    signers = await ethers.getSigners();
    const factory = (await ethers.getContractFactory(
      "SalaryFHE"
    )) as unknown as SalaryFHE__factory;
    contract = (await factory.deploy()) as SalaryFHE;
    await contract.waitForDeployment();
    categoryId = await defaultCategoryId(contract);
  });

  /*************** Submission ***************/

  it("rejects duplicate submission from the same address", async function () {
    await submitSalary(contract, signers[0], 85_000n);
    await expect(submitSalary(contract, signers[0], 90_000n)).to.be.revertedWithCustomError(
      contract,
      "AlreadySubmitted"
    );
  });

  it("computes encrypted average after five participants", async function () {
    for (let i = 0; i < 5; i++) {
      await submitSalary(contract, signers[i], SALARIES[i]);
    }

    expect(await contract.getBucketCount(categoryId)).to.equal(5);
    expect(await contract.isAverageComputed(categoryId)).to.equal(true);
  });

  /*************** Personal Comparison ***************/

  it("lets a user learn if they are above the encrypted average", async function () {
    for (let i = 0; i < 5; i++) {
      await submitSalary(contract, signers[i], SALARIES[i]);
    }

    const highEarner = signers[4];
    const lowEarner = signers[0];
    const contractAddress = await contract.getAddress();

    await (await contract.connect(highEarner).compareToAverage()).wait();
    await (await contract.connect(lowEarner).compareToAverage()).wait();

    const highHandle = await contract.getAboveAverageHandle(highEarner.address);
    const lowHandle = await contract.getAboveAverageHandle(lowEarner.address);

    const highAbove = await fhevm.userDecryptEbool(highHandle, contractAddress, highEarner);
    const lowAbove = await fhevm.userDecryptEbool(lowHandle, contractAddress, lowEarner);

    expect(highAbove).to.equal(true);
    expect(lowAbove).to.equal(false);
  });

  /*************** Public Average Release ***************/

  it("finalizes tier-5 public average via the three-step decrypt flow", async function () {
    for (let i = 0; i < 5; i++) {
      await submitSalary(contract, signers[i], SALARIES[i]);
    }

    const tier = 5n;
    await (await contract.requestAverageRelease(categoryId, tier)).wait();

    const averageHandle = await contract.getTierAverageHandle(categoryId, tier);
    const results = await fhevm.publicDecrypt([averageHandle]);
    const clearAverage = results.clearValues[averageHandle as `0x${string}`] as bigint;
    expect(clearAverage).to.equal(EXPECTED_AVG);

    await (
      await contract.finalizeAverage(categoryId, tier, Number(clearAverage), results.decryptionProof)
    ).wait();

    expect(await contract.isTierFinalized(categoryId, tier)).to.equal(true);
    expect(await contract.getClearAverage(categoryId, tier)).to.equal(Number(EXPECTED_AVG));
    expect(await contract.getLatestFinalizedTier(categoryId)).to.equal(tier);
  });

  it("supports tier-10 publish after ten participants", async function () {
    for (let i = 0; i < 10; i++) {
      await submitSalary(contract, signers[i % signers.length], SALARIES[i % SALARIES.length]);
    }

    const tier = 10n;
    expect(await contract.isTierSnapshotReady(categoryId, tier)).to.equal(true);

    await (await contract.requestAverageRelease(categoryId, tier)).wait();
    const averageHandle = await contract.getTierAverageHandle(categoryId, tier);
    const results = await fhevm.publicDecrypt([averageHandle]);
    const clearAverage = results.clearValues[averageHandle as `0x${string}`] as bigint;

    await (
      await contract.finalizeAverage(categoryId, tier, Number(clearAverage), results.decryptionProof)
    ).wait();

    expect(await contract.isTierFinalized(categoryId, tier)).to.equal(true);
    expect(await contract.getLatestFinalizedTier(categoryId)).to.equal(tier);
  });

  it("rejects publish for non-tier participant counts", async function () {
    for (let i = 0; i < 7; i++) {
      await submitSalary(contract, signers[i], SALARIES[i % SALARIES.length]);
    }

    await expect(contract.requestAverageRelease(categoryId, 7n)).to.be.revertedWithCustomError(
      contract,
      "InvalidTier"
    );
  });

  it("keeps private comparison on the live average after tier publish", async function () {
    for (let i = 0; i < 5; i++) {
      await submitSalary(contract, signers[i], SALARIES[i]);
    }

    await (await contract.requestAverageRelease(categoryId, 5n)).wait();
    const tierHandle = await contract.getTierAverageHandle(categoryId, 5n);
    const tierResults = await fhevm.publicDecrypt([tierHandle]);
    const tierClear = tierResults.clearValues[tierHandle as `0x${string}`] as bigint;
    await (
      await contract.finalizeAverage(
        categoryId,
        5n,
        Number(tierClear),
        tierResults.decryptionProof
      )
    ).wait();

    await submitSalary(contract, signers[5], 200_000n);

    const highEarner = signers[5];
    const contractAddress = await contract.getAddress();
    await (await contract.connect(highEarner).compareToAverage()).wait();
    const handle = await contract.getAboveAverageHandle(highEarner.address);
    const above = await fhevm.userDecryptEbool(handle, contractAddress, highEarner);
    expect(above).to.equal(true);
  });

  /*************** Company Benchmark ***************/

  it("feeds the market pool from company submissions and aggregates the company bucket", async function () {
    const company = signers[0];
    for (let i = 0; i < 4; i++) {
      await submitCompanySalary(contract, company, 90_000n);
    }

    expect(await contract.getCompanyBucketCount(company.address, categoryId)).to.equal(4);
    expect(await contract.getBucketCount(categoryId)).to.equal(4);
  });

  it("rejects company benchmark before five employees are submitted", async function () {
    for (let i = 0; i < 5; i++) {
      await submitSalary(contract, signers[i], SALARIES[i]);
    }

    const company = signers[6];
    for (let i = 0; i < 3; i++) {
      await submitCompanySalary(contract, company, 95_000n);
    }

    await expect(
      contract.connect(company).computeCompanyComparison(POSITION_BACKEND, CITY_ISTANBUL, EXP_3_5)
    ).to.be.revertedWithCustomError(contract, "CompanyNotEnoughEmployees");
  });

  it("lets companies privately learn if they pay above or below the market", async function () {
    const contractAddress = await contract.getAddress();

    for (let i = 0; i < 5; i++) {
      await submitSalary(contract, signers[i], 80_000n);
    }

    const companyHigh = signers[5];
    const companyLow = signers[6];

    for (let i = 0; i < 5; i++) {
      await submitCompanySalary(contract, companyHigh, 160_000n);
    }
    for (let i = 0; i < 5; i++) {
      await submitCompanySalary(contract, companyLow, 40_000n);
    }

    await (
      await contract
        .connect(companyHigh)
        .computeCompanyComparison(POSITION_BACKEND, CITY_ISTANBUL, EXP_3_5)
    ).wait();
    await (
      await contract
        .connect(companyLow)
        .computeCompanyComparison(POSITION_BACKEND, CITY_ISTANBUL, EXP_3_5)
    ).wait();

    expect(await contract.isCompanyComparisonReady(companyHigh.address, categoryId)).to.equal(true);

    const highHandle = await contract.getCompanyAboveMarketHandle(companyHigh.address, categoryId);
    const lowHandle = await contract.getCompanyAboveMarketHandle(companyLow.address, categoryId);

    const highAbove = await fhevm.userDecryptEbool(highHandle, contractAddress, companyHigh);
    const lowAbove = await fhevm.userDecryptEbool(lowHandle, contractAddress, companyLow);

    expect(highAbove).to.equal(true);
    expect(lowAbove).to.equal(false);
  });

  /*************** Category Id Hashing ***************/

  it("matches the off-chain (frontend) category id hashing", async function () {
    const tuples: Array<[number, number, number]> = [
      [0, 0, 0],
      [POSITION_BACKEND, CITY_ISTANBUL, EXP_3_5],
      [7, 40, 3],
      [34, 54, 5],
    ];

    for (const [position, city, seniority] of tuples) {
      const onChain = await contract.computeCategoryId(position, city, seniority);
      expect(onChain).to.equal(offChainCategoryId(position, city, seniority));
    }
  });

  it("rejects out-of-range category indices", async function () {
    await expect(contract.computeCategoryId(35, 0, 0)).to.be.revertedWithCustomError(
      contract,
      "InvalidPosition"
    );
    await expect(contract.computeCategoryId(0, 55, 0)).to.be.revertedWithCustomError(
      contract,
      "InvalidCity"
    );
    await expect(contract.computeCategoryId(0, 0, 6)).to.be.revertedWithCustomError(
      contract,
      "InvalidSeniority"
    );
  });
});
