import type { FoodCatalogGateway } from '@/modules/clinical-registry/application/FoodCatalogGateway';
import type { components } from '@/shared/infrastructure/api/generated/schema';

type FoodItemSummary = components['schemas']['FoodItemSummary'];

// Synthetic catalog foods; «Lácteos con lactosa» mirrors the literal of CP047 and CP086.
export const DAIRY_ID = '00000000-0000-4000-8000-0000000000f9';
export const MILK_ID = '00000000-0000-4000-8000-0000000000fa';

export function foodBody(overrides: Partial<FoodItemSummary> = {}): FoodItemSummary {
  return {
    foodId: DAIRY_ID,
    name: 'Lácteos con lactosa',
    category: 'lacteos',
    fodmapLevel: 'High',
    isPeruvian: false,
    ...overrides,
  };
}

export const dairyResults: FoodItemSummary[] = [
  foodBody(),
  foodBody({ foodId: MILK_ID, name: 'Leche sin lactosa', fodmapLevel: 'Low' }),
];

// Searches never resolve unless a test provides its own.
export function fakeFoodCatalogGateway(
  overrides: Partial<FoodCatalogGateway> = {},
): FoodCatalogGateway {
  return {
    search: () => new Promise(() => undefined),
    ...overrides,
  };
}
