/*
 * The order of every list below is the on-chain index for that dimension. Never reorder or remove
 * an item after deployment; only append. Lengths must match the *_COUNT constants in
 * packages/contracts/contracts/lib/Categories.sol.
 */

import { encodeAbiParameters, keccak256 } from "viem";

export const POSITIONS = [
  "Frontend Engineer",
  "Backend Engineer",
  "Fullstack Engineer",
  "Mobile Engineer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Cloud Engineer",
  "Platform Engineer",
  "Data Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Researcher",
  "Data Analyst",
  "Security Engineer",
  "QA Engineer",
  "Test Automation Engineer",
  "Embedded Engineer",
  "Game Developer",
  "Blockchain Engineer",
  "Solutions Architect",
  "Engineering Manager",
  "Product Manager",
  "Product Designer",
  "UX Researcher",
  "UI Designer",
  "Technical Writer",
  "Database Administrator",
  "Network Engineer",
  "Systems Administrator",
  "Support Engineer",
  "Sales Engineer",
  "Developer Advocate",
  "Project Manager",
  "IT Manager",
  "Other",
] as const;

export const CITIES = [
  "Remote",
  /* North America */
  "New York",
  "San Francisco",
  "Los Angeles",
  "Seattle",
  "Austin",
  "Boston",
  "Toronto",
  "Vancouver",
  "Mexico City",
  /* South America */
  "Sao Paulo",
  "Buenos Aires",
  "Bogota",
  "Santiago",
  /* Europe */
  "London",
  "Berlin",
  "Amsterdam",
  "Paris",
  "Dublin",
  "Madrid",
  "Barcelona",
  "Lisbon",
  "Stockholm",
  "Zurich",
  "Munich",
  "Warsaw",
  "Bucharest",
  /* Turkey & MENA */
  "Istanbul",
  "Ankara",
  "Izmir",
  "Dubai",
  "Tel Aviv",
  "Cairo",
  /* Africa */
  "Lagos",
  "Nairobi",
  "Cape Town",
  "Johannesburg",
  /* Asia */
  "Bangalore",
  "Mumbai",
  "Hyderabad",
  "Singapore",
  "Tokyo",
  "Seoul",
  "Shanghai",
  "Beijing",
  "Shenzhen",
  "Hong Kong",
  "Jakarta",
  "Manila",
  "Ho Chi Minh City",
  /* Oceania */
  "Sydney",
  "Melbourne",
  "Other",
] as const;

export const SENIORITY_LEVELS = [
  "Intern",
  "Junior",
  "Mid-level",
  "Senior",
  "Lead",
  "Principal / Staff",
] as const;

export const MIN_PARTICIPANTS = 5;

/** Next tier boundary for progress display (5, 10, 15, ...). */
export function nextTierTarget(participants: number): number {
  if (participants < MIN_PARTICIPANTS) return MIN_PARTICIPANTS;
  return Math.ceil(participants / MIN_PARTICIPANTS) * MIN_PARTICIPANTS;
}

/** Lowest eligible tier that has not been finalized yet (5, 10, 15, ...). */
export function nextPublishTier(participants: number, isTierFinalized: (tier: number) => boolean): number | null {
  if (participants < MIN_PARTICIPANTS) return null;
  const maxTier = Math.floor(participants / MIN_PARTICIPANTS) * MIN_PARTICIPANTS;
  for (let tier = MIN_PARTICIPANTS; tier <= maxTier; tier += MIN_PARTICIPANTS) {
    if (!isTierFinalized(tier)) return tier;
  }
  return null;
}

/*
 * Mirrors Categories.categoryId on-chain: uint256(keccak256(abi.encode(uint16, uint16, uint16))).
 * The uint16 parameter types must match the Solidity tuple exactly so the hash lines up.
 */
export function computeCategoryId(
  positionId: number,
  cityId: number,
  seniorityId: number
): bigint {
  const encoded = encodeAbiParameters(
    [{ type: "uint16" }, { type: "uint16" }, { type: "uint16" }],
    [positionId, cityId, seniorityId]
  );
  return BigInt(keccak256(encoded));
}
