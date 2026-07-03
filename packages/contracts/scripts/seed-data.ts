/**
 * @file seed-data.ts
 * @description Ten demo categories and salary spreads for Sepolia seeding (10 wallets each).
 */

export interface SeedCategory {
  label: string;
  positionId: number;
  cityId: number;
  seniorityId: number;
  salariesUsd: number[];
}

/** Ten salaries per category — wallet index i uses salariesUsd[i % 10]. */
export const SEED_CATEGORIES: SeedCategory[] = [
  {
    label: "Senior Backend Engineer · Istanbul",
    positionId: 1,
    cityId: 27,
    seniorityId: 3,
    salariesUsd: [62_000, 68_000, 74_000, 80_000, 86_000, 92_000, 98_000, 104_000, 110_000, 116_000],
  },
  {
    label: "Mid-level Frontend Engineer · Berlin",
    positionId: 0,
    cityId: 15,
    seniorityId: 2,
    salariesUsd: [52_000, 56_000, 60_000, 64_000, 68_000, 72_000, 76_000, 80_000, 84_000, 88_000],
  },
  {
    label: "Senior Fullstack Engineer · Remote",
    positionId: 2,
    cityId: 0,
    seniorityId: 3,
    salariesUsd: [90_000, 95_000, 100_000, 105_000, 110_000, 115_000, 120_000, 125_000, 130_000, 135_000],
  },
  {
    label: "Senior DevOps Engineer · London",
    positionId: 4,
    cityId: 14,
    seniorityId: 3,
    salariesUsd: [85_000, 90_000, 95_000, 100_000, 105_000, 110_000, 115_000, 120_000, 125_000, 130_000],
  },
  {
    label: "Mid-level Data Engineer · Bangalore",
    positionId: 8,
    cityId: 37,
    seniorityId: 2,
    salariesUsd: [22_000, 26_000, 30_000, 34_000, 38_000, 42_000, 46_000, 50_000, 54_000, 58_000],
  },
  {
    label: "Senior ML Engineer · San Francisco",
    positionId: 10,
    cityId: 2,
    seniorityId: 3,
    salariesUsd: [180_000, 190_000, 200_000, 210_000, 220_000, 230_000, 240_000, 250_000, 260_000, 270_000],
  },
  {
    label: "Senior Security Engineer · Tel Aviv",
    positionId: 13,
    cityId: 31,
    seniorityId: 3,
    salariesUsd: [120_000, 125_000, 130_000, 135_000, 140_000, 145_000, 150_000, 155_000, 160_000, 165_000],
  },
  {
    label: "Mid-level Mobile Engineer · Amsterdam",
    positionId: 3,
    cityId: 16,
    seniorityId: 2,
    salariesUsd: [48_000, 52_000, 56_000, 60_000, 64_000, 68_000, 72_000, 76_000, 80_000, 84_000],
  },
  {
    label: "Senior Blockchain Engineer · Dubai",
    positionId: 18,
    cityId: 30,
    seniorityId: 3,
    salariesUsd: [95_000, 102_000, 109_000, 116_000, 123_000, 130_000, 137_000, 144_000, 151_000, 158_000],
  },
  {
    label: "Lead Engineering Manager · London",
    positionId: 20,
    cityId: 14,
    seniorityId: 4,
    salariesUsd: [140_000, 148_000, 156_000, 164_000, 172_000, 180_000, 188_000, 196_000, 204_000, 212_000],
  },
];

export const WALLETS_PER_CATEGORY = 10;

export function expectedAverage(salaries: number[]): number {
  const sum = salaries.reduce((a, b) => a + b, 0);
  return Math.round(sum / salaries.length);
}
