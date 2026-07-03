import {
  CITIES,
  POSITIONS,
  SENIORITY_LEVELS,
  computeCategoryId,
} from "@/lib/categories";

export interface CategoryRef {
  positionId: number;
  cityId: number;
  seniorityId: number;
  categoryId: string;
  label: string;
}

const CATEGORY_BY_ID = new Map<string, CategoryRef>();

for (let positionId = 0; positionId < POSITIONS.length; positionId += 1) {
  for (let cityId = 0; cityId < CITIES.length; cityId += 1) {
    for (let seniorityId = 0; seniorityId < SENIORITY_LEVELS.length; seniorityId += 1) {
      const categoryId = computeCategoryId(positionId, cityId, seniorityId).toString();
      CATEGORY_BY_ID.set(categoryId, {
        positionId,
        cityId,
        seniorityId,
        categoryId,
        label: `${SENIORITY_LEVELS[seniorityId]} ${POSITIONS[positionId]} · ${CITIES[cityId]}`,
      });
    }
  }
}

export function resolveCategory(categoryId: string): CategoryRef | null {
  return CATEGORY_BY_ID.get(categoryId) ?? null;
}

export function categoryLabel(positionId: number, cityId: number, seniorityId: number): string {
  return `${SENIORITY_LEVELS[seniorityId]} ${POSITIONS[positionId]} · ${CITIES[cityId]}`;
}
