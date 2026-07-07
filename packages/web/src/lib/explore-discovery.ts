import { keccak256, stringToBytes } from "viem";
import deployment from "@/abi/deployment.json";
import { CONTRACT_ADDRESS } from "@/lib/contract";

export const SALARY_SUBMITTED_TOPIC = keccak256(
  stringToBytes("SalarySubmitted(address,uint256,uint256)")
);

export const COMPANY_SALARY_SUBMITTED_TOPIC = keccak256(
  stringToBytes("CompanySalarySubmitted(address,uint256,uint256)")
);

export const AVERAGE_FINALIZED_TOPIC = keccak256(
  stringToBytes("AverageFinalized(uint256,uint256,uint64)")
);

const ETHERSCAN_V2 = "https://api.etherscan.io/v2/api";
const SEPOLIA_CHAIN_ID = "11155111";
const LOG_PAGE_SIZE = 1000;

export interface DiscoveredCategory {
  categoryId: string;
  participantCount: number;
}

interface EtherscanLog {
  topics: string[];
  data: string;
}

function deployBlock(): string {
  if ("deployBlock" in deployment && deployment.deployBlock != null) {
    return String(deployment.deployBlock);
  }
  return "0";
}

function mergeSubmitLog(counts: Map<string, number>, log: EtherscanLog) {
  if (log.topics.length < 3) return;
  const categoryId = BigInt(log.topics[2]).toString();
  const count = Number(BigInt(log.data));
  counts.set(categoryId, Math.max(counts.get(categoryId) ?? 0, count));
}

function mergeFinalizedLog(counts: Map<string, number>, log: EtherscanLog) {
  if (log.topics.length < 2) return;
  const categoryId = BigInt(log.topics[1]).toString();
  if (!counts.has(categoryId)) counts.set(categoryId, 0);
}

async function fetchEtherscanLogs(apiKey: string, topic0: string): Promise<EtherscanLog[]> {
  const logs: EtherscanLog[] = [];
  let page = 1;

  while (true) {
    const params = new URLSearchParams({
      chainid: SEPOLIA_CHAIN_ID,
      module: "logs",
      action: "getLogs",
      address: CONTRACT_ADDRESS,
      fromBlock: deployBlock(),
      toBlock: "latest",
      topic0,
      page: String(page),
      offset: String(LOG_PAGE_SIZE),
      apikey: apiKey,
    });

    const response = await fetch(`${ETHERSCAN_V2}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Etherscan HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      status: string;
      message: string;
      result: EtherscanLog[] | string;
    };

    if (payload.status !== "1" || !Array.isArray(payload.result)) {
      if (payload.message === "No records found") return logs;
      throw new Error(payload.message || "Etherscan getLogs failed");
    }

    logs.push(...payload.result);
    if (payload.result.length < LOG_PAGE_SIZE) break;
    page += 1;
  }

  return logs;
}

/**
 * Discover live pools from SalaryFHE contract event logs via Etherscan.
 * Avoids RPC eth_getLogs block-range limits (Alchemy free tier, PublicNode archive).
 */
export async function discoverCategoriesFromContractLogs(
  apiKey: string
): Promise<DiscoveredCategory[]> {
  const [salaryLogs, companyLogs, finalizedLogs] = await Promise.all([
    fetchEtherscanLogs(apiKey, SALARY_SUBMITTED_TOPIC),
    fetchEtherscanLogs(apiKey, COMPANY_SALARY_SUBMITTED_TOPIC),
    fetchEtherscanLogs(apiKey, AVERAGE_FINALIZED_TOPIC),
  ]);

  const counts = new Map<string, number>();
  for (const log of salaryLogs) mergeSubmitLog(counts, log);
  for (const log of companyLogs) mergeSubmitLog(counts, log);
  for (const log of finalizedLogs) mergeFinalizedLog(counts, log);

  return [...counts.entries()].map(([categoryId, participantCount]) => ({
    categoryId,
    participantCount,
  }));
}
