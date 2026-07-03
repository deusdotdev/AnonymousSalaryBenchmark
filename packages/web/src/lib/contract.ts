import type { Abi } from "viem";
import deployment from "@/abi/deployment.json";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

function resolveContractAddress(): `0x${string}` {
  const fromEnv = process.env.NEXT_PUBLIC_SALARY_FHE_ADDRESS;
  if (fromEnv && fromEnv !== ZERO) {
    return fromEnv as `0x${string}`;
  }
  const fromDeployment = deployment.address;
  if (fromDeployment && fromDeployment !== ZERO) {
    return fromDeployment as `0x${string}`;
  }
  return ZERO;
}

/* Override via NEXT_PUBLIC_SALARY_FHE_ADDRESS; else packages/web/src/abi/deployment.json */
export const CONTRACT_ADDRESS = resolveContractAddress();

export const salaryFheAbi = [
  {
    type: "function",
    name: "submitSalary",
    inputs: [
      { name: "positionId", type: "uint16" },
      { name: "cityId", type: "uint16" },
      { name: "seniorityId", type: "uint16" },
      { name: "encSalary", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "compareToAverage",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitCompanySalary",
    inputs: [
      { name: "positionId", type: "uint16" },
      { name: "cityId", type: "uint16" },
      { name: "seniorityId", type: "uint16" },
      { name: "encSalary", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "computeCompanyComparison",
    inputs: [
      { name: "positionId", type: "uint16" },
      { name: "cityId", type: "uint16" },
      { name: "seniorityId", type: "uint16" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getCompanyBucketCount",
    inputs: [
      { name: "company", type: "address" },
      { name: "categoryId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isCompanyComparisonReady",
    inputs: [
      { name: "company", type: "address" },
      { name: "categoryId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCompanyAboveMarketHandle",
    inputs: [
      { name: "company", type: "address" },
      { name: "categoryId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "requestAverageRelease",
    inputs: [
      { name: "categoryId", type: "uint256" },
      { name: "tier", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "finalizeAverage",
    inputs: [
      { name: "categoryId", type: "uint256" },
      { name: "tier", type: "uint256" },
      { name: "clearAverage", type: "uint64" },
      { name: "decryptionProof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "computeCategoryId",
    inputs: [
      { name: "positionId", type: "uint16" },
      { name: "cityId", type: "uint16" },
      { name: "seniorityId", type: "uint16" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getBucketCount",
    inputs: [{ name: "categoryId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isAverageComputed",
    inputs: [{ name: "categoryId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getClearAverage",
    inputs: [
      { name: "categoryId", type: "uint256" },
      { name: "tier", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isTierFinalized",
    inputs: [
      { name: "categoryId", type: "uint256" },
      { name: "tier", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isTierSnapshotReady",
    inputs: [
      { name: "categoryId", type: "uint256" },
      { name: "tier", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLatestFinalizedTier",
    inputs: [{ name: "categoryId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTierAverageHandle",
    inputs: [
      { name: "categoryId", type: "uint256" },
      { name: "tier", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAverageHandle",
    inputs: [{ name: "categoryId", type: "uint256" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAboveAverageHandle",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasSubmitted",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "comparisonReady",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const satisfies Abi;
